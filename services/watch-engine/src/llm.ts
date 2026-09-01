export type ChatPurpose='fast'|'synthesis'|'ask';
const modelFor=(env:any,purpose:ChatPurpose)=>purpose==='ask'?(env.ANSWER_MODEL||'@cf/google/gemma-4-26b-a4b-it'):purpose==='synthesis'?(env.SYNTH_MODEL||'@cf/google/gemma-4-26b-a4b-it'):(env.FAST_MODEL||'@cf/qwen/qwen3-30b-a3b-fp8');
const routeFor=(env:any,purpose:ChatPurpose)=>purpose==='ask'?(env.AI_GATEWAY_ASK_MODEL||'dynamic/watch-ask'):purpose==='synthesis'?(env.AI_GATEWAY_SYNTH_MODEL||'dynamic/watch-synth'):(env.AI_GATEWAY_FAST_MODEL||'dynamic/watch-fast');
export async function runChat(env:any,messages:any[],purpose:ChatPurpose='fast',maxTokens=500):Promise<string>{
  const gateway=env.AI_GATEWAY_BASE?.replace(/\/$/,'');const token=env.AI_GATEWAY_TOKEN;
  if(gateway&&token){const res=await fetch(`${gateway}/chat/completions`,{method:'POST',headers:{'cf-aig-authorization':`Bearer ${token}`,'content-type':'application/json','cf-aig-collect-log-payload':'false'},body:JSON.stringify({model:routeFor(env,purpose),messages,temperature:purpose==='synthesis'?.22:.12,max_tokens:maxTokens}),signal:AbortSignal.timeout(24000)});if(res.ok){const data:any=await res.json();const value=data?.choices?.[0]?.message?.content;if(value)return String(value)}}
  const result:any=await env.AI.run(modelFor(env,purpose),{messages,temperature:purpose==='synthesis'?.22:.12,max_tokens:maxTokens});return String(result?.response||result?.choices?.[0]?.message?.content||'');
}
export async function runJson<T=any>(env:any,messages:any[],schema:any,purpose:ChatPurpose='fast',maxTokens=500):Promise<T>{
  const gateway=env.AI_GATEWAY_BASE?.replace(/\/$/,'');const token=env.AI_GATEWAY_TOKEN;
  if(gateway&&token){try{const res=await fetch(`${gateway}/chat/completions`,{method:'POST',headers:{'cf-aig-authorization':`Bearer ${token}`,'content-type':'application/json','cf-aig-collect-log-payload':'false'},body:JSON.stringify({model:routeFor(env,purpose),messages,temperature:purpose==='synthesis'?.18:.08,max_tokens:maxTokens,response_format:{type:'json_object'}}),signal:AbortSignal.timeout(24000)});if(res.ok){const data:any=await res.json();const raw=data?.choices?.[0]?.message?.content;if(raw)return JSON.parse(String(raw)) as T}}catch{}}
  try{const result:any=await env.AI.run(modelFor(env,purpose),{messages,temperature:purpose==='synthesis'?.18:.08,max_tokens:maxTokens,response_format:{type:'json_schema',json_schema:schema}});const value=result?.response??result?.choices?.[0]?.message?.content;if(value&&typeof value==='object')return value as T;if(value)return JSON.parse(String(value)) as T}catch{}
  const raw=await runChat(env,messages,purpose,maxTokens);const match=raw.match(/\{[\s\S]*\}/);if(!match)throw new Error('Model returned no structured JSON');return JSON.parse(match[0]) as T;
}
