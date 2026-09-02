type Env={ARCHIVE?:R2Bucket;WATCH_ENGINE?:Fetcher};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=300, stale-while-revalidate=900','x-content-type-options':'nosniff'};
const keys:Record<string,string>={'province-boundaries':'geo/provinces.pmtiles','cultural-regions':'geo/cultural_regions.pmtiles','mining-permits':'geo/mining.pmtiles','forest-plantation-permits':'geo/concessions.pmtiles','protected-areas':'geo/protected.pmtiles'};
export const onRequestGet:PagesFunction<Env>=async({env})=>{
  const layers:Record<string,any>={};for(const [id,key] of Object.entries(keys)){try{const h=env.ARCHIVE?await env.ARCHIVE.head(key):null;layers[id]={available:Boolean(h),updated_at:h?.uploaded?.toISOString?.()||null,size:h?.size||null}}catch{layers[id]={available:false}}}
  layers['current-developments']={available:true};
  try{const r=env.WATCH_ENGINE?await env.WATCH_ENGINE.fetch(new Request('https://watch.internal/geo/status')):null;const d=r?.ok?await r.json():null;layers['fire-hotspots']={available:d?.fires?.available===true,updated_at:d?.fires?.updated_at||null}}catch{layers['fire-hotspots']={available:false}}
  return new Response(JSON.stringify({coverage:'Western New Guinea',layers}),{headers});
};
