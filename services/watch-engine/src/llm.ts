export type ChatPurpose='fast'|'synthesis'|'ask';
export async function runChat(env:any,messages:any[],purpose:ChatPurpose='fast',maxTokens=500):Promise<string>{
  const gateway=env.AI_GATEWAY_BASE?.replace(/\/$/,'');const token=env.AI_GATEWAY_TOKEN;
  const routedModel=purpose==='ask'?(env.AI_GATEWAY_ASK_MODEL||'dynamic/watch-ask'):purpose==='synthesis'?(env.AI_GATEWAY_SYNTH_MODEL||'dynamic/watch-synth'):(env.AI_GATEWAY_FAST_MODEL||'dynamic/watch-fast');
  if(gateway&&token){
    const res=await fetch(`${gateway}/chat/completions`,{method:'POST',headers:{'cf-aig-authorization':`Bearer ${token}`,'content-type':'application/json','cf-aig-collect-log-payload':'false'},body:JSON.stringify({model:routedModel,messages,temperature:purpose==='synthesis'?.22:.12,max_tokens:maxTokens}),signal:AbortSignal.timeout(24000)});
    if(res.ok){const data:any=await res.json();const text=data?.choices?.[0]?.message?.content;if(text)return String(text)}
  }
  const model=purpose==='ask'?(env.ANSWER_MODEL||'@cf/google/gemma-4-26b-a4b-it'):purpose==='synthesis'?(env.SYNTH_MODEL||'@cf/google/gemma-4-26b-a4b-it'):(env.FAST_MODEL||'@cf/qwen/qwen3-30b-a3b-fp8');
  const result:any=await env.AI.run(model,{messages,temperature:purpose==='synthesis'?.22:.12,max_tokens:maxTokens});return String(result?.response||result?.choices?.[0]?.message?.content||'');
}
