type Env={ARCHIVE?:R2Bucket};
const ALLOWED=new Set(['provinces.pmtiles','cultural_regions.pmtiles','mining.pmtiles','concessions.pmtiles','protected.pmtiles']);
const common={'content-type':'application/vnd.pmtiles','accept-ranges':'bytes','cache-control':'public, max-age=86400, stale-while-revalidate=604800','x-content-type-options':'nosniff'};
export const onRequest:PagesFunction<Env>=async({request,env,params})=>{
  if(!env.ARCHIVE)return new Response('Geographic archive unavailable',{status:503});
  const name=String(params.name||'');if(!ALLOWED.has(name))return new Response('Not found',{status:404});
  if(request.method==='HEAD'){const head=await env.ARCHIVE.head(`geo/${name}`);if(!head)return new Response(null,{status:404});return new Response(null,{status:200,headers:{...common,'content-length':String(head.size),etag:head.httpEtag}})}
  if(request.method!=='GET')return new Response('Method not allowed',{status:405,headers:{allow:'GET, HEAD'}});
  const object=await env.ARCHIVE.get(`geo/${name}`,{range:request.headers});if(!object)return new Response('Not found',{status:404});
  if(!('body' in object))return new Response(null,{status:412,headers:{etag:object.httpEtag}});
  const headers=new Headers(common);object.writeHttpMetadata(headers);headers.set('content-type','application/vnd.pmtiles');headers.set('accept-ranges','bytes');headers.set('etag',object.httpEtag);
  const range:any=object.range;let status=200;if(range&&Number.isFinite(range.offset)&&Number.isFinite(range.length)){status=206;headers.set('content-range',`bytes ${range.offset}-${range.offset+range.length-1}/${object.size}`);headers.set('content-length',String(range.length))}else headers.set('content-length',String(object.size));
  return new Response(object.body,{status,headers});
};
