export const vectorEnrichmentEnabled=(env:any)=>String(env.ENABLE_VECTORIZE_ENRICHMENT||'false').toLowerCase()==='true';

export async function embedText(env:any,text:string):Promise<number[]>{
  const result:any=await env.AI.run(env.EMBEDDING_MODEL||'@cf/baai/bge-m3',{text:[text.slice(0,1900)]});
  const candidate=result?.data?.[0]??result?.data??result?.embeddings?.[0]??result?.result?.data?.[0];
  if(!Array.isArray(candidate))throw new Error('Embedding model returned no vector');
  return candidate.map(Number);
}

export async function tryEmbedText(env:any,text:string):Promise<number[]|null>{
  if(!vectorEnrichmentEnabled(env))return null;
  try{return await embedText(env,text)}catch(e){console.warn('optional vector enrichment unavailable',String((e as any)?.message||e).slice(0,240));return null}
}
