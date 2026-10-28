import {engineActivity} from './activity';
import {newsDesk,matchesNewsDesk,matchesNewsPlace,orderNews} from '../../../shared/news-desk';
const parseArray=(v:any)=>{try{const x=JSON.parse(String(v||'[]'));return Array.isArray(x)?x.map(String):[]}catch{return[]}};

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

export async function imageForDevelopment(env:any,id:number){return env.DB.prepare(`SELECT ic.url,ic.source_url,ic.credit,ic.caption,ic.rights_status,p.name publisher FROM image_candidates ic JOIN articles a ON a.id=ic.article_id JOIN publishers p ON p.id=a.publisher_id JOIN development_articles da ON da.article_id=ic.article_id WHERE da.development_id=? AND (ic.rights_status IN ('approved','attributed_external') OR ?='true') ORDER BY CASE ic.rights_status WHEN 'approved' THEN 0 ELSE 1 END,CASE WHEN ic.credit IS NOT NULL AND length(ic.credit)>1 THEN 0 ELSE 1 END,ic.id DESC LIMIT 1`).bind(id,env.ALLOW_EXTERNAL_IMAGES||'false').first()}
export async function issuesForDevelopment(env:any,id:number){const r:any=await env.DB.prepare(`SELECT i.slug,i.title_en,i.title_id,i.category,di.relation,di.score FROM development_issues di JOIN issues i ON i.slug=di.issue_slug WHERE di.development_id=? AND i.active=1 ORDER BY CASE di.relation WHEN 'primary' THEN 0 ELSE 1 END,di.score DESC,i.title_en`).bind(id).all();return r.results||[]}
export async function placesForDevelopment(env:any,id:number){const r:any=await env.DB.prepare(`SELECT p.slug,p.name,p.kind,p.latitude,p.longitude,dp.relation,dp.score FROM development_places dp JOIN places p ON p.slug=dp.place_slug WHERE dp.development_id=? ORDER BY dp.score DESC,p.name LIMIT 12`).bind(id).all();return r.results||[]}

export async function readCurrent(env:any,url:URL){
  const page=Math.max(1,Math.floor(Number(url.searchParams.get('page')||1)||1));
  const pageSize=Math.min(24,Math.max(6,Math.floor(Number(url.searchParams.get('limit')||12)||12)));
  const offset=(page-1)*pageSize;
  const desk=newsDesk(url.searchParams.get('desk')||'all'),place=url.searchParams.get('place')||'';
  // Retrieve compact episode metadata first; page only AFTER filtering/ranking.
  // This never limits the reader to whatever happened to be on the first page.
  const rows:any=await env.DB.prepare(`SELECT d.id,d.publication_kind,d.excerpt_article_id,d.issue_slug,d.title_en,d.title_id,d.summary_en,d.summary_id,d.updated_at,d.first_seen_at,d.last_growth_at,d.ranking_score,
    COUNT(DISTINCT COALESCE(a.content_hash,'id:' || a.id)) article_count,
    COUNT(DISTINCT CASE WHEN a.syndicated_from_article_id IS NULL THEN CASE WHEN a.publisher_id IN ('antara','antara-papua') THEN 'antara' ELSE a.publisher_id END END) source_count,
    strftime('%Y-%m-%dT%H:%M:%SZ',MIN(julianday(a.published_at))) first_report_at,
    strftime('%Y-%m-%dT%H:%M:%SZ',MAX(julianday(a.published_at))) latest_report_at,
    GROUP_CONCAT(DISTINCT COALESCE(sp.watch_desk,'') || ' ' || COALESCE(sp.topics_json,'')) search_text,
    json_group_array(DISTINCT json_object('publisher_id',p.id,'publisher',p.name,'role',p.role)) sources_json,
    json_group_array(DISTINCT COALESCE(sp.item_type,'')) item_types_json
    FROM developments d JOIN development_articles da ON da.development_id=d.id JOIN articles a ON a.id=da.article_id
    JOIN publishers p ON p.id=a.publisher_id LEFT JOIN story_packets sp ON sp.article_id=a.id
    WHERE d.status='published' GROUP BY d.id`).all();
  const placeIndex:any=await env.DB.prepare(`SELECT dp.development_id,dp.place_slug,p.name FROM development_places dp JOIN places p ON p.slug=dp.place_slug JOIN developments d ON d.id=dp.development_id WHERE d.status='published'`).all();
  const placeById=new Map<number,string[]>();for(const r of placeIndex.results||[]){const list=placeById.get(Number(r.development_id))||[];list.push(r.place_slug);placeById.set(Number(r.development_id),list)}
  const candidates=(rows.results||[]).map((r:any)=>({...r,sources:JSON.parse(r.sources_json||'[]'),item_types:parseArray(r.item_types_json),place_slugs:placeById.get(Number(r.id))||[]}));
  const selected=orderNews(candidates.filter((x:any)=>matchesNewsDesk(x,desk)&&matchesNewsPlace(x,place)),desk);
  const raw=selected.slice(offset,offset+pageSize+1),hasMore=raw.length>pageSize,items=[];
  for(const d of raw.slice(0,pageSize)){
    const [image,article,issueRows,placeRows]:any[]=await Promise.all([
      imageForDevelopment(env,d.id),
      env.DB.prepare(`SELECT a.title,p.role,p.name publisher,a.publisher_id,sp.watch_desk,sp.places_json,sp.topics_json FROM development_articles da JOIN articles a ON a.id=da.article_id JOIN publishers p ON p.id=a.publisher_id LEFT JOIN story_packets sp ON sp.article_id=a.id WHERE da.development_id=? ORDER BY julianday(COALESCE(a.published_at,a.fetched_at)) DESC LIMIT 1`).bind(d.id).first(),
      issuesForDevelopment(env,d.id),placesForDevelopment(env,d.id)
    ]);
    const packetPlaces=parseArray(article?.places_json),topics=parseArray(article?.topics_json),issueSlugs=issueRows.map((x:any)=>String(x.slug));
    const primaryIssue=issueRows.find((x:any)=>x.relation==='primary')?.slug||issueSlugs[0]||d.issue_slug||null;
    items.push({id:d.id,publication_kind:d.publication_kind,excerpt_article_id:d.excerpt_article_id,story_url:`/story/?id=${d.id}`,issue_slug:primaryIssue,issues:issueRows,places:placeRows,title:{en:d.title_en,id:d.title_id||d.title_en},summary:{en:d.summary_en,id:d.summary_id||d.summary_en},category:String(article?.watch_desk||'current').replaceAll('_',' '),place:placeRows[0]?.name||packetPlaces[0]||null,topics:topics.slice(0,8),tags:topicTagsFor(article?.watch_desk,issueSlugs.length?issueSlugs:[String(d.issue_slug||'')],topics),updated_at:d.updated_at,first_seen_at:d.first_seen_at,last_growth_at:d.last_growth_at,first_report_at:d.first_report_at,latest_report_at:d.latest_report_at,ranking_score:d.ranking_score,article_count:d.article_count,source_count:d.source_count,is_developing:Number(d.article_count)>1,sources:d.sources,item_types:d.item_types,latest_source:article?{publisher_id:article.publisher_id,publisher:article.publisher,role:article.role}:null,image:image?{url:image.url,source_url:image.source_url,credit:image.credit||image.publisher,caption:image.caption,rights_status:image.rights_status}:null});
  }
  let lead_reports:any[]=[];
  if(page===1&&items[0]?.id){const rr:any=await env.DB.prepare(`SELECT a.id,a.title,a.canonical_url,a.published_at,a.fetched_at,p.name publisher,p.role,sp.summary packet_summary,sp.what_changed FROM development_articles da JOIN articles a ON a.id=da.article_id JOIN publishers p ON p.id=a.publisher_id LEFT JOIN story_packets sp ON sp.article_id=a.id WHERE da.development_id=? ORDER BY julianday(COALESCE(a.published_at,a.fetched_at)) DESC LIMIT 8`).bind(items[0].id).all();lead_reports=rr.results||[]}
  const meta:any=await env.DB.prepare(`SELECT MAX(fetched_at) last_checked,COUNT(*) articles_total FROM articles`).first();const publication:any=await env.DB.prepare(`SELECT MAX(last_published_at) latest FROM developments WHERE status='published'`).first();
  return {items,lead_reports,selection:{version:1,desk,place,scope:'published',total:selected.length},place_options:[...new Map((placeIndex.results||[]).map((r:any)=>[r.place_slug,{slug:r.place_slug,name:r.name}])).values()],pagination:{page,page_size:pageSize,has_more:hasMore,next_page:hasMore?page+1:null},meta:{engine_activity:await engineActivity(env),last_published_at:publication?.latest||null,last_checked:meta?.last_checked||null,articles_total:Number(meta?.articles_total||0)}};
}
