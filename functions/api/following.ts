import seeds from '../../content/following.json';
import {followingEntries} from '../../shared/following-state';
type Env={WATCH_ENGINE?:Fetcher};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=60, stale-while-revalidate=180','x-content-type-options':'nosniff'};
export const onRequestGet:PagesFunction<Env>=async(context)=>{
 const {env,request}=context;
 const cache=typeof caches!=='undefined'&&'default' in caches?caches.default:null;
 const cacheKey=new Request(new URL('/api/following?edition=2',request.url),{method:'GET'});
 const cached=cache?await cache.match(cacheKey).catch(()=>null):null;if(cached)return cached;
 const read=async(path:string)=>{try{const response=await env.WATCH_ENGINE?.fetch(new Request('https://watch.internal'+path,{headers:{accept:'application/json'},signal:AbortSignal.timeout(6500)}));if(!response?.ok)return null;const payload=await response.json() as {items?:unknown[]};return Array.isArray(payload.items)?payload:null}catch{return null}};
 // Two bounded service-binding reads. No model call, queue mutation or database write.
 const [snapshots,reporting]=env.WATCH_ENGINE?await Promise.all([read('/following'),read('/current?limit=24')]):[null,null];
 const response=new Response(JSON.stringify({items:followingEntries(seeds,snapshots?.items||[],reporting?.items||[]),engine:!!snapshots,reporting:!!reporting}),{headers:{...headers,'cache-control':snapshots?headers['cache-control']:'public, max-age=30'}});
 if(cache)context.waitUntil(cache.put(cacheKey,response.clone()).catch(()=>console.warn('following cache write failed')));
 return response;
};
