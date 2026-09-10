import {followingSlugs} from '../../../src/data/topic-collections';
import {libraryItems} from '../../../src/data/library';
import {normalizeLibraryItem,mergeLibraryItems,libraryGroup,strings} from '../../../shared/library';
export async function resources(env:any,url:URL){
 const status=url.searchParams.get('status')==='candidate'?'candidate':'published';
 const rows:any=await env.DB.prepare(`SELECT r.*,p.name publisher_name,p.role publisher_role FROM resource_candidates r LEFT JOIN publishers p ON p.id=r.publisher_id WHERE r.status=? ORDER BY r.published_at DESC,r.id DESC LIMIT 300`).bind(status).all();
 const relationRows:any=await env.DB.prepare(`SELECT rr.resource_id,rr.target_kind,rr.target_id FROM resource_relations rr WHERE (rr.target_kind<>'story' OR rr.origin<>'classifier') AND rr.resource_id IN (SELECT id FROM resource_candidates WHERE status=? ORDER BY published_at DESC,id DESC LIMIT 300) UNION ALL SELECT r.id,'story',CAST(da.development_id AS TEXT) FROM resource_candidates r JOIN development_articles da ON da.article_id=r.article_id JOIN developments d ON d.id=da.development_id AND d.status='published' WHERE r.id IN (SELECT id FROM resource_candidates WHERE status=? ORDER BY published_at DESC,id DESC LIMIT 300)`).bind(status,status).all();
 const byId=new Map<number,any[]>();for(const r of relationRows.results||[]){if(!byId.has(r.resource_id))byId.set(r.resource_id,[]);byId.get(r.resource_id)!.push(r)}
 const live=(rows.results||[]).map((row:any)=>{const related=(kind:string)=>(byId.get(row.id)||[]).filter(r=>r.target_kind===kind).map(r=>r.target_id);return normalizeLibraryItem({...row,topics:[...strings(row.topics_json),...related('topic')],places:[...strings(row.places_json),...related('place')],stories:related('story')})});
 const items=status==='candidate'?live:mergeLibraryItems(libraryItems,live);
 const following=url.searchParams.get('following');
 const story=url.searchParams.get('story'),topic=url.searchParams.get('topic'),place=url.searchParams.get('place'),type=url.searchParams.get('type'),q=(url.searchParams.get('q')||'').toLowerCase();
 return items.map(i=>({...i,following:[...new Set([...i.following,...i.topics.filter(t=>(followingSlugs as readonly string[]).includes(t))])]})).filter(i=>(!following||i.following.includes(following))&&(!story||i.stories.includes(story))&&(!topic||i.topics.includes(topic))&&(!place||i.places.some(p=>p.toLowerCase()===place.toLowerCase()))&&(!type||i.itemType===type||libraryGroup(i.itemType)===type)&&(!q||`${i.title} ${i.description} ${i.publisher} ${i.authors.join(' ')} ${i.doi||''} ${i.isbn||''} ${i.abstract} ${i.tags.join(' ')} ${i.places.join(' ')}`.toLowerCase().includes(q)));
}
