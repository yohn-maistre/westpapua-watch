type Env={WATCH_ENGINE?:Fetcher};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=300, stale-while-revalidate=900','x-content-type-options':'nosniff'};
export const onRequestGet:PagesFunction<Env>=async({env})=>{
  if(!env.WATCH_ENGINE)return new Response(JSON.stringify({items:[],engine:false}),{status:503,headers:{...headers,'cache-control':'no-store'}});
  try{const response=await env.WATCH_ENGINE.fetch(new Request('https://watch.internal/resources'));return new Response(response.body,{status:response.status,headers:{...headers,'cache-control':response.ok?headers['cache-control']:'no-store'}})}catch{return new Response(JSON.stringify({items:[],engine:false}),{status:503,headers:{...headers,'cache-control':'no-store'}})}
};
