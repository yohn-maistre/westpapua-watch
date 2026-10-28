import {newsDesk,matchesNewsDesk,matchesNewsPlace,orderNews,publisherFamily} from '../../shared/news-desk';
type Env={WATCH_ENGINE?:Fetcher};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=60, stale-while-revalidate=180','x-content-type-options':'nosniff'};
export const onRequestGet:PagesFunction<Env>=async({env,request,waitUntil})=>{
 if(!env.WATCH_ENGINE)return Response.json({items:[],engine:false},{status:503,headers:{...headers,'cache-control':'no-store'}});
 try{
  const incoming=new URL(request.url),url=new URL('https://watch.internal/current');
  for(const key of ['page','limit']){const value=incoming.searchParams.get(key);if(value&&/^\d{1,6}$/.test(value))url.searchParams.set(key,value)}
  const explicit=incoming.searchParams.has('desk')||incoming.searchParams.has('place'),desk=newsDesk(incoming.searchParams.get('desk')||'all'),place=(incoming.searchParams.get('place')||'').replace(/[^a-z0-9-]/g,'').slice(0,100);
  if(explicit){url.searchParams.set('desk',desk);if(place)url.searchParams.set('place',place)}
  const upstream=await env.WATCH_ENGINE.fetch(new Request(url,{headers:{accept:'application/json'}}));
  if(!upstream.ok)return new Response(upstream.body,{status:upstream.status,headers:{...headers,'cache-control':'no-store'}});
  if(!explicit)return new Response(upstream.body,{status:upstream.status,headers});
  const native:any=await upstream.json();if(native.selection?.version===1)return Response.json(native,{headers});
  // Preview Pages can precede the engine release. Read a bounded, cached collection
  // from its existing public API; never deploy production workers to test a UI.
  const cache=typeof caches!=='undefined'?(caches as any).default:null,key=new Request(`${incoming.origin}/api/current-snapshot-v1`);
  const cached=cache?await cache.match(key):null;let snapshot:any=cached?await cached.json():null;
  if(!snapshot){
   const items:any[]=[];let meta:any,exhausted=false;
   const read=async(page:number)=>{const response=await env.WATCH_ENGINE!.fetch(new Request(`https://watch.internal/current?page=${page}&limit=24`));if(!response.ok)throw new Error('Collection unavailable');return await response.json() as any};
   const first=await read(1),batches=[first,...(first.pagination?.has_more?await Promise.all([2,3,4,5,6].map(read)):[])];
   for(const data of batches){items.push(...(data.items||[]));meta=data.meta;if(!data.pagination?.has_more){exhausted=true;break}}
   snapshot={items:[...new Map(items.map(x=>[x.id,x])).values()],meta,exhausted};
   if(cache)waitUntil(cache.put(key,Response.json(snapshot,{headers:{'cache-control':'public, max-age=240'}})));
  }
  const page=Math.max(1,Math.floor(Number(incoming.searchParams.get('page'))||1)),limit=Math.min(24,Math.max(6,Math.floor(Number(incoming.searchParams.get('limit'))||12)));
  const selected=orderNews(snapshot.items.filter((x:any)=>matchesNewsDesk(x,desk)&&matchesNewsPlace(x,place)),desk),offset=(page-1)*limit;
  const items=selected.slice(offset,offset+limit);let lead_reports:any[]=[];
  await Promise.all(items.map(async(x:any,i:number)=>{
   const r=await env.WATCH_ENGINE!.fetch(new Request(`https://watch.internal/development/${x.id}`));if(!r.ok)throw new Error('Sources unavailable');const data:any=await r.json(),articles=data.articles||[];
   x.sources=[...new Map(articles.map((a:any)=>[a.publisher_id,{publisher_id:a.publisher_id,publisher:a.publisher,role:a.role}])).values()];
   x.source_count=new Set(articles.filter((a:any)=>!a.syndicated_from_article_id).map((a:any)=>publisherFamily(a.publisher_id))).size;
   if(i===0&&page===1)lead_reports=articles.slice(0,8);
  }));
  const options=[...new Map(snapshot.items.flatMap((x:any)=>x.places||[]).map((x:any)=>[x.slug,{slug:x.slug,name:x.name}])).values()];
  return Response.json({items,lead_reports,meta:snapshot.meta,selection:{version:1,desk,place,scope:snapshot.exhausted?'published':'recent-144',total:selected.length},place_options:options,pagination:{page,page_size:limit,has_more:offset+limit<selected.length,next_page:offset+limit<selected.length?page+1:null}},{headers});
 }catch{return Response.json({items:[],engine:false},{status:503,headers:{...headers,'cache-control':'no-store'}})}
};
