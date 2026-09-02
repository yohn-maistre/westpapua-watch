import { runJson } from '../llm';
import { jaccard,listOverlap,searchDevelopmentFts,upsertDevelopmentSearch } from '../search';
import { issueSlugsFor,syncDevelopmentKnowledge } from '../knowledge';
import { markDevelopmentEditorialPending } from './editorial';
import type { StoryPacket } from '../types';

const arr=(v:any)=>{try{const x=JSON.parse(String(v||'[]'));return Array.isArray(x)?x.map(String):[]}catch{return[]}};
const dateScore=(a?:string,b?:string)=>{if(!a||!b)return .3;const d=Math.abs(+new Date(a)-+new Date(b))/864e5;if(d<=1)return 1;if(d<=3)return .82;if(d<=7)return .55;if(d<=14)return .25;return 0};
export const matchIssue=(s:string)=>issueSlugsFor(s)[0]||null;

type ClusterInput={article:any;packet:StoryPacket;vector?:number[]|null};
type Candidate={id:number;score:number;title:string;summary:string;event_signature:string;event_date?:string;places:string[];organizations:string[]};

async function candidateDetails(env:any,id:number):Promise<Candidate|null>{
  const d:any=await env.DB.prepare(`SELECT d.id,d.title_en,d.title_id,d.summary_en,d.summary_id,d.event_signature,d.updated_at,sp.event_date,sp.places_json,sp.organizations_json FROM developments d LEFT JOIN development_articles da ON da.development_id=d.id LEFT JOIN articles a ON a.id=da.article_id LEFT JOIN story_packets sp ON sp.article_id=a.id WHERE d.id=? AND d.status NOT IN ('filtered','merged') ORDER BY COALESCE(a.published_at,a.fetched_at) DESC LIMIT 1`).bind(id).first();
  if(!d)return null;return {id:Number(d.id),score:0,title:d.title_id||d.title_en||'',summary:d.summary_id||d.summary_en||'',event_signature:d.event_signature||'',event_date:d.event_date||d.updated_at,places:arr(d.places_json),organizations:arr(d.organizations_json)};
}

function scoreCandidate(article:any,packet:StoryPacket,c:Candidate){
  const lexical=Math.max(jaccard(`${packet.event_key||''} ${article.title}`,`${c.event_signature||''} ${c.title}`),jaccard(packet.summary,c.summary));
  const place=listOverlap(packet.places,c.places),org=listOverlap(packet.organizations,c.organizations),time=dateScore(packet.event_date||article.published_at,c.event_date);
  return .52*lexical+.18*place+.14*org+.16*time;
}

async function denseIds(env:any,vector:number[]|null|undefined){
  if(!vector)return[];try{const q:any=await env.ARTICLE_INDEX.query(vector,{topK:18,returnMetadata:'all'});return (q?.matches||[]).filter((m:any)=>String(m.id).startsWith('dev:')&&Number(m.score||0)>=.58).map((m:any)=>Number(String(m.id).slice(4))).filter(Number.isFinite).slice(0,6)}catch{return[]}
}

async function candidatesFor(env:any,input:ClusterInput){
  const text=`${input.packet.event_key||''} ${input.article.title||''} ${input.packet.places.join(' ')} ${input.packet.organizations.join(' ')} ${input.packet.action||''} ${input.packet.object||''}`;
  const ids=[...new Set([...(await searchDevelopmentFts(env,text,8)),...(await denseIds(env,input.vector))])].slice(0,10);
  const out:Candidate[]=[];for(const id of ids){const c=await candidateDetails(env,id);if(c){c.score=scoreCandidate(input.article,input.packet,c);out.push(c)}}
  return out.sort((a,b)=>b.score-a.score).slice(0,4);
}

async function createDevelopment(env:any,article:any,p:StoryPacket){
  const issue=matchIssue(`${article.title} ${p.summary} ${p.issue_candidates.join(' ')}`),now=new Date().toISOString();
  const signature=`${p.event_key||article.title}\n${p.action||''} ${p.object||''}\nPlaces: ${p.places.join(', ')}\nOrganizations: ${p.organizations.join(', ')}`.slice(0,2200);
  const ins:any=await env.DB.prepare(`INSERT INTO developments(issue_slug,title_en,summary_en,title_id,summary_id,event_signature,status,first_seen_at,updated_at,last_growth_at,pipeline_version,editorial_pending) VALUES(?,?,?,?,?,?,'candidate',?,?,?,?,1)`).bind(issue,article.title,p.summary,article.title,p.summary,signature,article.published_at||article.fetched_at,now,now,2).run();
  const id=Number(ins.meta.last_row_id);await syncDevelopmentKnowledge(env,id,p,article.title);await upsertDevelopmentSearch(env,id,{title:article.title,summary:p.summary,event_key:p.event_key,event_signature:signature,places:p.places,organizations:p.organizations,topics:p.topics});return id;
}

async function attach(env:any,id:number,input:ClusterInput,method:string){
  await env.DB.prepare(`INSERT OR IGNORE INTO development_articles(development_id,article_id,membership_score,membership_method) VALUES(?,?,?,?)`).bind(id,input.article.id,1,method).run();
  await syncDevelopmentKnowledge(env,id,input.packet,input.article.title||'');
  await env.DB.prepare(`UPDATE developments SET last_growth_at=?,updated_at=?,editorial_pending=1 WHERE id=?`).bind(new Date().toISOString(),new Date().toISOString(),id).run();
  await markDevelopmentEditorialPending(env,id);return id;
}

const adjudicationItem={type:'object',properties:{article_id:{type:'integer'},development_id:{type:'integer'},relation:{type:'string',enum:['same_event','new_event']},reason:{type:'string'}},required:['article_id','development_id','relation','reason'],additionalProperties:false};
const adjudicationSchema={type:'object',properties:{items:{type:'array',items:adjudicationItem}},required:['items'],additionalProperties:false};

export async function clusterArticles(env:any,inputs:ClusterInput[]){
  const results=new Map<number,number>();const ambiguous:{input:ClusterInput;candidates:Candidate[]}[]=[];
  for(const input of inputs){
    const linked:any=await env.DB.prepare(`SELECT development_id FROM development_articles WHERE article_id=? LIMIT 1`).bind(input.article.id).first();
    if(linked?.development_id){await syncDevelopmentKnowledge(env,Number(linked.development_id),input.packet,input.article.title||'');await markDevelopmentEditorialPending(env,Number(linked.development_id));results.set(Number(input.article.id),Number(linked.development_id));continue}
    const cs=await candidatesFor(env,input),best=cs[0];
    if(best&&best.score>=.72){results.set(Number(input.article.id),await attach(env,best.id,input,'hybrid-high-confidence'));continue}
    if(!best||best.score<.34){const id=await createDevelopment(env,input.article,input.packet);await attach(env,id,input,'new-event');results.set(Number(input.article.id),id);continue}
    ambiguous.push({input,candidates:cs});
  }
  if(ambiguous.length){
    const prompt=ambiguous.map(({input,candidates})=>`ARTICLE ${input.article.id}\n${input.article.title}\nEvent key: ${input.packet.event_key}\nDate: ${input.packet.event_date||input.article.published_at||''}\nPlaces: ${input.packet.places.join(', ')}\nOrganizations: ${input.packet.organizations.join(', ')}\nCandidates:\n${candidates.map(c=>`D${c.id} score=${c.score.toFixed(3)} ${c.title}\n${c.summary}`).join('\n')}`).join('\n\n---\n\n');
    let decisions=new Map<number,any>();
    try{const o:any=await runJson(env,[{role:'system',content:'For each article, decide whether it is the SAME concrete event as exactly one candidate Development. Same topic or same ongoing issue is not enough. Return new_event when uncertain.'},{role:'user',content:prompt}],adjudicationSchema,'fast',Math.min(1900,500+ambiguous.length*240));decisions=new Map((o.items||[]).map((x:any)=>[Number(x.article_id),x]))}catch(e){console.warn('batched event adjudication degraded to deterministic thresholds',e)}
    for(const a of ambiguous){const articleId=Number(a.input.article.id),d=decisions.get(articleId),candidate=a.candidates.find(c=>c.id===Number(d?.development_id));let id:number;
      if(d?.relation==='same_event'&&candidate)id=await attach(env,candidate.id,a.input,'hybrid-qwen-adjudicated');
      else if(!d&&a.candidates[0]?.score>=.58)id=await attach(env,a.candidates[0].id,a.input,'hybrid-deterministic-fallback');
      else {id=await createDevelopment(env,a.input.article,a.input.packet);await attach(env,id,a.input,'new-event')}
      results.set(articleId,id);
    }
  }
  return results;
}

export async function clusterArticle(env:any,article:any,vector?:number[]){
  const p:any=await env.DB.prepare(`SELECT * FROM story_packets WHERE article_id=?`).bind(article.id).first();
  const packet:StoryPacket={summary:p?.summary||article.summary||'',key_points:arr(p?.key_points_json),what_changed:p?.what_changed||'',event_date:p?.event_date,event_key:p?.event_key,action:p?.action,object:p?.object,places:arr(p?.places_json),people:arr(p?.people_json),organizations:arr(p?.organizations_json),topics:arr(p?.topics_json),issue_candidates:arr(p?.issue_candidates_json)};
  return (await clusterArticles(env,[{article,packet,vector}])).get(Number(article.id))!;
}

export async function reconcileRecentDevelopments(env:any,limit=8){
  const rows:any=await env.DB.prepare(`SELECT id,title_en,title_id,summary_en,summary_id,event_signature FROM developments WHERE status IN ('published','candidate','retrying','editorial_queued') AND updated_at>=datetime('now','-7 days') ORDER BY updated_at DESC LIMIT ?`).bind(limit).all();
  let merged=0;for(const seed of rows.results||[]){const ids=await searchDevelopmentFts(env,`${seed.event_signature||''} ${seed.title_id||seed.title_en}`,5);for(const targetId of ids){if(targetId===Number(seed.id))continue;const target:any=await env.DB.prepare(`SELECT id,title_en,title_id,summary_en,summary_id,event_signature FROM developments WHERE id=? AND status NOT IN ('merged','filtered')`).bind(targetId).first();if(!target)continue;const sim=Math.max(jaccard(seed.event_signature||seed.title_en,target.event_signature||target.title_en),jaccard(seed.title_id||seed.title_en,target.title_id||target.title_en));if(sim<.88)continue;const keep=Math.min(Number(seed.id),targetId),drop=Math.max(Number(seed.id),targetId),now=new Date().toISOString();await env.DB.prepare(`INSERT OR IGNORE INTO development_articles(development_id,article_id,membership_score,membership_method) SELECT ?,article_id,membership_score,'reconcile-fts' FROM development_articles WHERE development_id=?`).bind(keep,drop).run();await env.DB.prepare(`INSERT INTO development_issues(development_id,issue_slug,score,relation,created_at,updated_at) SELECT ?,issue_slug,score,relation,?,? FROM development_issues WHERE development_id=? ON CONFLICT(development_id,issue_slug) DO UPDATE SET score=MAX(development_issues.score,excluded.score),updated_at=excluded.updated_at`).bind(keep,now,now,drop).run();await env.DB.prepare(`INSERT INTO development_places(development_id,place_slug,score,relation,created_at,updated_at) SELECT ?,place_slug,score,relation,?,? FROM development_places WHERE development_id=? ON CONFLICT(development_id,place_slug) DO UPDATE SET score=MAX(development_places.score,excluded.score),updated_at=excluded.updated_at`).bind(keep,now,now,drop).run();await env.DB.prepare(`UPDATE developments SET status='merged',merged_into_id=?,editorial_pending=0,updated_at=? WHERE id=?`).bind(keep,now,drop).run();await env.DB.prepare(`DELETE FROM development_articles WHERE development_id=?`).bind(drop).run();await markDevelopmentEditorialPending(env,keep);merged++;break}}
  return {checked:(rows.results||[]).length,merged};
}
