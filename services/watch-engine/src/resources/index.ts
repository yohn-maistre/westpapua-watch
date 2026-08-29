import type { SourceConfig } from '../types';
export async function maybeResourceCandidate(env:any,article:any,source:SourceConfig){
  const durable=source.resourceCandidate||/\.pdf(?:$|\?)/i.test(article.canonicalUrl)||/report|laporan|research|study|kajian|dataset|archive|arsip/i.test(`${article.title} ${article.description}`);
  if(!durable)return;
  await env.DB.prepare(`INSERT OR IGNORE INTO resource_candidates(article_id,title,source_url,publisher_id,kind,status,created_at) VALUES(?,?,?,?,?,?,?)`).bind(article.id,article.title,article.canonicalUrl,source.id,/\.pdf/i.test(article.canonicalUrl)?'report':'reference','candidate',new Date().toISOString()).run();
}
