type Env={WATCH_ENGINE?:Fetcher};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};

/** Authenticated operator bridge for exactly one normal Watch cycle. */
export const onRequestPost:PagesFunction<Env>=async({request,env})=>{
 const auth=request.headers.get('authorization');
 if(!auth?.startsWith('Bearer '))return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers});
 if(!env.WATCH_ENGINE)return new Response(JSON.stringify({error:'Engine unavailable'}),{status:503,headers});
 try{
  const response=await env.WATCH_ENGINE.fetch(new Request('https://watch.internal/run',{method:'POST',headers:{authorization:auth}}));
  return new Response(response.body,{status:response.status,headers});
 }catch{return new Response(JSON.stringify({error:'Engine unavailable'}),{status:503,headers})}
};
