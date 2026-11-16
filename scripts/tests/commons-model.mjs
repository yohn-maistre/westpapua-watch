import {test} from 'node:test'
import assert from 'node:assert/strict'
import {commonsCompletion} from '../../services/watch-engine/src/commons-model.ts'
const env={AI_GATEWAY_BASE:'https://gateway.ai.cloudflare.com/v1/synthetic-account/synthetic-gateway/compat',AI_GATEWAY_TOKEN:'synthetic-test-only',AI_GATEWAY_FAST_MODEL:'dynamic/configured-fast',AI_GATEWAY_SYNTH_MODEL:'dynamic/configured-synthesis'}
const request=(body,headers={})=>new Request('https://private-service.internal/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)})
test('resident bridge uses only configured routes and keeps gateway credentials at the service boundary',async()=>{
 for(const purpose of ['fast','synthesis']){
  let calls=0
  const result=await commonsCompletion(request({messages:[{role:'user',content:'Synthetic public evidence'}],model:'https://caller-controlled.invalid/private',max_tokens:100000},{'x-strata-purpose':purpose}),env,async(url,init)=>{
   calls++;assert.equal(url,env.AI_GATEWAY_BASE+'/chat/completions');const body=JSON.parse(init.body)
   assert.equal(body.model,purpose==='fast'?env.AI_GATEWAY_FAST_MODEL:env.AI_GATEWAY_SYNTH_MODEL);assert.equal(body.max_tokens,600)
   assert.equal(init.headers['cf-aig-collect-log-payload'],'false');assert.equal(init.headers['cf-aig-authorization'],'Bearer '+env.AI_GATEWAY_TOKEN)
   return Response.json({choices:[{message:{role:'assistant',content:'A bounded finding'}}],usage:{prompt_tokens:2,completion_tokens:3}})
  })
  assert.equal(result.status,200);assert.equal(calls,1);const body=await result.text();assert.equal(body.includes(env.AI_GATEWAY_TOKEN),false);assert.equal(body.includes('caller-controlled'),false)
 }
})
test('invalid, oversized and unapproved tool requests cannot reach an upstream',async()=>{
 let calls=0;const upstream=async()=>{calls++;throw Error('Must not be called')}
 for(const body of [{messages:[{role:'user',content:'x'.repeat(32768)}]},{messages:[{role:'user',content:'Read public sources'}],tools:[{type:'function',function:{name:'read_private_vault'}}]},{messages:[{role:'user',content:'Hello'}],stream:true}])
  assert.equal((await commonsCompletion(request(body),env,upstream)).status,400)
 assert.equal((await commonsCompletion(request({messages:[{role:'user',content:'Hello'}]}),{...env,AI_GATEWAY_BASE:'https://unapproved.invalid/v1/'},upstream)).status,503)
 assert.equal(calls,0)
})
test('provider quota/failure is bounded, sanitized and never automatically retried',async()=>{
 let calls=0
 const response=await commonsCompletion(request({messages:[{role:'user',content:'Synthetic input'}]}),env,async()=>{calls++;return new Response('Private provider diagnostic',{status:429})})
 assert.equal(response.status,429);assert.equal(calls,1);assert.equal((await response.text()).includes('Private provider diagnostic'),false)
})
test('unrecognized tools and excessive provider output fail closed',async()=>{
 for(const message of [{content:'x'.repeat(6001)},{content:null,tool_calls:[{id:'call-1',function:{name:'read_private_vault',arguments:'{}'}}]}]){
  const response=await commonsCompletion(request({messages:[{role:'user',content:'Synthetic input'}]}),env,async()=>Response.json({choices:[{message}]}))
  assert.equal(response.status,502)
 }
})

test('bridge separates request timeout/network from malformed response without leaking diagnostics',async()=>{
 for(const [upstream,expected] of [[async()=>{throw new DOMException('private request details','TimeoutError')},'provider-timeout'],[async()=>{throw new TypeError('private network details')},'provider-network'],[async()=>new Response('private non-JSON response'),'provider-output']]){let calls=0;const response=await commonsCompletion(request({messages:[{role:'user',content:'Synthetic input'}]}),env,async()=>{calls++;return upstream()});const result=await response.json();assert.equal(result.code,expected);assert.equal(calls,1);assert.doesNotMatch(JSON.stringify(result),/private|synthetic-test-only/)}
})
