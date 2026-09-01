const STOP=new Set('yang dan dari untuk dengan pada dalam ini itu atau ke di atas oleh telah sudah akan juga sebagai tentang setelah sebelum saat karena into the a an of to for in on at from with and or is are was were be been being'.split(/\s+/));
export const tokens=(value:string)=>String(value||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9\u00c0-\u024f]+/gi,' ').split(/\s+/).filter(x=>x.length>2&&!STOP.has(x));
export const jaccard=(a:string,b:string)=>{const A=new Set(tokens(a)),B=new Set(tokens(b));if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/(A.size+B.size-n)};
export const listOverlap=(a:string[],b:string[])=>{const A=new Set((a||[]).map(x=>x.toLowerCase())),B=new Set((b||[]).map(x=>x.toLowerCase()));if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.max(A.size,B.size)};
const safeParse=(v:any)=>{try{const x=JSON.parse(String(v||'[]'));return Array.isArray(x)?x.map(String):[]}catch{return[]}};

function matchQuery(text:string){
  const uniq=[...new Set(tokens(text))].slice(0,16);
  return uniq.map(t=>`"${t.replace(/"/g,'')}"`).join(' OR ');
}

export async function upsertArticleSearch(env:any,article:any,packet:any){
  try{
    await env.DB.prepare(`DELETE FROM article_fts WHERE article_id=?`).bind(String(article.id)).run();
    await env.DB.prepare(`INSERT INTO article_fts(article_id,title,summary,body,places,organizations,topics) VALUES(?,?,?,?,?,?,?)`).bind(
      String(article.id),article.title||'',packet?.summary||article.summary||'',article.body_excerpt||'',
      (packet?.places||safeParse(packet?.places_json)).join(' '),(packet?.organizations||safeParse(packet?.organizations_json)).join(' '),(packet?.topics||safeParse(packet?.topics_json)).join(' ')
    ).run();
  }catch(e){console.warn('article FTS update failed',article?.id,e)}
}

export async function upsertDevelopmentSearch(env:any,id:number,data:any){
  try{
    await env.DB.prepare(`DELETE FROM development_fts WHERE development_id=?`).bind(String(id)).run();
    await env.DB.prepare(`INSERT INTO development_fts(development_id,title,summary,event_key,places,organizations,topics) VALUES(?,?,?,?,?,?,?)`).bind(
      String(id),data.title||data.title_id||data.title_en||'',data.summary||data.summary_id||data.summary_en||'',data.event_key||data.event_signature||'',
      (data.places||safeParse(data.places_json)).join(' '),(data.organizations||safeParse(data.organizations_json)).join(' '),(data.topics||safeParse(data.topics_json)).join(' ')
    ).run();
  }catch(e){console.warn('development FTS update failed',id,e)}
}

export async function searchDevelopmentFts(env:any,text:string,limit=8):Promise<number[]>{
  const q=matchQuery(text);if(!q)return[];
  try{
    const rows:any=await env.DB.prepare(`SELECT development_id,bm25(development_fts) rank FROM development_fts WHERE development_fts MATCH ? ORDER BY rank LIMIT ?`).bind(q,limit).all();
    return (rows.results||[]).map((r:any)=>Number(r.development_id)).filter(Number.isFinite);
  }catch(e){console.warn('development FTS search failed',e);return[]}
}

export async function searchArticleFts(env:any,text:string,limit=12):Promise<number[]>{
  const q=matchQuery(text);if(!q)return[];
  try{
    const rows:any=await env.DB.prepare(`SELECT article_id,bm25(article_fts) rank FROM article_fts WHERE article_fts MATCH ? ORDER BY rank LIMIT ?`).bind(q,limit).all();
    return (rows.results||[]).map((r:any)=>Number(r.article_id)).filter(Number.isFinite);
  }catch(e){console.warn('article FTS search failed',e);return[]}
}
