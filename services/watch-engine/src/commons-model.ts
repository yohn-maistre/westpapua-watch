/** Private service-entrypoint adapter for the owner's communal platform.
 * The public Watch router does not expose this handler. Gateway credentials stay
 * in Watch; callers cannot select credentials, an upstream URL or a raw model.
 */
export type CommonsModelEnv={AI_GATEWAY_BASE?:string;AI_GATEWAY_TOKEN?:string;AI_GATEWAY_FAST_MODEL?:string;AI_GATEWAY_SYNTH_MODEL?:string}
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}})
async function bounded(response:Request|Response,max:number){
 const reader=response.body?.getReader();if(!reader)throw Error('Missing body');const parts:Uint8Array[]=[];let size=0
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max)throw Error('Body limit');parts.push(value)}}finally{await reader.cancel().catch(()=>{});reader.releaseLock()}
 const bytes=new Uint8Array(size);let at=0;for(const p of parts){bytes.set(p,at);at+=p.length}return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))
}
export async function commonsCompletion(request:Request,env:CommonsModelEnv,upstream:typeof fetch=fetch):Promise<Response>{
 if(request.method!=='POST'||new URL(request.url).pathname!=='/v1/chat/completions')return json({error:'Not found'},404)
 if(request.headers.get('content-type')?.split(';')[0]!=='application/json')return json({error:'JSON required'},415)
 if(!env.AI_GATEWAY_BASE||!env.AI_GATEWAY_TOKEN)return json({error:'Communal model gateway unavailable'},503)
 let base:URL;try{base=new URL(env.AI_GATEWAY_BASE);if(base.protocol!=='https:'||base.hostname!=='gateway.ai.cloudflare.com'||base.username||base.password||base.search||base.hash||!base.pathname.startsWith('/v1/'))throw Error()}catch{return json({error:'Gateway configuration unavailable'},503)}
 let b:Record<string,unknown>
 try{b=await bounded(request,32768)}catch{return json({error:'Invalid or oversized model input'},400)}
 if(!Array.isArray(b.messages)||b.messages.length<1||b.messages.length>40||b.messages.some(m=>!m||typeof m!=='object'||!['system','user','assistant','tool'].includes(m.role)||(typeof m.content!=='string'&&!(m.role==='assistant'&&m.content===null))||(typeof m.content==='string'&&m.content.length>16000)))return json({error:'Bounded text messages required'},400)
 // Declarations only: tools execute in Pi behind Strata's current authority.
 const allowedTools=new Set(['read_current_sources','research_helper'])
 if(b.tools!==undefined&&(!Array.isArray(b.tools)||b.tools.length>2||b.tools.some(t=>!t||typeof t!=='object'||t.type!=='function'||!allowedTools.has(t.function?.name))))return json({error:'Unsupported resident tool'},400)
 if(b.stream===true)return json({error:'This bridge uses bounded buffered responses'},400)
 const purpose=request.headers.get('x-strata-purpose')==='synthesis'?'synthesis':'fast',route=purpose==='synthesis'?(env.AI_GATEWAY_SYNTH_MODEL||'dynamic/watch-synth'):(env.AI_GATEWAY_FAST_MODEL||'dynamic/watch-fast')
 let phase:'request'|'response'='request'
 try{
  const response=await upstream(base.href.replace(/\/$/,'')+'/chat/completions',{method:'POST',headers:{'content-type':'application/json','cf-aig-authorization':'Bearer '+env.AI_GATEWAY_TOKEN,'cf-aig-collect-log-payload':'false'},body:JSON.stringify({model:route,messages:b.messages,...(b.tools?{tools:b.tools}:{}),max_tokens:Math.min(600,Math.max(1,Number.isInteger(b.max_tokens)?Number(b.max_tokens):500)),temperature:.15,stream:false}),signal:AbortSignal.timeout(18000),redirect:'error'})
  if(!response.ok){await response.body?.cancel();return json({error:response.status===429?'Model quota reached':'Model provider unavailable'},response.status===429?429:502)}
  phase='response'
  const data=await bounded(response,65536),message=data?.choices?.[0]?.message,content=typeof message?.content==='string'?message.content:'',toolCalls=message?.tool_calls
  if((!content.trim()&&!Array.isArray(toolCalls))||content.length>6000||(toolCalls!==undefined&&(!Array.isArray(toolCalls)||toolCalls.length>2||toolCalls.some(t=>typeof t.id!=='string'||t.id.length>200||!allowedTools.has(t.function?.name)||typeof t.function?.arguments!=='string'||t.function.arguments.length>4000))))return json({error:'Model returned an invalid draft'},502)
  const served=response.headers.get('cf-aig-model')||route,model=served.replace(/[^a-zA-Z0-9@/_.:-]/g,'').slice(0,160)
  return json({choices:[{message:{role:'assistant',content,...(toolCalls?{tool_calls:toolCalls}:{})},finish_reason:toolCalls?.length?'tool_calls':'stop'}],model,usage:{prompt_tokens:Number.isSafeInteger(data.usage?.prompt_tokens)?Math.max(0,data.usage.prompt_tokens):0,completion_tokens:Number.isSafeInteger(data.usage?.completion_tokens)?Math.max(0,data.usage.completion_tokens):0}})
 }catch(error){const name=error instanceof Error?error.name:'';const code=name==='TimeoutError'||name==='AbortError'?'provider-timeout':phase==='response'?'provider-output':'provider-network';return json({error:'Model request failed; no automatic retry',code},502)}
}
