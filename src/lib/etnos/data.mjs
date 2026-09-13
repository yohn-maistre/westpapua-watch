export const text=(v)=>typeof v==='string'?v:typeof v?.id==='string'?v.id:typeof v?.en==='string'?v.en:'';
export function safeUrl(v,base){try{const u=new URL(v,base);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
export function normalize(data,section){
 const rows=section==='forum'?data.posts:data.items;
 if(!Array.isArray(rows))throw new Error('Invalid upstream shape');
 return rows.slice(0,60).flatMap(v=>{
  if(section==='forum'){
   const p=v.post;if(!p||p.deleted||p.removed||p.nsfw||v.community?.nsfw||v.community?.removed||v.community?.deleted)return [];
   const url=safeUrl(p.ap_id);if(!url||!text(p.title))return [];
   return [{title:text(p.title),url,source:`${text(v.community?.title)||'Komunitas'} · ${text(v.creator?.user_name)}`,date:p.published,summary:text(p.body).slice(0,350)}];
  }
  const url=section==='news'?safeUrl(`/id/story/?id=${encodeURIComponent(v.id)}`,'https://westpapua.watch'):safeUrl(v.url);
  if(!url||!text(v.title))return [];
  const place=section==='news'?(v.places||[]).find(p=>Number.isFinite(p.longitude)&&Number.isFinite(p.latitude)):null;
  return [{title:text(v.title),url,summary:text(section==='news'?v.summary:v.description),source:section==='news'?'Watch · konteks wilayah, bukan koordinat kejadian':text(v.publisher)||'Pustaka Watch',date:section==='news'?v.latest_report_at:undefined,...(place?{coordinates:[place.longitude,place.latitude]}:{})}];
 });
}
export async function fetchPublic(url,fetcher=fetch){const r=await fetcher(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(12000),redirect:'error'});if(!r.ok)throw new Error('Upstream unavailable');const body=await r.text();if(body.length>4000000)throw new Error('Upstream too large');return JSON.parse(body)}
export const reply=(data,status=200)=>Response.json(data,{status,headers:{'cache-control':status===200?'public, max-age=120':'no-store','x-content-type-options':'nosniff'}});
