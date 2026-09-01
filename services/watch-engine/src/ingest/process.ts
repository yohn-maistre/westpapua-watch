import { sourceById } from '../sources/registry';
import { extractArticle } from './extract';
import { makeStoryPacketsBatch } from './story';
import { tryEmbedText } from '../embedding';
import { clusterArticles } from '../cluster';
import { maybeResourceCandidate } from '../resources';
import { prefilterArticle,type PrefilterDecision } from './prefilter';
import { upsertArticleSearch } from '../search';
import type { ExtractedArticle,IngestBatchMessage,IngestMessage,SourceConfig,StoryPacket } from '../types';

const WESTERN=/\bwest papua\b|papua barat(?: daya)?|papua tengah|papua pegunungan|papua selatan|jayapura|sentani|cycloop|raja ampat|sorong|manokwari|nabire|merauke|timika|mimika|biak|supiori|serui|yapen|wamena|jayawijaya|puncak|nduga|intan jaya|yahukimo|deiyai|dogiyai|paniai|fakfak|kaimana|tambrauw|maybrat|arfak|mamberamo|asmat|boven digoel|lanny jaya|tolikara|oap\b|orang asli papua|knpb|ulmwp|tpnpb/i;
const PNG_ONLY=/papua new guinea|port moresby|mount hagen|pngdf|lae\b|bougainville|madang|morobe/i;
const canonical=(url:string)=>{try{const u=new URL(url);['utm_source','utm_medium','utm_campaign','utm_content','fbclid','gclid'].forEach(k=>u.searchParams.delete(k));u.hash='';return u.href.replace(/\/$/,'')}catch{return url}};
async function sha256(text:string){const bytes=new TextEncoder().encode(text.replace(/\s+/g,' ').trim());const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const parse=(v:any)=>{try{const x=JSON.parse(String(v||'[]'));return Array.isArray(x)?x.map(String):[]}catch{return[]}};

type Prepared={id:number;source:SourceConfig;extracted:ExtractedArticle;decision:PrefilterDecision;syndicatedFrom?:number|null;packet?:StoryPacket;row?:any};

function packetFromRow(prior:any,extracted:ExtractedArticle):StoryPacket{
  return {summary:prior.summary,key_points:parse(prior.key_points_json),what_changed:prior.what_changed||'',event_date:prior.event_date||extracted.publishedAt,event_key:prior.event_key||extracted.title,action:prior.action||'',object:prior.object||'',places:parse(prior.places_json),people:parse(prior.people_json),organizations:parse(prior.organizations_json),topics:parse(prior.topics_json),issue_candidates:parse(prior.issue_candidates_json),watch_relevance:prior.watch_relevance===1,watch_relevance_confidence:Number(prior.watch_relevance_confidence||.9),watch_relevance_reason:prior.watch_relevance_reason||'syndicated from prior packet',watch_relevance_evidence:parse(prior.watch_relevance_evidence_json),watch_desk:prior.watch_desk||'other'};
}

function packetRelevant(packet:StoryPacket,source:SourceConfig,article:ExtractedArticle,decision:PrefilterDecision){
  if(source.scope==='papua')return true;
  const high=`${article.title} ${article.description} ${packet.summary} ${packet.places.join(' ')} ${(packet.watch_relevance_evidence||[]).join(' ')}`;
  const strong=WESTERN.test(high),pngOnly=PNG_ONLY.test(high)&&!strong;
  if(pngOnly)return false;
  if(decision==='keep')return true;
  if(/batch failed|omitted this article|structured extraction/i.test(packet.watch_relevance_reason||''))return true; // recall-first degradation
  const modelYes=packet.watch_relevance===true&&(packet.watch_relevance_confidence||0)>=.66;
  return modelYes&&(strong||(packet.watch_relevance_evidence||[]).length>0||/\bpapua\b/i.test(high));
}

async function prepare(env:any,message:IngestMessage):Promise<Prepared|null>{
  const source=sourceById[message.sourceId];if(!source||!source.enabled)return null;
  const incoming=canonical(message.url);let known:any=await env.DB.prepare(`SELECT id,status FROM articles WHERE canonical_url=?`).bind(incoming).first();
  if(!message.force&&(known?.status==='clustered'||known?.status==='filtered'))return null;
  const extracted=await extractArticle(message.url,source,env);if(!extracted)return null;extracted.canonicalUrl=canonical(extracted.canonicalUrl);
  if(extracted.canonicalUrl!==incoming){const canonicalKnown:any=await env.DB.prepare(`SELECT id,status FROM articles WHERE canonical_url=?`).bind(extracted.canonicalUrl).first();if(!message.force&&(canonicalKnown?.status==='clustered'||canonicalKnown?.status==='filtered'))return null;known=canonicalKnown||known}
  const fetched=new Date().toISOString(),hash=await sha256(extracted.body);const syndicated:any=await env.DB.prepare(`SELECT id FROM articles WHERE content_hash=? AND publisher_id<>? ORDER BY id LIMIT 1`).bind(hash,source.id).first();
  await env.DB.prepare(`INSERT INTO publishers(id,name,homepage,role,ownership,enabled,updated_at,priority,notes) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,homepage=excluded.homepage,role=excluded.role,ownership=excluded.ownership,enabled=excluded.enabled,updated_at=excluded.updated_at,priority=excluded.priority,notes=excluded.notes`).bind(source.id,source.name,source.homepage,source.role,source.ownership,source.enabled?1:0,fetched,source.priority||2,source.notes||null).run();
  let id:number;if(known?.id){id=Number(known.id);await env.DB.prepare(`UPDATE articles SET publisher_id=?,canonical_url=?,title=?,summary=?,body_excerpt=?,language=?,published_at=COALESCE(?,published_at),fetched_at=?,status='normalized',extraction_method=?,content_hash=?,syndicated_from_article_id=? WHERE id=?`).bind(source.id,extracted.canonicalUrl,extracted.title,extracted.description,extracted.body.slice(0,12000),extracted.language||source.language[0],extracted.publishedAt||message.publishedAt||null,fetched,extracted.extractionMethod||'fetch+fallback',hash,syndicated?.id||null,id).run()}else{const ins:any=await env.DB.prepare(`INSERT INTO articles(publisher_id,canonical_url,title,summary,body_excerpt,language,published_at,fetched_at,status,extraction_method,content_hash,syndicated_from_article_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).bind(source.id,extracted.canonicalUrl,extracted.title,extracted.description,extracted.body.slice(0,12000),extracted.language||source.language[0],extracted.publishedAt||message.publishedAt||null,fetched,'normalized',extracted.extractionMethod||'fetch+fallback',hash,syndicated?.id||null).run();id=Number(ins.meta.last_row_id)}
  await env.ARCHIVE.put(`articles/${id}.txt`,extracted.body,{httpMetadata:{contentType:'text/plain; charset=utf-8'},customMetadata:{source:source.id,url:extracted.canonicalUrl,extraction:extracted.extractionMethod||'unknown'}});
  if(extracted.image)await env.DB.prepare(`INSERT OR IGNORE INTO image_candidates(article_id,url,source_url,credit,caption,rights_status,created_at) VALUES(?,?,?,?,?,?,?)`).bind(id,extracted.image.url,extracted.image.sourceUrl,extracted.image.credit||source.name,extracted.image.caption||null,'attributed_external',fetched).run();
  const decision=prefilterArticle(extracted,source);
  if(decision==='drop'){await env.DB.prepare(`UPDATE articles SET status='filtered' WHERE id=?`).bind(id).run();await upsertArticleSearch(env,{id,title:extracted.title,summary:extracted.description,body_excerpt:extracted.body.slice(0,12000)},null);return null}
  let packet:StoryPacket|undefined;if(syndicated?.id){const prior:any=await env.DB.prepare(`SELECT * FROM story_packets WHERE article_id=?`).bind(syndicated.id).first();if(prior)packet=packetFromRow(prior,extracted)}
  return {id,source,extracted,decision,syndicatedFrom:syndicated?.id||null,packet};
}

async function persistPacket(env:any,p:Prepared,packet:StoryPacket){
  const fetched=new Date().toISOString();
  await env.DB.prepare(`INSERT INTO story_packets(article_id,summary,key_points_json,what_changed,event_date,event_key,action,object,places_json,people_json,organizations_json,topics_json,issue_candidates_json,created_at,watch_relevance,watch_relevance_confidence,watch_relevance_reason,watch_relevance_evidence_json,watch_desk) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(article_id) DO UPDATE SET summary=excluded.summary,key_points_json=excluded.key_points_json,what_changed=excluded.what_changed,event_date=excluded.event_date,event_key=excluded.event_key,action=excluded.action,object=excluded.object,places_json=excluded.places_json,people_json=excluded.people_json,organizations_json=excluded.organizations_json,topics_json=excluded.topics_json,issue_candidates_json=excluded.issue_candidates_json,created_at=excluded.created_at,watch_relevance=excluded.watch_relevance,watch_relevance_confidence=excluded.watch_relevance_confidence,watch_relevance_reason=excluded.watch_relevance_reason,watch_relevance_evidence_json=excluded.watch_relevance_evidence_json,watch_desk=excluded.watch_desk`).bind(p.id,packet.summary,JSON.stringify(packet.key_points),packet.what_changed,packet.event_date||null,packet.event_key||null,packet.action||null,packet.object||null,JSON.stringify(packet.places),JSON.stringify(packet.people),JSON.stringify(packet.organizations),JSON.stringify(packet.topics),JSON.stringify(packet.issue_candidates),fetched,packet.watch_relevance?1:0,packet.watch_relevance_confidence||0,packet.watch_relevance_reason||null,JSON.stringify(packet.watch_relevance_evidence||[]),packet.watch_desk||'other').run();
  p.packet=packet;
}

async function processBatch(env:any,messages:IngestMessage[]){
  const prepared=(await Promise.all(messages.slice(0,12).map(m=>prepare(env,m)))).filter(Boolean) as Prepared[];
  const needModel=prepared.filter(p=>!p.packet);
  for(let i=0;i<needModel.length;i+=4){const chunk=needModel.slice(i,i+4);const packets=await makeStoryPacketsBatch(env,chunk.map(p=>({id:p.id,article:p.extracted,source:p.source})));for(const p of chunk)p.packet=packets.get(p.id)!}
  for(const p of prepared)if(p.packet)await persistPacket(env,p,p.packet);

  const clusterable:Prepared[]=[];
  for(const p of prepared){const packet=p.packet!;const row:any={id:p.id,title:p.extracted.title,summary:p.extracted.description,body_excerpt:p.extracted.body.slice(0,12000),published_at:p.extracted.publishedAt,fetched_at:new Date().toISOString()};await upsertArticleSearch(env,row,packet);if(!packetRelevant(packet,p.source,p.extracted,p.decision)){await env.DB.prepare(`UPDATE articles SET status='filtered' WHERE id=?`).bind(p.id).run();continue}clusterable.push(p)}

  const clusterInputs=[] as any[];
  for(const p of clusterable){const embeddingInput=`${p.extracted.title}\n${p.packet!.event_key||''}\n${p.packet!.summary}\n${p.packet!.what_changed}\nPlaces: ${p.packet!.places.join(', ')}\nOrganizations: ${p.packet!.organizations.join(', ')}`;const vector=await tryEmbedText(env,embeddingInput);if(vector){try{await env.ARTICLE_INDEX.upsert([{id:String(p.id),values:vector,metadata:{kind:'article',publisher:p.source.id,publishedAt:p.extracted.publishedAt||new Date().toISOString(),title:p.extracted.title}}])}catch(e){console.warn('optional article Vectorize upsert failed',p.id,e)}}const row=await env.DB.prepare(`SELECT * FROM articles WHERE id=?`).bind(p.id).first();clusterInputs.push({article:row,packet:p.packet,vector})}
  const clustered=await clusterArticles(env,clusterInputs);
  for(const p of clusterable){const developmentId=clustered.get(p.id);await maybeResourceCandidate(env,{...p.extracted,id:p.id,packet:p.packet},p.source);await env.DB.prepare(`UPDATE articles SET status='clustered' WHERE id=?`).bind(p.id).run();console.log('article clustered',p.id,developmentId)}
  return {received:messages.length,prepared:prepared.length,clustered:clusterable.length};
}

export async function processArticle(env:any,message:IngestMessage|IngestBatchMessage){
  if((message as IngestBatchMessage)?.kind==='ingest_batch')return processBatch(env,(message as IngestBatchMessage).items||[]);
  return processBatch(env,[message as IngestMessage]);
}

export async function enqueueLegacyReprocessing(env:any,limit=10){
  const rows:any=await env.DB.prepare(`SELECT d.id development_id,a.id article_id,a.publisher_id,a.canonical_url,a.title,a.published_at FROM developments d JOIN development_articles da ON da.development_id=d.id JOIN articles a ON a.id=da.article_id WHERE d.pipeline_version=1 AND d.status IN ('candidate','held','retrying') GROUP BY d.id HAVING COUNT(da.article_id)=1 ORDER BY d.updated_at ASC LIMIT ?`).bind(limit).all();const items:IngestMessage[]=[];
  for(const row of rows.results||[]){await env.DB.prepare(`DELETE FROM development_articles WHERE development_id=?`).bind(row.development_id).run();await env.DB.prepare(`DELETE FROM developments WHERE id=?`).bind(row.development_id).run();await env.DB.prepare(`UPDATE articles SET status='normalized' WHERE id=?`).bind(row.article_id).run();items.push({sourceId:row.publisher_id,url:row.canonical_url,title:row.title,publishedAt:row.published_at,force:true})}
  if(items.length)await env.INGEST_QUEUE.send({kind:'ingest_batch',items});return {queued:items.length};
}
