type Env={WATCH_ENGINE?:Fetcher};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};

/** Authenticated, bounded operator telemetry. Public health stays internal. */
export const onRequestGet:PagesFunction<Env>=async({request,env})=>{
 const auth=request.headers.get('authorization');
 if(!auth?.startsWith('Bearer '))return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers});
 if(!env.WATCH_ENGINE)return new Response(JSON.stringify({error:'Engine unavailable'}),{status:503,headers});
 try{
  const editorial=await env.WATCH_ENGINE.fetch(new Request('https://watch.internal/review/status',{headers:{authorization:auth,accept:'application/json'}}));
  if(!editorial.ok)return new Response(editorial.body,{status:editorial.status,headers});
  const health=await env.WATCH_ENGINE.fetch(new Request('https://watch.internal/health',{headers:{accept:'application/json'}}));
  const [editorialData,healthData]=await Promise.all([editorial.json(),health.ok?health.json():Promise.resolve({ok:false})]);
  return new Response(JSON.stringify({health:healthData,editorial:editorialData}),{headers});
 }catch{return new Response(JSON.stringify({error:'Engine unavailable'}),{status:503,headers})}
};