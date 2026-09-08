type Env={WATCH_ENGINE?:Fetcher};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=60, stale-while-revalidate=180','x-content-type-options':'nosniff'};
export const onRequestGet:PagesFunction<Env>=async({env,request})=>{
  if(!env.WATCH_ENGINE)return new Response(JSON.stringify({items:[],engine:false}),{status:503,headers});
  try{const incoming=new URL(request.url),url=new URL('https://watch.internal/current');for(const key of ['page','limit']){const value=incoming.searchParams.get(key);if(value&&/^\d{1,6}$/.test(value))url.searchParams.set(key,value)}const response=await env.WATCH_ENGINE.fetch(new Request(url,{headers:{accept:'application/json'}}));return new Response(response.body,{status:response.status,headers:{...headers,'cache-control':response.ok?'public, max-age=60, stale-while-revalidate=180':'no-store'}})}catch{return new Response(JSON.stringify({items:[],engine:false}),{status:503,headers})}
};
