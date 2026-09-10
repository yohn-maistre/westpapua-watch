import {matchesFollowing,scopedFollowingSlugs} from '../../../shared/following';
import type { StoryPacket } from './types';

const ISSUE_RULES:[string,RegExp][]=[
  ['mining-raja-ampat',/raja ampat|gag nikel|waigeo|kawe.*tambang|tambang.*raja ampat/i],
  ['lake-sentani-watershed',/danau sentani|lake sentani|cycloop/i],
  ['south-papua-food-energy-estate',/mifee|food estate|cetak sawah|tebu.*merauke|sugar.*merauke|psn.*merauke|proyek pangan.*merauke/i],
  ['conflict-displacement-access',/pengungsi|displacement|konflik|conflict|militer|military|tni|operasi keamanan|security operation/i],
  ['women-gender',/perempuan|mama-mama|women|gender|kekerasan berbasis gender|femicide/i],
  ['culture-memory-expression',/seni|\bart\b|film|musik|music|sastra|literature|udeido|mambesak|budaya|culture|arsip|archive/i],
  ['political-status-representation',/otonomi|autonomy|self-determination|penentuan nasib|merdeka|political status|status politik|pif|pacific islands forum|representasi|representation/i]
];
const ISSUE_SLUGS=new Set([...ISSUE_RULES.map(([slug])=>slug),...scopedFollowingSlugs]);
const BROAD_ISSUE_RULES:[string,RegExp][]=[
  ['land-indigenous-rights',/indigenous|masyarakat adat|adat|customary|ulayat|land right|hak tanah|tanah adat|land grab|consent|persetujuan/i],
  ['extraction-industrial-development',/mining|tambang|nikel|nickel|emas|gold|tembaga|copper|freeport|grasberg|sawit|palm oil|logging|hti|plantation|perkebunan|food estate|psn|industrial|industri/i],
  ['environment-biodiversity',/environment|lingkungan|biodivers|keanekaragaman|ecolog|ekolog|forest|hutan|marine|laut|reef|terumbu|species|spesies|conservation|konservasi|watershed|danau|mangrove/i],
  ['climate-disasters',/climate|iklim|wildfire|kebakaran|fire hotspot|titik panas|drought|kekeringan|flood|banjir|rainfall|curah hujan|landslide|longsor|disaster|bencana/i],
  ['human-rights-conflict-security',/human rights|hak asasi|conflict|konflik|military|militer|tni|police|polisi|security|keamanan|displacement|pengungsi|detention|penahanan|violence|kekerasan|civilian|warga sipil/i],
  ['politics-governance-representation',/politic|politik|governance|tata kelola|government|pemerintah|autonomy|otonomi|representation|keterwakilan|parliament|dpr|election|pemilu|political status|status politik|self-determination|pif|pacific islands forum/i],
  ['economy-livelihoods',/econom|ekonomi|livelihood|penghidupan|market|pasar|fisher|nelayan|agricultur|pertanian|employment|pekerjaan|income|pendapatan|revenue|penerimaan|poverty|kemiskinan|enterprise|usaha lokal/i],
  ['health-food-public-services',/health|kesehatan|hospital|rumah sakit|malaria|nutrition|gizi|food security|ketahanan pangan|water|air bersih|sanitation|sanitasi|housing|perumahan|public service|layanan publik/i],
  ['education-language-culture',/education|pendidikan|school|sekolah|teacher|guru|university|universitas|language|bahasa|culture|budaya|art|seni|music|musik|film|literature|sastra|archive|arsip|memory|ingatan/i],
  ['women-gender-social-inclusion',/women|perempuan|mama-mama|gender|femicide|disability|disabil|youth|pemuda|social inclusion|inklusi sosial/i],
  ['infrastructure-connectivity',/infrastructure|infrastruktur|road|jalan|bridge|jembatan|airport|bandara|aviation|penerbangan|port|pelabuhan|internet|telecom|telekom|connectivity|konektivitas|electricity|listrik|power grid|jaringan listrik/i]
];

export const normalizeKey=(value:string)=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const slugify=(value:string)=>normalizeKey(value).replace(/\s+/g,'-').slice(0,80)||'place';
const unique=<T>(items:T[])=>[...new Set(items)];

export function issueSlugsFor(text:string,candidates:string[]=[]){
  const out:string[]=[];
  const add=(slug:string)=>{if(ISSUE_SLUGS.has(slug)&&!out.includes(slug))out.push(slug)};
  // Candidate labels cannot assign a topic without evidence in the article text.
  for(const slug of scopedFollowingSlugs)if(matchesFollowing(slug,text))add(slug);
  for(const [slug,rule] of ISSUE_RULES)if(!scopedFollowingSlugs.includes(slug)&&rule.test(text))add(slug);
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
  const issueSlugs=issueSlugsFor(`${text}\n${packet.summary}`,packet.issue_candidates);
  for(let i=0;i<issueSlugs.length;i++){
    const slug=issueSlugs[i];
    await env.DB.prepare(`INSERT INTO development_issues(development_id,issue_slug,score,relation,created_at,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(development_id,issue_slug) DO UPDATE SET score=MAX(development_issues.score,excluded.score),relation=CASE WHEN development_issues.relation='primary' THEN 'primary' ELSE excluded.relation END,updated_at=excluded.updated_at`).bind(developmentId,slug,i===0?1:.72,i===0?'primary':'related',now,now).run();
    await env.DB.prepare(`UPDATE issues SET last_seen_at=?,updated_at=? WHERE slug=?`).bind(now,now,slug).run();
  }
  if(issueSlugs[0])await env.DB.prepare(`UPDATE developments SET issue_slug=COALESCE(issue_slug,?) WHERE id=?`).bind(issueSlugs[0],developmentId).run();

  const broadText=`${text}
${packet.summary}
${packet.topics.join(' ')}
${packet.issue_candidates.join(' ')}`;
  const broad=new Map<string,{score:number;relation:string}>();
  for(const [slug,rule] of BROAD_ISSUE_RULES)if(rule.test(broadText))broad.set(slug,{score:.78,relation:'topic'});
  for(const dossierSlug of issueSlugs){
    const mapped:any=await env.DB.prepare(`SELECT broad_issue_slug FROM dossier_issues WHERE dossier_slug=?`).bind(dossierSlug).all();
    for(const row of mapped.results||[])broad.set(String(row.broad_issue_slug),{score:.95,relation:'dossier'});
  }
  for(const [slug,link] of broad){await env.DB.prepare(`INSERT INTO development_broad_issues(development_id,broad_issue_slug,score,relation,created_at,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(development_id,broad_issue_slug) DO UPDATE SET score=MAX(development_broad_issues.score,excluded.score),relation=CASE WHEN excluded.score>=development_broad_issues.score THEN excluded.relation ELSE development_broad_issues.relation END,updated_at=excluded.updated_at`).bind(developmentId,slug,link.score,link.relation,now,now).run()}

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
  // Bounded, idempotent repair of explicit rejections that the old keyword gate overrode.
  const rows:any=await env.DB.prepare(`SELECT DISTINCT d.id FROM developments d JOIN development_articles da ON da.development_id=d.id JOIN story_packets sp ON sp.article_id=da.article_id WHERE d.status NOT IN ('filtered','merged') AND d.updated_at>=datetime('now',?) AND sp.watch_relevance=0 AND sp.watch_relevance_confidence>=.70 ORDER BY d.id LIMIT 3`).bind(`-${safeDays} days`).all();
  let filtered=0,repaired=0;
  for(const row of rows.results||[]){
    const id=Number(row.id),now=new Date().toISOString();
    // All relational mutations are atomic. Keep source records for provenance.
    await env.DB.batch([
      env.DB.prepare(`UPDATE articles SET status='filtered' WHERE id IN (SELECT da.article_id FROM development_articles da JOIN story_packets sp ON sp.article_id=da.article_id WHERE da.development_id=? AND sp.watch_relevance=0 AND sp.watch_relevance_confidence>=.70)`).bind(id),
      env.DB.prepare(`UPDATE resource_candidates SET status='held' WHERE article_id IN (SELECT da.article_id FROM development_articles da JOIN articles a ON a.id=da.article_id WHERE da.development_id=? AND a.status='filtered')`).bind(id),
      env.DB.prepare(`DELETE FROM article_fts WHERE article_id IN (SELECT CAST(da.article_id AS TEXT) FROM development_articles da JOIN articles a ON a.id=da.article_id WHERE da.development_id=? AND a.status='filtered')`).bind(id),
      env.DB.prepare(`DELETE FROM development_articles WHERE development_id=? AND article_id IN (SELECT id FROM articles WHERE status='filtered')`).bind(id),
      env.DB.prepare(`DELETE FROM development_fts WHERE development_id=?`).bind(String(id)),
      env.DB.prepare(`DELETE FROM development_issues WHERE development_id=?`).bind(id),
      env.DB.prepare(`DELETE FROM development_broad_issues WHERE development_id=?`).bind(id),
      env.DB.prepare(`DELETE FROM development_places WHERE development_id=?`).bind(id),
      env.DB.prepare(`DELETE FROM issue_delta_candidates WHERE development_id=?`).bind(id),
      env.DB.prepare(`UPDATE developments SET status=CASE WHEN EXISTS(SELECT 1 FROM development_articles WHERE development_id=?) THEN 'candidate' ELSE 'filtered' END,editorial_pending=CASE WHEN EXISTS(SELECT 1 FROM development_articles WHERE development_id=?) THEN 1 ELSE 0 END,issue_slug=NULL,editorial_dispatch_id=NULL,editorial_dispatched_at=NULL,retry_count=0,updated_at=? WHERE id=?`).bind(id,id,now,id)
    ]);
    const remaining:any=await env.DB.prepare(`SELECT COUNT(*) n FROM development_articles WHERE development_id=?`).bind(id).first();
    if(Number(remaining?.n)>0){await rebuildDevelopmentKnowledge(env,id);repaired++}else filtered++;
  }
  return {checked:(rows.results||[]).length,filtered,repaired,days:safeDays};
}

export async function rebuildDevelopmentKnowledge(env:any,id:number){
  const rows:any=await env.DB.prepare(`SELECT a.title,sp.* FROM development_articles da JOIN articles a ON a.id=da.article_id JOIN story_packets sp ON sp.article_id=a.id WHERE da.development_id=?`).bind(id).all();
  for(const r of rows.results||[]){const packet:StoryPacket={summary:r.summary||'',key_points:jsonArray(r.key_points_json),what_changed:r.what_changed||'',places:jsonArray(r.places_json),people:jsonArray(r.people_json),organizations:jsonArray(r.organizations_json),topics:jsonArray(r.topics_json),issue_candidates:jsonArray(r.issue_candidates_json),watch_relevance:r.watch_relevance===1};await syncDevelopmentKnowledge(env,id,packet,r.title||'')}
}
