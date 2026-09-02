type Env={WATCH_ENGINE?:Fetcher};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=120, stale-while-revalidate=300','x-content-type-options':'nosniff'};
export const onRequestGet:PagesFunction<Env>=async({env,request})=>{
  if(!env.WATCH_ENGINE)return new Response(JSON.stringify({items:[],engine:false}),{status:503,headers});
  try{const incoming=new URL(request.url),target=new URL('https://watch.internal/places');const q=incoming.searchParams.get('q');if(q)target.searchParams.set('q',q.slice(0,120));const response=await env.WATCH_ENGINE.fetch(new Request(target,{headers:{accept:'application/json'}}));return new Response(response.body,{status:response.status,headers:{...headers,'cache-control':response.ok?'public, max-age=120, stale-while-revalidate=300':'no-store'}})}catch{return new Response(JSON.stringify({items:[],engine:false}),{status:503,headers})}
};
