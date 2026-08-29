import { embedText } from './embedding';import { runChat } from './llm';
export async function answerQuestion(env:any,query:string,locale:'en'|'pmy'){
  const vector=await embedText(env,query);const nearest:any=await env.ARTICLE_INDEX.query(vector,{topK:8,returnMetadata:'all'});const ids=(nearest.matches||[]).map((m:any)=>Number(m.id)).filter(Boolean);let articles:any[]=[];
  if(ids.length){const marks=ids.map(()=>'?').join(',');const rows:any=await env.DB.prepare(`SELECT a.id,a.title,a.summary,a.canonical_url,p.name publisher,p.role FROM articles a JOIN publishers p ON p.id=a.publisher_id WHERE a.id IN (${marks})`).bind(...ids).all();articles=rows.results||[]}
  const resourceRows:any=await env.DB.prepare(`SELECT title,source_url,publisher_id FROM resource_candidates WHERE status='published' AND (title LIKE ? OR publisher_id LIKE ?) LIMIT 4`).bind(`%${query.slice(0,60)}%`,`%${query.slice(0,40)}%`).all();
  const sources=[...articles.map(a=>({title:a.title,url:a.canonical_url,publisher:a.publisher,text:a.summary||''})),...(resourceRows.results||[]).map((r:any)=>({title:r.title,url:r.source_url,publisher:r.publisher_id,text:'Durable resource'}))].slice(0,8);
  if(!sources.length)return {answer:locale==='pmy'?'Belum ada sumber yang cukup di indeks Watch untuk jawab itu.':'The Watch index does not yet contain enough material to answer that.',sources:[]};
  const context=sources.map((s,i)=>`[S${i+1}] ${s.title}\nPublisher: ${s.publisher}\n${s.text}\nURL: ${s.url}`).join('\n\n');const language=locale==='pmy'?'clear everyday Papuan Malay (Melayu Papua)':'English';
  const answer=await runChat(env,[{role:'system',content:`You answer for West Papua Watch from retrieved sources only. Use ${language}. Be concise and calm. Cite factual claims inline as [S1], [S2]. Distinguish reporting, civil-society claims, state media and official records by attribution. If evidence is insufficient, say so. Never invent a source or quote.`},{role:'user',content:`Question: ${query}\n\nRetrieved material:\n${context}`}],'ask',700);
  return {answer,sources:sources.map(({title,url,publisher})=>({title,url,publisher}))};
}
