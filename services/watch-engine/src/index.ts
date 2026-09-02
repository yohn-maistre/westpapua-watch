import { NewsCycleWorkflow } from './workflow';
import { processArticle } from './ingest/process';
import { processEditorialJob } from './cluster/editorial';
import { answerQuestion } from './ask';
import { cleanupRecentIrrelevant,reindexKnowledge } from './knowledge';
export { NewsCycleWorkflow };

const json=(data:any,status=200,cache='no-store')=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':cache,'x-content-type-options':'nosniff'}});
const parseArray=(v:any)=>{try{const x=JSON.parse(String(v||'[]'));return Array.isArray(x)?x.map(String):[]}catch{return[]}};
const adminAuthorized=(request:any,env:any)=>Boolean(env.WATCH_ADMIN_TOKEN)&&request.headers.get('authorization')===`Bearer ${env.WATCH_ADMIN_TOKEN}`;
const denyAdmin=()=>json({error:'Unauthorized'},401);

const TAG_RULES:[string,RegExp][]=[
  ['environment-biodiversity',/environment|lingkungan|biodivers|ecolog|ekolog|forest|hutan|marine|laut|conservation|konservasi|mining|tambang|nickel|nikel/i],
  ['land-indigenous-rights',/indigenous|masyarakat adat|adat|customary|ulayat|land right|hak tanah|tanah adat|land grab/i],
  ['politics-governance',/politic|politik|governance|tata kelola|government|pemerintah|autonomy|otonomi|representation|perwakilan|parliament|dpr|pif|pacific islands forum/i],
  ['human-rights-security',/human rights|hak asasi|security|keamanan|conflict|konflik|military|militer|police|polisi|displacement|pengungsi|violence|kekerasan/i],
  ['health-wellbeing',/health|kesehatan|hospital|rumah sakit|maternal|child health|malaria|nutrition|gizi|wellbeing/i],
  ['water-sanitation-housing',/water|air bersih|sanitation|sanitasi|housing|perumahan|toilet|drinking water/i],
  ['education-knowledge',/education|pendidikan|school|sekolah|university|universitas|knowledge|pengetahuan|teacher|guru/i],
  ['economy-livelihoods',/econom|ekonomi|livelihood|penghidupan|poverty|kemiskinan|employment|pekerjaan|income|pendapatan|market|pasar|food estate|perkebunan/i],
  ['infrastructure-connectivity',/infrastructure|infrastruktur|internet|telecom|telekom|connectivity|konektivitas|road|jalan|transport|pelabuhan|airport|bandara/i],
  ['population-migration',/population|penduduk|migration|migrasi|transmigration|transmigrasi|demograph|demograf/i],
  ['culture-language',/culture|budaya|language|bahasa|art|seni|film|music|musik|literature|sastra|archive|arsip|memory|ingatan/i],
  ['gender-social-inclusion',/women|perempuan|gender|mama-mama|femicide|inklusi|disability|disabil/i],
  ['climate-disasters',/climate|iklim|disaster|bencana|flood|banjir|drought|kekeringan|landslide|longsor|earthquake|gempa/i]
];
const ISSUE_TAGS:Record<string,string[]>={
  'mining-raja-ampat':['environment-biodiversity','land-indigenous-rights','economy-livelihoods'],
  'lake-sentani-watershed':['environment-biodiversity','water-sanitation-housing','health-wellbeing'],
  'south-papua-food-energy-estate':['land-indigenous-rights','environment-biodiversity','economy-livelihoods'],
  'conflict-displacement-access':['human-rights-security','health-wellbeing','education-knowledge'],
  'political-status-representation':['politics-governance','human-rights-security'],
  'women-gender':['gender-social-inclusion','land-indigenous-rights','human-rights-security'],
  'culture-memory-expression':['culture-language','education-knowledge']
};
const DESK_TAGS:Record<string,string[]>={environment:['environment-biodiversity'],land:['land-indigenous-rights'],human_rights:['human-rights-security'],politics:['politics-governance'],culture:['culture-language']};
function topicTagsFor(desk:string,issueSlugs:string[],topics:string[]){const tags:string[]=[];const add=(tag:string)=>{if(tag&&!tags.includes(tag))tags.push(tag)};for(const slug of issueSlugs)for(const tag of ISSUE_TAGS[slug]||[])add(tag);for(const tag of DESK_TAGS[String(desk||'').toLowerCase()]||[])add(tag);const haystack=topics.join(' ');for(const [tag,rule] of TAG_RULES)if(rule.test(haystack))add(tag);return tags.slice(0,4)}

async function imageForDevelopment(env:any,id:number){return env.DB.prepare(`SELECT ic.url,ic.source_url,ic.credit,ic.caption,ic.rights_status,p.name publisher FROM image_candidates ic JOIN articles a ON a.id=ic.article_id JOIN publishers p ON p.id=a.publisher_id JOIN development_articles da ON da.article_id=ic.article_id WHERE da.development_id=? AND (ic.rights_status IN ('approved','attributed_external') OR ?='true') ORDER BY CASE ic.rights_status WHEN 'approved' THEN 0 ELSE 1 END,CASE WHEN ic.credit IS NOT NULL AND length(ic.credit)>1 THEN 0 ELSE 1 END,ic.id DESC LIMIT 1`).bind(id,env.ALLOW_EXTERNAL_IMAGES||'false').first()}
async function issuesForDevelopment(env:any,id:number){const r:any=await env.DB.prepare(`SELECT i.slug,i.title_en,i.title_id,i.category,di.relation,di.score FROM development_issues di JOIN issues i ON i.slug=di.issue_slug WHERE di.development_id=? AND i.active=1 ORDER BY CASE di.relation WHEN 'primary' THEN 0 ELSE 1 END,di.score DESC,i.title_en`).bind(id).all();return r.results||[]}
async function placesForDevelopment(env:any,id:number){const r:any=await env.DB.prepare(`SELECT p.slug,p.name,p.kind,p.latitude,p.longitude,dp.relation,dp.score FROM development_places dp JOIN places p ON p.slug=dp.place_slug WHERE dp.development_id=? ORDER BY dp.score DESC,p.name LIMIT 12`).bind(id).all();return r.results||[]}

async function current(env:any){
  const rows:any=await env.DB.prepare(`SELECT d.id,d.issue_slug,d.title_en,d.title_id,d.summary_en,d.summary_id,d.updated_at,d.first_seen_at,d.last_growth_at,d.ranking_score,COUNT(DISTINCT da.article_id) article_count,COUNT(DISTINCT CASE WHEN a.syndicated_from_article_id IS NULL THEN a.publisher_id END) source_count FROM developments d JOIN development_articles da ON da.development_id=d.id JOIN articles a ON a.id=da.article_id WHERE d.status='published' GROUP BY d.id ORDER BY d.ranking_score DESC,d.updated_at DESC LIMIT 18`).all();
  const items=[];
  for(const d of rows.results||[]){
    const [image,article,issueRows,placeRows]:any[]=await Promise.all([
      imageForDevelopment(env,d.id),
      env.DB.prepare(`SELECT a.title,p.role,p.name publisher,a.publisher_id,sp.watch_desk,sp.places_json,sp.topics_json FROM development_articles da JOIN articles a ON a.id=da.article_id JOIN publishers p ON p.id=a.publisher_id LEFT JOIN story_packets sp ON sp.article_id=a.id WHERE da.development_id=? ORDER BY COALESCE(a.published_at,a.fetched_at) DESC LIMIT 1`).bind(d.id).first(),
      issuesForDevelopment(env,d.id),placesForDevelopment(env,d.id)
    ]);
    const packetPlaces=parseArray(article?.places_json),topics=parseArray(article?.topics_json),issueSlugs=issueRows.map((x:any)=>String(x.slug));
    const primaryIssue=issueRows.find((x:any)=>x.relation==='primary')?.slug||issueSlugs[0]||d.issue_slug||null;
    items.push({id:d.id,story_url:`/story/?id=${d.id}`,issue_slug:primaryIssue,issues:issueRows,places:placeRows,title:{en:d.title_en,id:d.title_id||d.title_en},summary:{en:d.summary_en,id:d.summary_id||d.summary_en},category:String(article?.watch_desk||'current').replaceAll('_',' '),place:placeRows[0]?.name||packetPlaces[0]||'West Papua',topics:topics.slice(0,8),tags:topicTagsFor(article?.watch_desk,issueSlugs.length?issueSlugs:[String(d.issue_slug||'')],topics),updated_at:d.updated_at,first_seen_at:d.first_seen_at,last_growth_at:d.last_growth_at,ranking_score:d.ranking_score,article_count:d.article_count,source_count:d.source_count,is_developing:Number(d.article_count)>1,latest_source:article?{publisher_id:article.publisher_id,publisher:article.publisher,role:article.role}:null,image:image?{url:image.url,source_url:image.source_url,credit:image.credit||image.publisher,caption:image.caption,rights_status:image.rights_status}:null});
  }
  let lead_reports:any[]=[];
  if(items[0]?.id){const rr:any=await env.DB.prepare(`SELECT a.id,a.title,a.canonical_url,a.published_at,a.fetched_at,p.name publisher,p.role,sp.summary packet_summary,sp.what_changed FROM development_articles da JOIN articles a ON a.id=da.article_id JOIN publishers p ON p.id=a.publisher_id LEFT JOIN story_packets sp ON sp.article_id=a.id WHERE da.development_id=? ORDER BY COALESCE(a.published_at,a.fetched_at) DESC LIMIT 8`).bind(items[0].id).all();lead_reports=rr.results||[]}
  const meta:any=await env.DB.prepare(`SELECT MAX(fetched_at) last_checked,COUNT(*) articles_total FROM articles`).first();
  return {items,lead_reports,meta:{last_checked:meta?.last_checked||null,articles_total:Number(meta?.articles_total||0)}};
}

async function development(env:any,id:number){
  const d:any=await env.DB.prepare(`SELECT * FROM developments WHERE id=? AND status='published'`).bind(id).first();if(!d)return null;
  const synthesis:any=await env.DB.prepare(`SELECT * FROM development_syntheses WHERE development_id=? ORDER BY created_at DESC LIMIT 1`).bind(id).first();
  const rows:any=await env.DB.prepare(`SELECT a.id,a.title,a.summary,a.canonical_url,a.published_at,a.language,a.syndicated_from_article_id,p.id publisher_id,p.name publisher,p.role,sp.summary packet_summary,sp.key_points_json,sp.what_changed,sp.places_json,sp.people_json,sp.organizations_json,sp.topics_json,ic.url image_url,ic.source_url image_source_url,ic.credit image_credit FROM development_articles da JOIN articles a ON a.id=da.article_id JOIN publishers p ON p.id=a.publisher_id LEFT JOIN story_packets sp ON sp.article_id=a.id LEFT JOIN image_candidates ic ON ic.id=(SELECT id FROM image_candidates WHERE article_id=a.id ORDER BY id DESC LIMIT 1) WHERE da.development_id=? ORDER BY COALESCE(a.published_at,a.fetched_at) DESC`).bind(id).all();
  const [issueRows,placeRows]=await Promise.all([issuesForDevelopment(env,id),placesForDevelopment(env,id)]);
  return {development:d,synthesis:synthesis?{...synthesis,key_points:{en:parseArray(synthesis.key_points_en_json),id:parseArray(synthesis.key_points_id_json)}}:null,issues:issueRows,places:placeRows,articles:rows.results||[]};
}

async function issues(env:any){
  const rows:any=await env.DB.prepare(`SELECT i.*,MAX(d.updated_at) live_updated_at,COUNT(DISTINCT CASE WHEN d.status='published' THEN d.id END) development_count,COUNT(DISTINCT CASE WHEN d.status='published' AND a.syndicated_from_article_id IS NULL THEN a.publisher_id END) source_count FROM issues i LEFT JOIN development_issues di ON di.issue_slug=i.slug LEFT JOIN developments d ON d.id=di.development_id LEFT JOIN development_articles da ON da.development_id=d.id LEFT JOIN articles a ON a.id=da.article_id WHERE i.active=1 GROUP BY i.slug ORDER BY COALESCE(MAX(d.updated_at),i.updated_at) DESC,i.title_en`).all();
  const areaRows:any=await env.DB.prepare(`SELECT ia.issue_slug,a.slug,a.title_en,a.title_id,a.sort_order FROM issue_areas ia JOIN areas a ON a.slug=ia.area_slug WHERE a.active=1 ORDER BY a.sort_order`).all();const map=new Map<string,any[]>();for(const a of areaRows.results||[]){if(!map.has(a.issue_slug))map.set(a.issue_slug,[]);map.get(a.issue_slug)!.push({slug:a.slug,title_en:a.title_en,title_id:a.title_id})}
  return {items:(rows.results||[]).map((r:any)=>({...r,updated_at:r.live_updated_at||r.last_seen_at||r.updated_at,areas:map.get(r.slug)||[]}))};
}

async function issue(env:any,slug:string){
  const meta:any=await env.DB.prepare(`SELECT * FROM issues WHERE slug=? AND active=1`).bind(slug).first();if(!meta)return null;
  const rows:any=await env.DB.prepare(`SELECT d.id,d.title_en,d.title_id,d.summary_en,d.summary_id,d.updated_at,d.ranking_score,di.relation,di.score,COUNT(DISTINCT CASE WHEN a.syndicated_from_article_id IS NULL THEN a.publisher_id END) source_count FROM development_issues di JOIN developments d ON d.id=di.development_id JOIN development_articles da ON da.development_id=d.id JOIN articles a ON a.id=da.article_id WHERE di.issue_slug=? AND d.status='published' GROUP BY d.id ORDER BY d.updated_at DESC LIMIT 30`).bind(slug).all();
  const developments=[];for(const d of rows.results||[]){const image:any=await imageForDevelopment(env,d.id);developments.push({...d,story_url:`/story/?id=${d.id}`,image:image?{url:image.url,source_url:image.source_url,credit:image.credit||image.publisher,caption:image.caption}:null})}
  const deltas:any=await env.DB.prepare(`SELECT id,development_id,delta_summary,delta_summary_id,significance,created_at FROM issue_delta_candidates WHERE issue_slug=? AND status='published' ORDER BY created_at DESC LIMIT 40`).bind(slug).all();
  const reporting:any=await env.DB.prepare(`SELECT DISTINCT a.canonical_url,a.title,a.published_at,p.name publisher,p.role,COALESCE(a.published_at,a.fetched_at) report_at FROM development_issues di JOIN developments d ON d.id=di.development_id JOIN development_articles da ON da.development_id=d.id JOIN articles a ON a.id=da.article_id JOIN publishers p ON p.id=a.publisher_id WHERE di.issue_slug=? AND d.status='published' ORDER BY COALESCE(a.published_at,a.fetched_at) DESC LIMIT 24`).bind(slug).all();
  const src:any=await env.DB.prepare(`SELECT COUNT(DISTINCT a.publisher_id) n FROM development_issues di JOIN developments d ON d.id=di.development_id JOIN development_articles da ON da.development_id=d.id JOIN articles a ON a.id=da.article_id WHERE di.issue_slug=? AND d.status='published'`).bind(slug).first();
  const areas:any=await env.DB.prepare(`SELECT a.slug,a.title_en,a.title_id FROM issue_areas ia JOIN areas a ON a.slug=ia.area_slug WHERE ia.issue_slug=? AND a.active=1 ORDER BY a.sort_order`).bind(slug).all();
  return {...meta,areas:areas.results||[],updated_at:developments[0]?.updated_at||meta.last_seen_at||meta.updated_at,development_count:developments.length,source_count:Number(src?.n||0),current_status:(deltas.results||[])[0]?{en:(deltas.results||[])[0].delta_summary,id:(deltas.results||[])[0].delta_summary_id||(deltas.results||[])[0].delta_summary}:{en:developments[0]?.summary_en||meta.summary_en,id:developments[0]?.summary_id||meta.summary_id},developments,deltas:deltas.results||[],reporting:reporting.results||[]};
}
async function emerging(env:any){const rows:any=await env.DB.prepare(`SELECT * FROM emerging_issues WHERE status='emerging' ORDER BY last_seen_at DESC,development_count DESC LIMIT 20`).all();return rows.results||[]}
async function resources(env:any,url:URL){const status=url.searchParams.get('status')==='candidate'?'candidate':'published';const rows:any=await env.DB.prepare(`SELECT * FROM resource_candidates WHERE status=? ORDER BY COALESCE(updated_at,created_at) DESC LIMIT 100`).bind(status).all();return rows.results||[]}
async function places(env:any,url:URL){const q=String(url.searchParams.get('q')||'').trim();const rows:any=q?await env.DB.prepare(`SELECT slug,name,kind,parent_slug,latitude,longitude FROM places WHERE name LIKE ? ORDER BY CASE WHEN lower(name)=lower(?) THEN 0 ELSE 1 END,name LIMIT 40`).bind(`%${q}%`,q).all():await env.DB.prepare(`SELECT p.slug,p.name,p.kind,p.parent_slug,p.latitude,p.longitude,COUNT(DISTINCT dp.development_id) development_count FROM places p LEFT JOIN development_places dp ON dp.place_slug=p.slug GROUP BY p.slug ORDER BY development_count DESC,p.name LIMIT 100`).all();return rows.results||[]}

async function editorialStatus(env:any){
  try{const states:any=await env.DB.prepare(`SELECT status,COUNT(*) n FROM developments WHERE pipeline_version>=2 GROUP BY status`).all();const review:any=await env.DB.prepare(`SELECT COUNT(*) n,MAX(created_at) latest FROM critic_reviews`).first();const attempts:any=await env.DB.prepare(`SELECT COUNT(*) n,SUM(CASE WHEN outcome='error' THEN 1 ELSE 0 END) errors,MAX(created_at) latest FROM engine_attempts`).first();const latest:any=await env.DB.prepare(`SELECT stage,outcome,model,created_at FROM engine_attempts ORDER BY id DESC LIMIT 1`).first();const published:any=await env.DB.prepare(`SELECT MAX(updated_at) latest FROM developments WHERE status='published'`).first();const deferred:any=await env.DB.prepare(`SELECT COUNT(*) n FROM articles WHERE status IN ('relevance_deferred','relevance_queued')`).first();return {developments:Object.fromEntries((states.results||[]).map((x:any)=>[x.status,Number(x.n||0)])),deferred_relevance:Number(deferred?.n||0),critic_reviews:Number(review?.n||0),latest_review_at:review?.latest||null,attempts:Number(attempts?.n||0),attempt_errors:Number(attempts?.errors||0),latest_attempt:latest||null,latest_published_at:published?.latest||null}}catch{return {available:false,error:'editorial telemetry unavailable'}}
}

export default {
  async fetch(request:any,env:any){
    const url=new URL(request.url);
    if(url.pathname==='/health')return json({ok:true,service:'westpapua-watch-engine',scheduler:'06/09/12/15/18 WIT',pipelineVersion:2,freeze:'09'});
    if(url.pathname==='/current'&&request.method==='GET')return json(await current(env),200,'public, max-age=60, stale-while-revalidate=180');
    const dm=url.pathname.match(/^\/development\/(\d+)$/);if(dm&&request.method==='GET'){const item=await development(env,Number(dm[1]));return item?json(item):json({error:'Not found'},404)}
    if(url.pathname==='/issues'&&request.method==='GET')return json(await issues(env),200,'public, max-age=60, stale-while-revalidate=180');
    const im=url.pathname.match(/^\/issue\/([a-z0-9-]+)$/);if(im&&request.method==='GET'){const item=await issue(env,im[1]);return item?json(item,200,'public, max-age=60, stale-while-revalidate=180'):json({error:'Not found'},404)}
    if(url.pathname==='/places'&&request.method==='GET')return json({items:await places(env,url)},200,'public, max-age=120, stale-while-revalidate=300');
    if(url.pathname==='/resources'&&request.method==='GET'){if(url.searchParams.get('status')==='candidate'&&!adminAuthorized(request,env))return denyAdmin();return json({items:await resources(env,url)},200,url.searchParams.get('status')==='candidate'?'no-store':'public, max-age=120, stale-while-revalidate=300')}
    if(url.pathname==='/ask'&&request.method==='POST'){let body:any;try{body=await request.json()}catch{return json({error:'Invalid JSON'},400)}const query=String(body?.query||'').trim();if(query.length<2||query.length>500)return json({error:'Question must be between 2 and 500 characters.'},400);try{return json(await answerQuestion(env,query,body?.locale==='pmy'?'pmy':'en'))}catch{return json({error:'The Watch answer service is temporarily unavailable.'},502)}}

    // Everything below this point is operational/editorial state and requires the
    // Worker secret. Missing configuration fails closed.
    if(['/review/critic','/review/status','/emerging-issues','/run','/backfill','/maintenance/freeze09'].includes(url.pathname)&&!adminAuthorized(request,env))return denyAdmin();
    if(url.pathname==='/review/critic'&&request.method==='GET'){const rows:any=await env.DB.prepare(`SELECT cr.*,d.title_en,d.status FROM critic_reviews cr JOIN developments d ON d.id=cr.development_id ORDER BY cr.created_at DESC LIMIT 50`).all();return json({items:rows.results||[]})}
    if(url.pathname==='/review/status'&&request.method==='GET')return json(await editorialStatus(env));
    if(url.pathname==='/emerging-issues'&&request.method==='GET')return json({items:await emerging(env)});
    if(url.pathname==='/run'&&request.method==='POST'){const instance=await env.NEWS_CYCLE.create({params:{reason:'manual'}});return json({id:instance.id},202)}
    if(url.pathname==='/backfill'&&request.method==='POST'){let body:any={};try{body=await request.json()}catch{}const days=Math.max(1,Math.min(31,Number(body?.days||14)));const instance=await env.NEWS_CYCLE.create({id:`backfill-${Date.now()}-${crypto.randomUUID().slice(0,8)}`,params:{reason:'manual-backfill',backfillDays:days}});return json({id:instance.id,days},202)}
    if(url.pathname==='/maintenance/freeze09'&&request.method==='POST'){let body:any={};try{body=await request.json()}catch{}const cleanup=await cleanupRecentIrrelevant(env,Math.max(1,Math.min(90,Number(body?.days||30)))),knowledge=await reindexKnowledge(env,Math.max(1,Math.min(2000,Number(body?.limit||1000))));return json({cleanup,knowledge})}
    return json({error:'Not found'},404);
  },
  async scheduled(controller:any,env:any,ctx:any){const slot=Math.floor(Number(controller.scheduledTime||Date.now())/1_800_000);const id=`cron-${slot}`;ctx.waitUntil(env.NEWS_CYCLE.create({id,params:{reason:'cloudflare-cron',scheduledTime:controller.scheduledTime,cron:controller.cron}}).catch((e:any)=>{const message=String(e?.message||e);if(/already|exist|duplicate/i.test(message)){console.log('news cycle already exists',id);return}throw e}))},
  async queue(batch:any,env:any){for(const m of batch.messages){try{if(m.body?.kind==='editorial')await processEditorialJob(env,m.body);else await processArticle(env,m.body);m.ack()}catch(e){console.error('queue infrastructure job failed',batch.queue,m.body?.developmentId||m.body?.url,e);m.retry()}}}
};
