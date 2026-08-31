type Env={WATCH_ENGINE?:Fetcher};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=60, stale-while-revalidate=180','x-content-type-options':'nosniff'};
export const onRequestGet:PagesFunction<Env>=async({env,params})=>{
  const id=String(params.id||'');if(!/^\d+$/.test(id))return new Response(JSON.stringify({error:'Invalid development id.'}),{status:400,headers:{...headers,'cache-control':'no-store'}});
  if(!env.WATCH_ENGINE)return new Response(JSON.stringify({error:'Watch Engine is not configured.'}),{status:503,headers:{...headers,'cache-control':'no-store'}});
  try{const response=await env.WATCH_ENGINE.fetch(new Request(`https://watch.internal/development/${id}`));return new Response(response.body,{status:response.status,headers:{...headers,'cache-control':response.ok?headers['cache-control']:'no-store'}})}catch{return new Response(JSON.stringify({error:'Development unavailable.'}),{status:503,headers:{...headers,'cache-control':'no-store'}})}
};
