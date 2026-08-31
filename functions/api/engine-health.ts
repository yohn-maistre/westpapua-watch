type Env={WATCH_ENGINE?:Fetcher};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
export const onRequestGet:PagesFunction<Env>=async({env})=>{
  if(!env.WATCH_ENGINE)return new Response(JSON.stringify({ok:false,engine:false,error:'WATCH_ENGINE service binding is not configured.'}),{status:503,headers});
  try{const response=await env.WATCH_ENGINE.fetch(new Request('https://watch.internal/health'));return new Response(response.body,{status:response.status,headers})}catch{return new Response(JSON.stringify({ok:false,engine:true,error:'Watch Engine could not be reached.'}),{status:503,headers})}
};
