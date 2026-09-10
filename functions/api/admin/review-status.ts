type Env={WATCH_ENGINE?:Fetcher};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};

/** Authenticated operator telemetry; never exposed to the public site. */
export const onRequestGet:PagesFunction<Env>=async({request,env})=>{
 const auth=request.headers.get('authorization');
 if(!auth?.startsWith('Bearer '))return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers});
 if(!env.WATCH_ENGINE)return new Response(JSON.stringify({error:'Engine unavailable'}),{status:503,headers});
 try{
  const response=await env.WATCH_ENGINE.fetch(new Request('https://watch.internal/review/status',{headers:{authorization:auth,accept:'application/json'}}));
  return new Response(response.body,{status:response.status,headers});
 }catch{return new Response(JSON.stringify({error:'Engine unavailable'}),{status:503,headers})}
};
