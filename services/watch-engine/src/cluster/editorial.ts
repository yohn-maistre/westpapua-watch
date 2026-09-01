import { runJson,isGatewayQuotaError,modelLabelFor,type ChatPurpose } from '../llm';
import { embedText } from '../embedding';

const arr=(v:any)=>{try{return JSON.parse(String(v||'[]')) as string[]}catch{return[]}};
const text=(v:any,n:number)=>String(v||'').trim().slice(0,n);
const list=(v:any,n=12)=>Array.isArray(v)?v.map(String).map(x=>x.trim()).filter(Boolean).slice(0,n):[];
const MAX_LOGICAL_REVISIONS=6;

const draftSchema={type:'object',properties:{title_en:{type:'string'},summary_en:{type:'string'},title_id:{type:'string'},summary_id:{type:'string'},what_changed_en:{type:'string'},what_changed_id:{type:'string'},common_ground:{type:'array',items:{type:'string'}},source_notes:{type:'array',items:{type:'string'}},places:{type:'array',items:{type:'string'}},topics:{type:'array',items:{type:'string'}}},required:['title_en','summary_en','title_id','summary_id','what_changed_en','what_changed_id','common_ground','source_notes','places','topics']};
const criticSchema={type:'object',properties:{verdict:{type:'string',enum:['pass','revise']},unsupported_claims:{type:'array',items:{type:'string'}},framing_problems:{type:'array',items:{type:'string'}},cluster_problem:{type:'boolean'},relevance_problem:{type:'boolean'},note:{type:'string'}},required:['verdict','unsupported_claims','framing_problems','cluster_problem','relevance_problem','note']};

async function loadItems(env:any,id:number){
  const rows:any=await env.DB.prepare(`SELECT a.id,a.title,a.summary,a.published_at,a.fetched_at,a.syndicated_from_article_id,a.canonical_url,p.id publisher_id,p.name publisher,p.role,sp.summary packet_summary,sp.key_points_json,sp.what_changed,sp.places_json,sp.organizations_json,sp.topics_json,sp.issue_candidates_json,sp.watch_relevance,sp.watch_relevance_confidence FROM development_articles da JOIN articles a ON a.id=da.article_id JOIN publishers p ON p.id=a.publisher_id LEFT JOIN story_packets sp ON sp.article_id=a.id WHERE da.development_id=? ORDER BY COALESCE(a.published_at,a.fetched_at) DESC LIMIT 12`).bind(id).all();
  return rows.results||[];
}

const contextFor=(items:any[])=>items.map((r:any,i:number)=>`[S${i+1}] ${r.publisher} (${r.role})\nURL: ${r.canonical_url}\nTitle: ${r.title}\nRingkasan: ${r.packet_summary||r.summary||''}\nPerubahan: ${r.what_changed||''}\nPoin: ${arr(r.key_points_json).join('; ')}\nPlaces: ${arr(r.places_json).join(', ')}\nOrganizations: ${arr(r.organizations_json).join(', ')}\nTopics: ${arr(r.topics_json).join(', ')}`).join('\n\n');

async function writeDraft(env:any,items:any[],repair=''){
  const originals=items.filter(x=>!x.syndicated_from_article_id);
  const count=new Set(originals.map(x=>x.publisher_id)).size;
  const prompt=`Write one event-level development for West Papua Watch from these source packets. Produce publication-ready English and Bahasa Indonesia, not Papuan Malay. Every factual claim must be supported. If one original publisher is the sole source for a material claim, explicitly attribute it. Preserve disagreement and uncertainty. Do not turn official, military, movement, NGO or advocacy claims into anonymous facts. Original publisher count: ${count}.${repair?`\nRepair these critic findings:\n${repair}`:''}\n\n${contextFor(items)}`;
  const o:any=await runJson(env,[{role:'system',content:'You are a restrained multilingual aggregation editor. English should read naturally; Bahasa Indonesia should read like careful Indonesian journalism.'},{role:'user',content:prompt}],draftSchema,'synthesis',1100);
  return {title_en:text(o.title_en,500),summary_en:text(o.summary_en,1800),title_id:text(o.title_id,500),summary_id:text(o.summary_id,1800),what_changed_en:text(o.what_changed_en,1400),what_changed_id:text(o.what_changed_id,1400),common_ground:list(o.common_ground),source_notes:list(o.source_notes),places:list(o.places),topics:list(o.topics)};
}

async function critique(env:any,items:any[],draft:any){
  const prompt=`Audit this event synthesis against the source packets. Check factual support, attribution, headline overclaiming, syndication, geography/relevance, and whether all records describe ONE concrete event rather than merely the same topic. A single credible local report can pass when clearly attributed. Return pass if there is no material problem; otherwise revise and state exactly what must change.\n\nEN TITLE: ${draft.title_en}\nEN SUMMARY: ${draft.summary_en}\nID TITLE: ${draft.title_id}\nID SUMMARY: ${draft.summary_id}\n\n${contextFor(items)}`;
  const messages=[{role:'system',content:'You are an evidence critic. Judge against supplied evidence, not against whether you personally like the framing.'},{role:'user',content:prompt}];
  let o:any;
  try{
    o=await runJson(env,messages,criticSchema,'fast',520);
  }catch(fastError){
    // Provider quota is global backpressure, not a critic-model failure: do not
    // consume the synthesis route as a second probe after a 429.
    if(isGatewayQuotaError(fastError))throw fastError;
    console.warn('fast critic route failed; retrying on synthesis route',fastError);
    o=await runJson(env,messages,criticSchema,'synthesis',520);
  }
  return {verdict:o.verdict==='pass'?'pass':'revise',unsupported:list(o.unsupported_claims,8),framing:list(o.framing_problems,8),cluster_problem:o.cluster_problem===true,relevance_problem:o.relevance_problem===true,note:text(o.note,600)};
}

const feedback=(r:any)=>[...list(r?.unsupported,8).map((x:string)=>`Unsupported: ${x}`),...list(r?.framing,8).map((x:string)=>`Framing: ${x}`),text(r?.note,800)].filter(Boolean).join('\n').slice(0,2600);

async function lastFeedback(env:any,id:number){
  const r:any=await env.DB.prepare(`SELECT unsupported_claims_json,framing_problems_json,note FROM critic_reviews WHERE development_id=? ORDER BY id DESC LIMIT 1`).bind(id).first();
  if(!r)return '';
  return feedback({unsupported:arr(r.unsupported_claims_json),framing:arr(r.framing_problems_json),note:r.note});
}

async function saveReview(env:any,id:number,r:any,attempt:number){
  await env.DB.prepare(`INSERT INTO critic_reviews(development_id,verdict,unsupported_claims_json,framing_problems_json,cluster_problem,relevance_problem,note,attempt,created_at) VALUES(?,?,?,?,?,?,?,?,?)`).bind(id,r.verdict,JSON.stringify(r.unsupported),JSON.stringify(r.framing),r.cluster_problem?1:0,r.relevance_problem?1:0,r.note||null,attempt,new Date().toISOString()).run();
}

async function logStage(env:any,id:number,stage:string,outcome:string,purpose?:ChatPurpose,error?:any){
  try{
    await env.DB.prepare(`INSERT INTO engine_attempts(development_id,stage,outcome,model,error,created_at) VALUES(?,?,?,?,?,?)`).bind(id,stage,outcome,purpose?modelLabelFor(env,purpose):null,error?String(error?.message||error).slice(0,1600):null,new Date().toISOString()).run();
  }catch(e){console.error('engine attempt log failed',stage,outcome,e)}
}

async function runStage<T>(env:any,id:number,stage:string,purpose:ChatPurpose|undefined,fn:()=>Promise<T>):Promise<T>{
  await logStage(env,id,stage,'started',purpose);
  try{
    const value=await fn();
    await logStage(env,id,stage,'success',purpose);
    return value;
  }catch(e){
    await logStage(env,id,stage,'error',purpose,e);
    throw e;
  }
}

export async function queueDevelopmentForEditorial(env:any,id:number,force=false){
  const d:any=await env.DB.prepare(`SELECT status,editorial_not_before FROM developments WHERE id=?`).bind(id).first();
  if(!d||['filtered','merged'].includes(String(d.status)))return false;
  if(d.editorial_not_before&&new Date(d.editorial_not_before).getTime()>Date.now())return false;
  if(d.status==='editorial_queued'&&!force)return false;
  await env.EDITORIAL_QUEUE.send({kind:'editorial',developmentId:id});
  if(d.status!=='published')await env.DB.prepare(`UPDATE developments SET status='editorial_queued',updated_at=? WHERE id=?`).bind(new Date().toISOString(),id).run();
  return true;
}

async function splitCluster(env:any,id:number,items:any[],wasPublished:boolean){
  if(items.length<2)return [id];
  const ids=[id];
  for(const item of items.slice(1)){
    await env.DB.prepare(`DELETE FROM development_articles WHERE development_id=? AND article_id=?`).bind(id,item.id).run();
    const now=new Date().toISOString();
    const ins:any=await env.DB.prepare(`INSERT INTO developments(title_en,summary_en,status,first_seen_at,updated_at,last_growth_at,pipeline_version) VALUES(?,?,?,?,?,?,2)`).bind(item.title,item.packet_summary||item.summary||'','candidate',item.published_at||item.fetched_at,now,now).run();
    const newId=Number(ins.meta.last_row_id);
    await env.DB.prepare(`INSERT OR IGNORE INTO development_articles(development_id,article_id,membership_score,membership_method) VALUES(?,?,1,'cluster-repair')`).bind(newId,item.id).run();
    ids.push(newId);
  }
  await env.DB.prepare(`UPDATE developments SET status=?,retry_count=0,updated_at=? WHERE id=?`).bind(wasPublished?'published':'candidate',new Date().toISOString(),id).run();
  return ids;
}

async function writeIssueDelta(env:any,id:number,slug:string,d:any){
  const schema={type:'object',properties:{delta_summary_en:{type:'string'},delta_summary_id:{type:'string'},significance:{type:'string',enum:['low','medium','high']}},required:['delta_summary_en','delta_summary_id','significance']};
  try{
    const o:any=await runJson(env,[{role:'system',content:'Write only the new issue-timeline change. Return careful English and Bahasa Indonesia.'},{role:'user',content:`Issue: ${slug}\nDevelopment EN: ${d.title_en}\n${d.summary_en}\nDevelopment ID: ${d.title_id}\n${d.summary_id}\nWhat changed: ${d.what_changed_id}`}],schema,'fast',320);
    const prior:any=await env.DB.prepare(`SELECT id FROM issue_delta_candidates WHERE development_id=? ORDER BY id DESC LIMIT 1`).bind(id).first();
    const now=new Date().toISOString();
    if(prior?.id)await env.DB.prepare(`UPDATE issue_delta_candidates SET delta_summary=?,delta_summary_id=?,significance=?,status='published',created_at=? WHERE id=?`).bind(text(o.delta_summary_en,1600),text(o.delta_summary_id,1600),o.significance,now,prior.id).run();
    else await env.DB.prepare(`INSERT INTO issue_delta_candidates(issue_slug,development_id,delta_summary,delta_summary_id,significance,status,created_at) VALUES(?,?,?,?,?,'published',?)`).bind(slug,id,text(o.delta_summary_en,1600),text(o.delta_summary_id,1600),o.significance,now).run();
  }catch(e){console.error('issue delta synthesis failed',id,e)}
}

function developmentSignature(draft:any){
  return `${draft.title_id}\n${draft.summary_id}\n${draft.what_changed_id}\nPlaces: ${draft.places.join(', ')}\nTopics: ${draft.topics.join(', ')}`.slice(0,2400);
}

async function indexDevelopment(env:any,id:number,draft:any,signature=developmentSignature(draft)){
  const vector=await embedText(env,signature);
  await env.ARTICLE_INDEX.upsert([{id:`dev:${id}`,values:vector,metadata:{kind:'development',developmentId:id,updatedAt:Date.now(),title:draft.title_id}}]);
  return signature;
}

async function rank(env:any,id:number){
  const r:any=await env.DB.prepare(`SELECT COUNT(DISTINCT da.article_id) article_count,COUNT(DISTINCT CASE WHEN a.syndicated_from_article_id IS NULL THEN a.publisher_id END) source_count,MAX(CASE WHEN p.role IN ('local_newsroom','alternative_media') THEN 1 ELSE 0 END) local_source,MAX(COALESCE(a.published_at,a.fetched_at)) newest FROM development_articles da JOIN articles a ON a.id=da.article_id JOIN publishers p ON p.id=a.publisher_id WHERE da.development_id=?`).bind(id).first();
  const age=Math.max(0,(Date.now()-new Date(r?.newest||Date.now()).getTime())/36e5);
  const score=Math.max(0,60-age*1.2)+Math.min(24,Number(r?.source_count||0)*8)+Math.min(12,Number(r?.article_count||0)*3)+(r?.local_source?10:0);
  return Number(score.toFixed(2));
}

function safeSourceBrief(items:any[]){
  const first=items[0];
  const packet=first?.packet_summary||first?.summary||'';
  const title=first?.title||'West Papua update';
  const publisher=first?.publisher||'Source';
  return {
    title_en:`Source brief: ${title}`.slice(0,500),
    summary_en:`${publisher} reports on “${title}”. West Papua Watch is publishing this directly attributed source brief after repeated synthesis revisions. Read the original report for the full account.`.slice(0,1800),
    title_id:`Ringkasan sumber: ${title}`.slice(0,500),
    summary_id:`${publisher} melaporkan “${title}”. West Papua Watch menerbitkan ringkasan sumber dengan atribusi langsung setelah beberapa kali revisi sintesis. Baca laporan asli untuk keterangan lengkap.${packet?` Ringkasan sumber: ${packet}`:''}`.slice(0,1800),
    what_changed_en:`New reporting from ${publisher}.`,
    what_changed_id:`Ada laporan baru dari ${publisher}.`,
    common_ground:[],
    source_notes:[`Safe source brief fallback after ${MAX_LOGICAL_REVISIONS} editorial revisions.`],
    places:arr(first?.places_json),
    topics:arr(first?.topics_json)
  };
}

async function finalize(env:any,id:number,dev:any,draft:any,sourceBrief=false){
  const now=new Date().toISOString();
  const signature=developmentSignature(draft);
  await env.DB.prepare(`INSERT INTO development_syntheses(development_id,title,summary,what_changed,what_changed_id,common_ground_json,source_notes_json,places_json,topics_json,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)`).bind(id,draft.title_en,draft.summary_en,draft.what_changed_en,draft.what_changed_id,JSON.stringify(draft.common_ground),JSON.stringify(draft.source_notes),JSON.stringify(draft.places),JSON.stringify(draft.topics),now).run();
  let score=await rank(env,id);if(sourceBrief)score=Math.max(0,score-18);
  const status=env.AUTO_PUBLISH==='true'?'published':'candidate';

  // Publication is authoritative D1 state. Vector indexing is retrieval infrastructure,
  // so a depleted embedding quota must never prevent a reviewed story from going live.
  await env.DB.prepare(`UPDATE developments SET title_en=?,summary_en=?,title_id=?,summary_id=?,title_pmy=NULL,summary_pmy=NULL,event_signature=?,ranking_score=?,status=?,retry_count=0,updated_at=? WHERE id=?`).bind(draft.title_en,draft.summary_en,draft.title_id,draft.summary_id,signature,score,status,now,id).run();

  try{
    await runStage(env,id,'vector-index',undefined,()=>indexDevelopment(env,id,draft,signature));
  }catch(e){
    console.warn('development published without refreshed vector index; catch-up can run later',id,e);
  }

  if(dev?.issue_slug&&status==='published')await writeIssueDelta(env,id,dev.issue_slug,draft);
  return {status,ranking_score:score,sourceBrief};
}

export async function processEditorialJob(env:any,message:any){
  const id=Number(message?.developmentId);if(!Number.isFinite(id))return {status:'invalid'};
  const dev:any=await env.DB.prepare(`SELECT status,issue_slug,retry_count,editorial_not_before FROM developments WHERE id=?`).bind(id).first();
  if(!dev||['filtered','merged'].includes(String(dev.status)))return {status:dev?.status||'missing'};
  if(dev.status==='held'&&dev.editorial_not_before&&new Date(dev.editorial_not_before).getTime()>Date.now())return {status:'held',not_before:dev.editorial_not_before};
  const items=await loadItems(env,id);if(!items.length)return {status:'empty'};
  const attempt=Number(dev.retry_count||0)+1;
  const repair=await lastFeedback(env,id);
  const draft=await runStage(env,id,'writer','synthesis',()=>writeDraft(env,items,repair));
  if(!draft.title_en||!draft.summary_en||!draft.title_id||!draft.summary_id)throw new Error('empty structured draft');
  const review=await runStage(env,id,'critic','fast',()=>critique(env,items,draft));
  await saveReview(env,id,review,attempt);

  const stronglyRelevant=items.some((x:any)=>Number(x.watch_relevance||0)===1&&Number(x.watch_relevance_confidence||0)>=.72);
  const effectiveClusterProblem=review.cluster_problem&&items.length>1;
  const effectiveRelevanceProblem=review.relevance_problem&&!stronglyRelevant;

  if(effectiveClusterProblem){
    const ids=await splitCluster(env,id,items,dev.status==='published');
    for(const developmentId of ids)await queueDevelopmentForEditorial(env,developmentId,true);
    return {status:'reclustered',ids,review};
  }

  if(effectiveRelevanceProblem&&dev.status!=='published'){
    await env.DB.prepare(`UPDATE developments SET status='filtered',updated_at=? WHERE id=?`).bind(new Date().toISOString(),id).run();
    return {status:'filtered',review};
  }

  if(review.verdict==='pass'&&!effectiveClusterProblem&&!effectiveRelevanceProblem){
    return runStage(env,id,'finalize',undefined,()=>finalize(env,id,dev,draft,false));
  }

  if(attempt>=MAX_LOGICAL_REVISIONS&&!effectiveClusterProblem&&!effectiveRelevanceProblem){
    return runStage(env,id,'finalize',undefined,()=>finalize(env,id,dev,safeSourceBrief(items),true));
  }

  await env.DB.prepare(`UPDATE developments SET retry_count=retry_count+1,status=CASE WHEN status='published' THEN 'published' ELSE 'editorial_queued' END,updated_at=? WHERE id=?`).bind(new Date().toISOString(),id).run();
  await env.EDITORIAL_QUEUE.send({kind:'editorial',developmentId:id});
  return {status:'requeued',attempt,review,effectiveClusterProblem,effectiveRelevanceProblem};
}

export async function enqueueEditorialBacklog(env:any,limit=24){
  const rows:any=await env.DB.prepare(`SELECT id,status FROM developments WHERE pipeline_version>=2 AND status IN ('candidate','retrying','held') AND (editorial_not_before IS NULL OR editorial_not_before<=strftime('%Y-%m-%dT%H:%M:%fZ','now')) ORDER BY updated_at ASC LIMIT ?`).bind(limit).all();
  let queued=0;
  for(const r of rows.results||[]){
    if(await queueDevelopmentForEditorial(env,Number(r.id)))queued++;
  }
  return {checked:(rows.results||[]).length,queued};
}
