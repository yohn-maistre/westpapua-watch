/** Published story images only. No caller-selected host, redirect or credentials. */
type ImageEnv={WATCH_ENGINE?:Fetcher}
const hosts=new Set(['img.antaranews.com','cdn.antaranews.com','video.antaranews.com','jubi.id','suarapapua.com','westpapua.watch']);
async function bounded(response:Response,max:number){
 if(!response.body)throw Error('Empty');const reader=response.body.getReader(),parts:Uint8Array[]=[];let size=0;
 try{while(true){const item=await reader.read();if(item.done)break;size+=item.value.length;if(size>max)throw Error('Size');parts.push(item.value)}}finally{await reader.cancel().catch(()=>{});reader.releaseLock()}
 const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length}return bytes;
}
function approved(value:unknown){try{const u=new URL(String(value));return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&hosts.has(u.hostname)?u.href:null}catch{return null}}
export async function storyImage(request:Request,id:string,engine:Fetcher|undefined,fallback:()=>Promise<Response>,fetcher:typeof fetch=fetch){
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405});
 if(!/^\d{1,12}$/.test(id))return new Response(null,{status:404});
 if(!engine)return new Response(null,{status:503,headers:{'cache-control':'no-store'}});
 let data:any;
 try{const r=await engine.fetch(new Request('https://watch.internal/development/'+id,{headers:{accept:'application/json'},signal:AbortSignal.timeout(8000)}));if(r.status===404)return new Response(null,{status:404});if(!r.ok)throw Error('Unavailable');data=JSON.parse(new TextDecoder().decode(await bounded(r,524288)))}catch{return new Response(null,{status:503,headers:{'cache-control':'no-store'}})}
 if(data?.development?.status!=='published'||String(data.development.id)!==id)return new Response(null,{status:404,headers:{'cache-control':'no-store'}});
 let result:Response|undefined;
 const image=(Array.isArray(data.articles)?data.articles.slice(0,24):[]).map((a:any)=>approved(a.image_url)).find(Boolean);
 if(image)try{
  const r=await fetcher(image,{redirect:'manual',headers:{accept:'image/jpeg,image/png,image/webp'},signal:AbortSignal.timeout(6000)}),type=r.headers.get('content-type')?.split(';')[0].trim();
  if(!r.ok||!['image/jpeg','image/png','image/webp'].includes(type||''))throw Error('Image');
  const bytes=await bounded(r,2097152),valid=type==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:type==='image/png'?bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10':new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
  if(!valid)throw Error('Signature');result=new Response(bytes,{headers:{'content-type':type!}});
 }catch{ /* An available brand card replaces a blocked/missing publisher photo. */ }
 if(!result)result=await fallback();
 const headers=new Headers(result.headers);headers.set('cache-control','public, max-age=60');headers.set('x-content-type-options','nosniff');headers.set('referrer-policy','no-referrer');headers.set('content-security-policy',"default-src 'none'");
 return new Response(request.method==='HEAD'?null:result.body,{status:result.status,headers});
}
export const onRequest:PagesFunction<ImageEnv>=context=>storyImage(context.request,String(context.params.id||''),context.env.WATCH_ENGINE,()=>context.next(new Request(new URL('/images/share/default.png',context.request.url))));
