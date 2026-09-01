export type ChatPurpose='fast'|'synthesis'|'ask';

const JSON_MODE_MODELS=new Set([
  '@cf/meta/llama-3.1-8b-instruct-fast',
  '@cf/meta/llama-3.1-70b-instruct',
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  '@cf/meta/llama-3-8b-instruct',
  '@cf/meta/llama-3.1-8b-instruct',
  '@cf/meta/llama-3.2-11b-vision-instruct',
  '@hf/nousresearch/hermes-2-pro-mistral-7b',
  '@hf/thebloke/deepseek-coder-6.7b-instruct-awq',
  '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b'
]);

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

const errorText=(e:any)=>String(e?.message||e||'unknown error').replace(/\s+/g,' ').slice(0,600);

function validateRequired(value:any,schema:any){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('structured output was not an object');
  const missing=(schema?.required||[]).filter((key:string)=>!(key in value));
  if(missing.length)throw new Error(`structured output missing required fields: ${missing.join(', ')}`);
  return value;
}

function stripFence(raw:string){
  let text=String(raw||'').replace(/^\uFEFF/,'').trim();
  const fenced=text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if(fenced)text=fenced[1].trim();
  return text;
}

function balancedObject(raw:string){
  const text=stripFence(raw);
  let start=-1,depth=0,inString=false,escape=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(inString){
      if(escape){escape=false;continue}
      if(ch==='\\'){escape=true;continue}
      if(ch==='"')inString=false;
      continue;
    }
    if(ch==='"'){inString=true;continue}
    if(ch==='{'){
      if(start<0)start=i;
      depth++;
      continue;
    }
    if(ch==='}'&&start>=0){
      depth--;
      if(depth===0)return text.slice(start,i+1);
    }
  }
  return null;
}

function parseStructured<T>(raw:string,schema:any):T{
  const clean=stripFence(raw);
  try{return validateRequired(JSON.parse(clean),schema) as T}catch(first:any){
    const object=balancedObject(clean);
    if(!object)throw new Error(`no balanced JSON object (${errorText(first)})`);
    try{return validateRequired(JSON.parse(object),schema) as T}catch(second:any){
      throw new Error(`invalid JSON object (${errorText(second)})`);
    }
  }
}

function strictJsonMessages(messages:any[],schema:any){
  const instruction=`Return ONLY one valid JSON object. No markdown fences, commentary, preamble or trailing text. The object MUST satisfy this JSON Schema exactly:\n${JSON.stringify(schema)}`;
  return [{role:'system',content:instruction},...messages];
}

export async function runChat(env:any,messages:any[],purpose:ChatPurpose='fast',maxTokens=500):Promise<string>{
  const gateway=env.AI_GATEWAY_BASE?.replace(/\/$/,'');
  const token=env.AI_GATEWAY_TOKEN;
  if(gateway&&token){
    const res=await fetch(`${gateway}/chat/completions`,{
      method:'POST',
      headers:{'cf-aig-authorization':`Bearer ${token}`,'content-type':'application/json','cf-aig-collect-log-payload':'false'},
      body:JSON.stringify({model:routeFor(env,purpose),messages,temperature:purpose==='synthesis'?.22:.12,max_tokens:maxTokens}),
      signal:AbortSignal.timeout(24000)
    });
    if(res.ok){
      const data:any=await res.json();
      const value=data?.choices?.[0]?.message?.content;
      if(value)return String(value);
    }
  }
  const result:any=await env.AI.run(modelNameFor(env,purpose),{messages,temperature:purpose==='synthesis'?.22:.12,max_tokens:maxTokens});
  return String(result?.response||result?.choices?.[0]?.message?.content||'');
}

export async function runJson<T=any>(env:any,messages:any[],schema:any,purpose:ChatPurpose='fast',maxTokens=500):Promise<T>{
  const errors:string[]=[];
  const gateway=env.AI_GATEWAY_BASE?.replace(/\/$/,'');
  const token=env.AI_GATEWAY_TOKEN;
  const constrained=strictJsonMessages(messages,schema);

  if(gateway&&token){
    try{
      const res=await fetch(`${gateway}/chat/completions`,{
        method:'POST',
        headers:{'cf-aig-authorization':`Bearer ${token}`,'content-type':'application/json','cf-aig-collect-log-payload':'false'},
        body:JSON.stringify({model:routeFor(env,purpose),messages:constrained,temperature:purpose==='synthesis'?.18:.08,max_tokens:maxTokens,response_format:{type:'json_object'}}),
        signal:AbortSignal.timeout(24000)
      });
      if(!res.ok)throw new Error(`gateway HTTP ${res.status}`);
      const data:any=await res.json();
      const raw=data?.choices?.[0]?.message?.content;
      if(!raw)throw new Error('gateway returned empty content');
      return parseStructured<T>(String(raw),schema);
    }catch(e){errors.push(`gateway_json: ${errorText(e)}`)}
  }

  const model=modelNameFor(env,purpose);
  if(JSON_MODE_MODELS.has(model)){
    try{
      const result:any=await env.AI.run(model,{messages,temperature:purpose==='synthesis'?.18:.08,max_tokens:maxTokens,response_format:{type:'json_schema',json_schema:schema}});
      const value=result?.response??result?.choices?.[0]?.message?.content;
      if(value&&typeof value==='object')return validateRequired(value,schema) as T;
      if(!value)throw new Error('native JSON mode returned empty content');
      return parseStructured<T>(String(value),schema);
    }catch(e){errors.push(`native_json_schema: ${errorText(e)}`)}
  }else{
    errors.push(`native_json_schema: skipped for ${model}`);
  }

  let raw='';
  try{
    raw=await runChat(env,constrained,purpose,maxTokens);
    if(!raw)throw new Error('prompt JSON fallback returned empty content');
    return parseStructured<T>(raw,schema);
  }catch(e){errors.push(`prompt_json: ${errorText(e)}`)}

  try{
    const repairMessages=[
      {role:'system',content:'Repair malformed model output into one valid JSON object only. Do not add facts or change meaning.'},
      {role:'user',content:`Required JSON Schema:\n${JSON.stringify(schema)}\n\nMalformed output:\n${String(raw||'').slice(0,12000)}\n\nReturn only the repaired JSON object.`}
    ];
    const repaired=await runChat(env,repairMessages,'fast',Math.min(Math.max(maxTokens,700),1500));
    if(!repaired)throw new Error('repair returned empty content');
    return parseStructured<T>(repaired,schema);
  }catch(e){errors.push(`json_repair: ${errorText(e)}`)}

  throw new Error(`Structured output failed: ${errors.join(' | ').slice(0,1800)}`);
}
