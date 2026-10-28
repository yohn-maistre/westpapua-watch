// Bounded model context with a beginning, recent developments and publisher range.
// Chronological output lets a follow-up enrich an episode rather than erase it.
export function episodeEvidence<T extends {id?:number;published_at?:string;fetched_at?:string;publisher_id?:string;syndicated_from_article_id?:number}>(items:T[],limit=24):T[]{
 const time=(r:T)=>Date.parse(r.published_at||r.fetched_at||'')||0;
 const ordered=[...new Map(items.map(r=>[r.id,r])).values()].sort((a,b)=>time(a)-time(b)||Number(a.id)-Number(b.id)),picked=new Map<number|undefined,T>();
 const take=(r:T)=>{if(picked.size<limit)picked.set(r.id,r)};
 ordered.slice(0,Math.min(4,Math.floor(limit/4))).forEach(take);
 ordered.slice(-Math.floor(limit/2)).forEach(take);
 const publishers=new Set<string>();for(const r of [...ordered].reverse()){if(r.syndicated_from_article_id||publishers.has(r.publisher_id||''))continue;publishers.add(r.publisher_id||'');take(r)}
 [...ordered].reverse().forEach(take);return [...picked.values()].sort((a,b)=>time(a)-time(b)||Number(a.id)-Number(b.id));
}
