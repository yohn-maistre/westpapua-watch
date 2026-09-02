export type ChatPurpose='fast'|'synthesis'|'ask';
export type ModelErrorCode='quota'|'malformed'|'transport'|'unconfigured';

export class ModelRequestError extends Error{
  code:ModelErrorCode;
  status?:number;
  constructor(code:ModelErrorCode,message:string,status?:number){super(message);this.name='ModelRequestError';this.code=code;this.status=status}
}

export const modelNameFor=(env:any,purpose:ChatPurpose)=>purpose==='ask'
  ?(env.ANSWER_MODEL||'@cf/google/gemma-4-26b-a4b-it')
  :purpose==='synthesis'
    ?(env.SYNTH_MODEL||'@cf/google/gemma-4-26b-a4b-it')
    :(env.FAST_MODEL||'@cf/qwen/qwen3-30b-a3b-fp8');

const routeFor=(env:any,purpose:ChatPurpose)=>purpose==='ask'
  ?(env.AI_GATEWAY_ASK_MODEL||'dynamic/watch-ask')
  :purpose==='synthesis'
    ?(env.AI_GATEWAY_SYNTH_MODEL||'dynamic/watch-synth')
    :(env.AI_GATEWAY_FAST_MODEL||'dynamic/watch-fast');

export const modelLabelFor=(env:any,purpose:ChatPurpose)=>env.AI_GATEWAY_BASE&&env.AI_GATEWAY_TOKEN
  ?`gateway:${routeFor(env,purpose)}`:modelNameFor(env,purpose);

const errorText=(e:any)=>String(e?.message||e||'unknown error').replace(/\s+/g,' ').slice(0,900);
export const isGatewayQuotaError=(e:any)=>e instanceof ModelRequestError?e.code==='quota':/HTTP 429|resource_exhausted|quota exceeded|rate limit/i.test(errorText(e));
export const isMalformedOutputError=(e:any)=>e instanceof ModelRequestError&&e.code==='malformed';
const workersFallbackEnabled=(env:any)=>String(env.ENABLE_WORKERS_AI_FALLBACK||'false').toLowerCase()==='true';

function validateRequired(value:any,schema:any){
  if(value===null||value===undefined)throw new Error('structured output is empty');
  if(schema?.type==='array'&&!Array.isArray(value))throw new Error('structured output was not an array');
  if(schema?.type==='object'){
    if(typeof value!=='object'||Array.isArray(value))throw new Error('structured output was not an object');
    const missing=(schema?.required||[]).filter((key:string)=>!(key in value));
    if(missing.length)throw new Error(`structured output missing required fields: ${missing.join(', ')}`);
  }
  return value;
}

function stripFence(raw:string){
  let text=String(raw||'').replace(/^\uFEFF/,'').trim();
  const fenced=text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if(fenced)text=fenced[1].trim();
  return text;
}

function balancedJson(raw:string){
  const text=stripFence(raw);
  const openers:{[k:string]:string}={'{':'}','[':']'};
  for(let start=0;start<text.length;start++){
    const first=text[start];if(!(first in openers))continue;
    const stack:string[]=[];let inString=false,escape=false;
    for(let i=start;i<text.length;i++){
      const ch=text[i];
      if(inString){if(escape){escape=false;continue}if(ch==='\\'){escape=true;continue}if(ch==='"')inString=false;continue}
      if(ch==='"'){inString=true;continue}
      if(ch==='{'||ch==='[')stack.push(openers[ch]);
      else if(ch==='}'||ch===']'){
        if(stack.pop()!==ch)break;
        if(!stack.length)return text.slice(start,i+1);
      }
    }
  }
  return null;
}

export function parseStructured<T>(raw:string,schema:any):T{
  const clean=stripFence(raw);
  try{return validateRequired(JSON.parse(clean),schema) as T}catch(first:any){
    const fragment=balancedJson(clean);
    if(!fragment)throw new ModelRequestError('malformed',`no balanced JSON (${errorText(first)})`);
    try{return validateRequired(JSON.parse(fragment),schema) as T}catch(second:any){
      throw new ModelRequestError('malformed',`invalid structured JSON (${errorText(second)})`);
    }
  }
}

function structuredResponseFormat(schema:any){
  return {type:'json_schema',json_schema:{name:'watch_output',strict:true,schema}};
}

async function gatewayCall(env:any,messages:any[],purpose:ChatPurpose,maxTokens:number,responseFormat?:any){
  const gateway=env.AI_GATEWAY_BASE?.replace(/\/$/,'');
  const token=env.AI_GATEWAY_TOKEN;
  if(!gateway||!token)throw new ModelRequestError('unconfigured','AI Gateway is not configured');
  let res:Response;
  try{
    res=await fetch(`${gateway}/chat/completions`,{
      method:'POST',
      headers:{'cf-aig-authorization':`Bearer ${token}`,'content-type':'application/json','cf-aig-collect-log-payload':'false'},
      body:JSON.stringify({
        model:routeFor(env,purpose),messages,
        temperature:purpose==='synthesis'?.16:.05,max_tokens:maxTokens,
        ...(purpose!=='synthesis'?{reasoning_effort:'none'}:{}),
        ...(responseFormat?{response_format:responseFormat}:{})
      }),
      signal:AbortSignal.timeout(85000)
    });
  }catch(e){throw new ModelRequestError('transport',`gateway transport: ${errorText(e)}`)}
  const servedProvider=res.headers.get('cf-aig-provider')||'';
  const servedModel=res.headers.get('cf-aig-model')||'';
  const servedStep=res.headers.get('cf-aig-step')||'';
  if(!res.ok){
    const detail=(await res.text().catch(()=>'' )).replace(/\s+/g,' ').slice(0,420);
    if(res.status===429||/resource_exhausted|quota exceeded|rate limit/i.test(detail))throw new ModelRequestError('quota',`gateway HTTP ${res.status}${detail?`: ${detail}`:''}`,res.status);
    throw new ModelRequestError('transport',`gateway HTTP ${res.status}${detail?`: ${detail}`:''}`,res.status);
  }
  console.info('AI Gateway served request',{purpose,provider:servedProvider||'unknown',model:servedModel||'unknown',step:servedStep||'unknown'});
  const data:any=await res.json().catch(e=>{throw new ModelRequestError('malformed',`gateway response JSON invalid: ${errorText(e)}`)});
  const raw=data?.choices?.[0]?.message?.content;
  if(!raw)throw new ModelRequestError('malformed','gateway returned empty content');
  return String(raw);
}

export async function runChat(env:any,messages:any[],purpose:ChatPurpose='fast',maxTokens=500):Promise<string>{
  if(env.AI_GATEWAY_BASE&&env.AI_GATEWAY_TOKEN)return gatewayCall(env,messages,purpose,maxTokens);
  if(!workersFallbackEnabled(env))throw new ModelRequestError('unconfigured','AI Gateway is not configured and Workers AI fallback is disabled');
  try{
    const result:any=await env.AI.run(modelNameFor(env,purpose),{messages,temperature:purpose==='synthesis'?.16:.05,max_tokens:maxTokens});
    const value=result?.response||result?.choices?.[0]?.message?.content;
    if(!value)throw new Error('empty content');
    return String(value);
  }catch(e){throw new ModelRequestError('transport',`Workers AI failed: ${errorText(e)}`)}
}

export async function runJson<T=any>(env:any,messages:any[],schema:any,purpose:ChatPurpose='fast',maxTokens=500):Promise<T>{
  // Critical invariant: one logical structured operation issues at most one remote inference request.
  // Parsing/salvage below is local only; malformed output is durable state for a future cycle.
  if(env.AI_GATEWAY_BASE&&env.AI_GATEWAY_TOKEN){
    const raw=await gatewayCall(env,messages,purpose,maxTokens,structuredResponseFormat(schema));
    return parseStructured<T>(raw,schema);
  }
  if(!workersFallbackEnabled(env))throw new ModelRequestError('unconfigured','AI Gateway is not configured and Workers AI fallback is disabled');
  try{
    const result:any=await env.AI.run(modelNameFor(env,purpose),{
      messages,temperature:purpose==='synthesis'?.16:.05,max_tokens:maxTokens,
      response_format:{type:'json_schema',json_schema:{name:'watch_output',strict:true,schema}}
    });
    const value=result?.response??result?.choices?.[0]?.message?.content;
    if(value&&typeof value==='object')return validateRequired(value,schema) as T;
    if(!value)throw new ModelRequestError('malformed','Workers AI returned empty structured content');
    return parseStructured<T>(String(value),schema);
  }catch(e){if(e instanceof ModelRequestError)throw e;throw new ModelRequestError('transport',`Workers AI failed: ${errorText(e)}`)}
}
