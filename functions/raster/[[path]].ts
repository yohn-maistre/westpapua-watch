type Env={ARCHIVE?:R2Bucket};
const ALLOWED=new Set(['hillshade.png','forest-loss.png','rainfall-anomaly.png','population.png']);
const contentType=(name:string)=>name.endsWith('.webp')?'image/webp':'image/png';
export const onRequest:PagesFunction<Env>=async({request,env,params})=>{
  if(!env.ARCHIVE)return new Response('Raster archive unavailable',{status:503});
  const raw=params.path,parts=Array.isArray(raw)?raw.map(String):[String(raw||'')],name=parts.filter(Boolean).join('/');
  if(!ALLOWED.has(name))return new Response('Not found',{status:404});
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{allow:'GET, HEAD'}});
  const key=`raster/${name}`,head=request.method==='HEAD'?await env.ARCHIVE.head(key):null;
  if(request.method==='HEAD'){if(!head)return new Response(null,{status:404});return new Response(null,{status:200,headers:{'content-type':contentType(name),'content-length':String(head.size),'cache-control':'public, max-age=86400, stale-while-revalidate=604800',etag:head.httpEtag}})}
  const object=await env.ARCHIVE.get(key);if(!object)return new Response('Not found',{status:404});
  const headers=new Headers({'content-type':contentType(name),'cache-control':'public, max-age=86400, stale-while-revalidate=604800','x-content-type-options':'nosniff',etag:object.httpEtag});object.writeHttpMetadata(headers);headers.set('content-type',contentType(name));return new Response(object.body,{headers});
};
