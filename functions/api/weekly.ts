type Env={WATCH_ENGINE?:Fetcher};
export const onRequestGet:PagesFunction<Env>=async({env,request})=>{
 const headers={'content-type':'application/json; charset=utf-8','x-content-type-options':'nosniff','cache-control':'public, max-age=120, stale-while-revalidate=300'};
 if(!env.WATCH_ENGINE)return new Response(JSON.stringify({error:'Review temporarily unavailable'}),{status:503,headers:{...headers,'cache-control':'no-store'}});
 try{const url=new URL(request.url),query=url.searchParams.get('id'),path='https://watch.internal/weekly'+(query?'?id='+encodeURIComponent(query):'');const response=await env.WATCH_ENGINE.fetch(new Request(path,{headers:{accept:'application/json'}}));return new Response(response.body,{status:response.status,headers:{...headers,'cache-control':response.ok?headers['cache-control']:'no-store'}})}catch{return new Response(JSON.stringify({error:'Review temporarily unavailable'}),{status:503,headers:{...headers,'cache-control':'no-store'}})}
};
