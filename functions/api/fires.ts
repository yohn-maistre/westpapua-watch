type Env={WATCH_ENGINE?:Fetcher};
const fallbackHeaders={'content-type':'application/geo+json; charset=utf-8','cache-control':'public, max-age=300','x-content-type-options':'nosniff'};
export const onRequestGet:PagesFunction<Env>=async({request,env})=>{
  const cache=caches.default;const cached=await cache.match(request);if(cached)return cached;
  if(!env.WATCH_ENGINE)return new Response(JSON.stringify({type:'FeatureCollection',features:[],available:false}),{status:503,headers:fallbackHeaders});
  try{const upstream=await env.WATCH_ENGINE.fetch(new Request('https://watch.internal/geo/fires',{headers:{accept:'application/geo+json'}}));const response=new Response(upstream.body,{status:upstream.status,headers:upstream.headers});response.headers.set('cache-control',upstream.ok?'public, max-age=1800, stale-while-revalidate=3600':'public, max-age=300');response.headers.set('x-content-type-options','nosniff');if(upstream.ok)await cache.put(request,response.clone());return response}catch{return new Response(JSON.stringify({type:'FeatureCollection',features:[],available:false}),{status:503,headers:fallbackHeaders})}
};
