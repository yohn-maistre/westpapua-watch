import type { StoryPacket } from './types';
import { hasWesternSignal,looksForeignOnly } from './ingest/prefilter';

const ISSUE_RULES:[string,RegExp][]=[
  ['mining-raja-ampat',/raja ampat|gag nikel|waigeo|kawe.*tambang|tambang.*raja ampat/i],
  ['lake-sentani-watershed',/danau sentani|lake sentani|cycloop/i],
  ['south-papua-food-energy-estate',/merauke|papua selatan|south papua|food estate|cetak sawah|tebu.*merauke|sugar.*merauke|psn.*merauke/i],
  ['conflict-displacement-access',/pengungsi|displacement|konflik|conflict|militer|military|tni|operasi keamanan|security operation|intan jaya|puncak|nduga|yahukimo/i],
  ['women-gender',/perempuan|mama-mama|women|gender|kekerasan berbasis gender|femicide/i],
  ['culture-memory-expression',/seni|\bart\b|film|musik|music|sastra|literature|udeido|mambesak|budaya|culture|arsip|archive/i],
  ['political-status-representation',/otonomi|autonomy|self-determination|penentuan nasib|merdeka|political status|status politik|pif|pacific islands forum|representasi|representation/i]
];
const ISSUE_SLUGS=new Set(ISSUE_RULES.map(([slug])=>slug));

export const normalizeKey=(value:string)=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const slugify=(value:string)=>normalizeKey(value).replace(/\s+/g,'-').slice(0,80)||'place';
const unique=<T>(items:T[])=>[...new Set(items)];

export function issueSlugsFor(text:string,candidates:string[]=[]){
  const out:string[]=[];
  const add=(slug:string)=>{if(ISSUE_SLUGS.has(slug)&&!out.includes(slug))out.push(slug)};
  for(const raw of candidates){const key=String(raw||'').trim().toLowerCase();if(ISSUE_SLUGS.has(key))add(key);for(const [slug,rule] of ISSUE_RULES)if(rule.test(raw))add(slug)}
  for(const [slug,rule] of ISSUE_RULES)if(rule.test(text))add(slug);
  return out;
}

async function resolvePlace(env:any,name:string){
  const label=String(name||'').replace(/\s+/g,' ').trim().slice(0,180);if(!label)return null;
  const key=normalizeKey(label);if(!key)return null;
  const alias:any=await env.DB.prepare(`SELECT p.slug,p.name,p.kind,p.latitude,p.longitude FROM place_aliases a JOIN places p ON p.slug=a.place_slug WHERE a.alias_key=?`).bind(key).first();
  if(alias)return alias;
  // Unknown names still receive a stable ID so relations are not lost. Freeze 10
  // can attach geometry later without rewriting every Development.
  const slug=slugify(label),now=new Date().toISOString();
  await env.DB.prepare(`INSERT INTO places(slug,name,kind,created_at,updated_at) VALUES(?,?,'reported',?,?) ON CONFLICT(slug) DO UPDATE SET updated_at=excluded.updated_at`).bind(slug,label,now,now).run();
  await env.DB.prepare(`INSERT OR IGNORE INTO place_aliases(alias_key,place_slug,label) VALUES(?,?,?)`).bind(key,slug,label).run();
  return {slug,name:label,kind:'reported',latitude:null,longitude:null};
}

export async function syncDevelopmentKnowledge(env:any,developmentId:number,packet:StoryPacket,text=''){
  const now=new Date().toISOString();
  const issueSlugs=issueSlugsFor(`${text}\n${packet.summary}\n${packet.topics.join(' ')}\n${packet.issue_candidates.join(' ')}`,packet.issue_candidates);
  for(let i=0;i<issueSlugs.length;i++){
    const slug=issueSlugs[i];
    await env.DB.prepare(`INSERT INTO development_issues(development_id,issue_slug,score,relation,created_at,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(development_id,issue_slug) DO UPDATE SET score=MAX(development_issues.score,excluded.score),relation=CASE WHEN development_issues.relation='primary' THEN 'primary' ELSE excluded.relation END,updated_at=excluded.updated_at`).bind(developmentId,slug,i===0?1:.72,i===0?'primary':'related',now,now).run();
    await env.DB.prepare(`UPDATE issues SET last_seen_at=?,updated_at=? WHERE slug=?`).bind(now,now,slug).run();
  }
  if(issueSlugs[0])await env.DB.prepare(`UPDATE developments SET issue_slug=COALESCE(issue_slug,?) WHERE id=?`).bind(issueSlugs[0],developmentId).run();

  for(const raw of unique(packet.places).slice(0,12)){
    const place:any=await resolvePlace(env,raw);if(!place)continue;
    await env.DB.prepare(`INSERT INTO development_places(development_id,place_slug,score,relation,created_at,updated_at) VALUES(?,?,?,'reported',?,?) ON CONFLICT(development_id,place_slug) DO UPDATE SET score=MAX(development_places.score,excluded.score),updated_at=excluded.updated_at`).bind(developmentId,place.slug,.82,now,now).run();
  }
  return {issues:issueSlugs,places:packet.places.length};
}

export async function reindexKnowledge(env:any,limit=500){
  const rows:any=await env.DB.prepare(`SELECT d.id,a.title,sp.summary,sp.key_points_json,sp.what_changed,sp.event_date,sp.event_key,sp.action,sp.object,sp.places_json,sp.people_json,sp.organizations_json,sp.topics_json,sp.issue_candidates_json,sp.watch_relevance,sp.watch_relevance_confidence,sp.watch_desk FROM developments d JOIN development_articles da ON da.development_id=d.id JOIN articles a ON a.id=da.article_id JOIN story_packets sp ON sp.article_id=a.id WHERE d.status<>'merged' ORDER BY d.updated_at DESC LIMIT ?`).bind(Math.max(1,Math.min(2000,limit))).all();
  let linked=0;for(const r of rows.results||[]){const packet:StoryPacket={summary:r.summary||'',key_points:jsonArray(r.key_points_json),what_changed:r.what_changed||'',event_date:r.event_date||undefined,event_key:r.event_key||undefined,action:r.action||undefined,object:r.object||undefined,places:jsonArray(r.places_json),people:jsonArray(r.people_json),organizations:jsonArray(r.organizations_json),topics:jsonArray(r.topics_json),issue_candidates:jsonArray(r.issue_candidates_json),watch_relevance:r.watch_relevance===1,watch_relevance_confidence:Number(r.watch_relevance_confidence||0),watch_desk:r.watch_desk||'other'};await syncDevelopmentKnowledge(env,Number(r.id),packet,r.title||'');linked++}
  return {rows:linked};
}

function jsonArray(value:any){try{const x=JSON.parse(String(value||'[]'));return Array.isArray(x)?x.map(String):[]}catch{return[]}}

export async function cleanupRecentIrrelevant(env:any,days=30){
  const safeDays=Math.max(1,Math.min(90,Number(days)||30));
  const rows:any=await env.DB.prepare(`SELECT d.id,d.status,a.title,a.summary,sp.summary packet_summary,sp.places_json,sp.watch_relevance,sp.watch_relevance_confidence,sp.watch_relevance_reason,sp.watch_relevance_evidence_json FROM developments d JOIN development_articles da ON da.development_id=d.id JOIN articles a ON a.id=da.article_id LEFT JOIN story_packets sp ON sp.article_id=a.id WHERE d.status IN ('published','candidate','held','retrying','editorial_queued') AND d.updated_at>=datetime('now',?) ORDER BY d.id`).bind(`-${safeDays} days`).all();
  const grouped=new Map<number,any[]>();for(const row of rows.results||[]){const id=Number(row.id);if(!grouped.has(id))grouped.set(id,[]);grouped.get(id)!.push(row)}
  let filtered=0,kept=0;
  for(const [id,items] of grouped){
    const text=items.map(r=>`${r.title||''} ${r.summary||''} ${r.packet_summary||''} ${jsonArray(r.places_json).join(' ')} ${jsonArray(r.watch_relevance_evidence_json).join(' ')}`).join('\n');
    const explicitYes=items.some(r=>Number(r.watch_relevance||0)===1&&Number(r.watch_relevance_confidence||0)>=.66);
    const explicitNo=items.length>0&&items.every(r=>Number(r.watch_relevance||0)===0&&Number(r.watch_relevance_confidence||0)>=.72);
    const clearlyForeign=looksForeignOnly(text);
    if(!hasWesternSignal(text)&&((explicitNo&&items.length>0)||clearlyForeign)){
      await env.DB.prepare(`UPDATE developments SET status='filtered',editorial_pending=0,editorial_dispatch_id=NULL,editorial_dispatched_at=NULL,updated_at=? WHERE id=?`).bind(new Date().toISOString(),id).run();filtered++;
    }else kept++;
  }
  return {checked:grouped.size,filtered,kept,days:safeDays};
}
