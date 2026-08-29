import { NewsCycleWorkflow } from './workflow';import { processArticle } from './ingest/process';import { answerQuestion } from './ask';
export { NewsCycleWorkflow };
const json=(data:any,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});

async function current(env:any){
  const rows:any=await env.DB.prepare(`SELECT d.id,d.issue_slug,d.title_en,d.title_pmy,d.summary_en,d.summary_pmy,d.updated_at,COUNT(DISTINCT a.publisher_id) source_count FROM developments d JOIN development_articles da ON da.development_id=d.id JOIN articles a ON a.id=da.article_id WHERE d.status='published' GROUP BY d.id ORDER BY d.updated_at DESC LIMIT 12`).all();
  const items=[];for(const d of rows.results||[]){const image:any=await env.DB.prepare(`SELECT ic.url,ic.source_url,ic.credit,ic.caption,ic.rights_status FROM image_candidates ic JOIN development_articles da ON da.article_id=ic.article_id WHERE da.development_id=? AND (ic.rights_status='approved' OR ?='true') ORDER BY CASE ic.rights_status WHEN 'approved' THEN 0 ELSE 1 END,ic.id DESC LIMIT 1`).bind(d.id,env.ALLOW_EXTERNAL_IMAGES||'false').first();const article:any=await env.DB.prepare(`SELECT a.title,p.role,a.publisher_id FROM development_articles da JOIN articles a ON a.id=da.article_id JOIN publishers p ON p.id=a.publisher_id WHERE da.development_id=? ORDER BY a.published_at DESC LIMIT 1`).bind(d.id).first();items.push({id:d.id,issue_slug:d.issue_slug,title:{en:d.title_en,pmy:d.title_pmy||d.title_en},summary:{en:d.summary_en,pmy:d.summary_pmy||d.summary_en},category:d.issue_slug?.includes('raja')||d.issue_slug?.includes('sentani')?'Environment':d.issue_slug?.includes('food')?'Land':'Current',place:d.issue_slug?.includes('raja')?'Raja Ampat':d.issue_slug?.includes('sentani')?'Lake Sentani':d.issue_slug?.includes('south-papua')?'South Papua':'West Papua',updated_at:d.updated_at,source_count:d.source_count,latest_source:article?{publisher_id:article.publisher_id,role:article.role}:null,image:image?{url:image.url,source_url:image.source_url,credit:image.credit,caption:image.caption,rights_status:image.rights_status}:null})}return items;
}

export default {
  async fetch(request:any,env:any){const url=new URL(request.url);
    if(url.pathname==='/health')return json({ok:true,service:'westpapua-watch-engine'});
    if(url.pathname==='/current'&&request.method==='GET')return json({items:await current(env)});
    if(url.pathname==='/ask'&&request.method==='POST'){let body:any;try{body=await request.json()}catch{return json({error:'Invalid JSON'},400)}const query=String(body?.query||'').trim();if(query.length<2||query.length>500)return json({error:'Question must be between 2 and 500 characters.'},400);try{return json(await answerQuestion(env,query,body?.locale==='pmy'?'pmy':'en'))}catch{return json({error:'The Watch answer service is temporarily unavailable.'},502)}}
    if(url.pathname==='/review/candidates'&&request.method==='GET'){const rows:any=await env.DB.prepare(`SELECT d.*,COUNT(da.article_id) article_count FROM developments d LEFT JOIN development_articles da ON da.development_id=d.id WHERE d.status='candidate' GROUP BY d.id ORDER BY d.updated_at DESC LIMIT 50`).all();return json({items:rows.results||[]})}
    if(url.pathname==='/run'&&request.method==='POST'){const instance=await env.NEWS_CYCLE.create({params:{reason:'manual'}});return json({id:instance.id},202)}
    return json({error:'Not found'},404)
  },
  async queue(batch:any,env:any){for(const message of batch.messages){try{await processArticle(env,message.body);message.ack()}catch(error){console.error('ingest failed',message.body?.url,error);message.retry()}}}
};
