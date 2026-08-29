export async function embedText(env:any,text:string):Promise<number[]>{
  const result:any=await env.AI.run(env.EMBEDDING_MODEL||'@cf/baai/bge-m3',{text:[text.slice(0,1900)]});
  const candidate=result?.data?.[0]??result?.data??result?.embeddings?.[0]??result?.result?.data?.[0];
  if(!Array.isArray(candidate))throw new Error('Embedding model returned no vector');return candidate.map(Number);
}
