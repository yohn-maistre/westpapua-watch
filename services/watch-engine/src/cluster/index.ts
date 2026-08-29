import { runChat } from '../llm';

const issueRules:[string,RegExp][]=[
  ['mining-raja-ampat',/raja ampat|gag nikel|waigeo/i],['lake-sentani-watershed',/sentani|cycloop|cagar alam cycloop/i],['south-papua-food-energy-estate',/merauke|papua selatan|food estate|cetak sawah|jagebob/i],['conflict-displacement-access',/pengungsi|displacement|conflict|konflik|military|militer|intan jaya|puncak|nduga/i],['women-gender',/perempuan|mama-mama|women|gender/i],['culture-memory-expression',/seni|art|film|musik|music|sastra|literature|udeido|mambesak/i],['political-status-representation',/otonomi|autonomy|self-determination|merdeka|political status|status politik/i]
];
export const matchIssue=(text:string)=>issueRules.find(([,rx])=>rx.test(text))?.[0]||null;

async function sameEvent(env:any,a:any,b:any):Promise<boolean>{
  const prompt=`Determine whether these two news records describe the same concrete real-world development, not merely the same topic. Return JSON only: {"same_event":true|false,"confidence":0-1}.\nA: ${a.title}\n${a.summary||''}\nDate: ${a.published_at||''}\n\nB: ${b.title}\n${b.summary||''}\nDate: ${b.published_at||''}`;
  try{const raw=await runChat(env,[{role:'system',content:'Be conservative about merging events. Same place or topic alone is not enough.'},{role:'user',content:prompt}],'fast',120);const json=JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0]||'{}');return json.same_event===true&&Number(json.confidence||0)>=.68}catch{return false}
}

export async function clusterArticle(env:any,article:any,vector:number[]){
  const existing=await env.DB.prepare(`SELECT development_id FROM development_articles WHERE article_id=? LIMIT 1`).bind(article.id).first();if(existing?.development_id)return Number(existing.development_id);
  const result:any=await env.ARTICLE_INDEX.query(vector,{topK:7,returnMetadata:'all'});const candidates=(result?.matches||[]).filter((m:any)=>String(m.id)!==String(article.id)&&Number(m.score||0)>=.66);
  let developmentId:number|null=null;
  for(const match of candidates.slice(0,3)){
    const candidate=await env.DB.prepare(`SELECT a.*, da.development_id FROM articles a LEFT JOIN development_articles da ON da.article_id=a.id WHERE a.id=?`).bind(Number(match.id)).first();if(!candidate)continue;
    if(!await sameEvent(env,article,candidate))continue;
    developmentId=candidate.development_id?Number(candidate.development_id):null;
    if(!developmentId){const issue=matchIssue(`${candidate.title} ${candidate.summary||''}`);const inserted:any=await env.DB.prepare(`INSERT INTO developments(issue_slug,title_en,summary_en,status,first_seen_at,updated_at) VALUES(?,?,?,?,?,?)`).bind(issue,candidate.title,candidate.summary||'', 'candidate',candidate.published_at||candidate.fetched_at,new Date().toISOString()).run();developmentId=Number(inserted.meta.last_row_id);await env.DB.prepare(`INSERT OR IGNORE INTO development_articles(development_id,article_id,membership_score,membership_method) VALUES(?,?,?,?)`).bind(developmentId,candidate.id,Number(match.score||0),'vector+llm').run()}
    break;
  }
  if(!developmentId){const issue=matchIssue(`${article.title} ${article.summary||''}`);const inserted:any=await env.DB.prepare(`INSERT INTO developments(issue_slug,title_en,summary_en,status,first_seen_at,updated_at) VALUES(?,?,?,?,?,?)`).bind(issue,article.title,article.summary||'','candidate',article.published_at||article.fetched_at,new Date().toISOString()).run();developmentId=Number(inserted.meta.last_row_id)}
  await env.DB.prepare(`INSERT OR IGNORE INTO development_articles(development_id,article_id,membership_score,membership_method) VALUES(?,?,?,?)`).bind(developmentId,article.id,1,'primary').run();
  const count:any=await env.DB.prepare(`SELECT COUNT(DISTINCT a.publisher_id) AS n FROM development_articles da JOIN articles a ON a.id=da.article_id WHERE da.development_id=?`).bind(developmentId).first();
  if(Number(count?.n||0)>=2){
    const rows:any=await env.DB.prepare(`SELECT a.title,a.summary,p.name publisher FROM development_articles da JOIN articles a ON a.id=da.article_id JOIN publishers p ON p.id=a.publisher_id WHERE da.development_id=? ORDER BY a.published_at DESC LIMIT 6`).bind(developmentId).all();
    const context=(rows.results||[]).map((r:any,i:number)=>`[${i+1}] ${r.publisher}: ${r.title}\n${r.summary||''}`).join('\n\n');
    try{const text=await runChat(env,[{role:'system',content:'Write a neutral, concise development summary from multiple attributed reports. Do not invent facts. Return JSON only with title and summary.'},{role:'user',content:context}],'fast',240);const obj=JSON.parse(text.match(/\{[\s\S]*\}/)?.[0]||'{}');if(obj.title&&obj.summary)await env.DB.prepare(`UPDATE developments SET title_en=?,summary_en=?,status=?,updated_at=? WHERE id=?`).bind(String(obj.title).slice(0,500),String(obj.summary).slice(0,1600),env.AUTO_PUBLISH==='true'?'published':'candidate',new Date().toISOString(),developmentId).run()}catch{}
  }
  return developmentId;
}
