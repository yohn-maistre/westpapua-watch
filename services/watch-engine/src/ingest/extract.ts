import type { ExtractedArticle,SourceConfig } from '../types';

const decode=(value:string)=>value.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ');
const cleanText=(html:string)=>decode(html.replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
const attr=(html:string,key:string)=>{
  const k=key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const a=html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]+content=["']([^"']+)["'][^>]*>`,'i'));
  const b=html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${k}["'][^>]*>`,'i'));
  return decode((a?.[1]||b?.[1]||'').trim());
};
const canonicalFrom=(html:string,url:string)=>{const href=html.match(/<link[^>]+rel=["'][^"']*canonical[^"']*["'][^>]+href=["']([^"']+)["']/i)?.[1];try{return new URL(href||url,url).href}catch{return url}};
const titleFrom=(html:string)=>attr(html,'og:title')||decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g,' ').trim()||'');

export async function extractArticle(url:string,source:SourceConfig):Promise<ExtractedArticle|null>{
  let response:Response;try{response=await fetch(url,{headers:{'user-agent':'WestPapuaWatch/0.1 (+https://westpapua.watch)','accept':'text/html,application/xhtml+xml'},redirect:'follow',signal:AbortSignal.timeout(16000)})}catch{return null}
  if(!response.ok||!(response.headers.get('content-type')||'').includes('text/html'))return null;
  const html=await response.text();if(html.length<500)return null;
  const articleHtml=html.match(/<article\b[\s\S]*?<\/article>/i)?.[0]||html.match(/<main\b[\s\S]*?<\/main>/i)?.[0]||html;
  const body=cleanText(articleHtml).slice(0,65000);const title=titleFrom(html).slice(0,500);if(!title||body.length<250)return null;
  const imageUrl=attr(html,'og:image')||attr(html,'twitter:image');
  return {
    canonicalUrl:canonicalFrom(html,response.url||url),title,body,
    description:(attr(html,'description')||attr(html,'og:description')||body.slice(0,420)).slice(0,1000),
    publishedAt:attr(html,'article:published_time')||attr(html,'date')||undefined,
    author:attr(html,'author')||undefined,language:(html.match(/<html[^>]+lang=["']([^"']+)/i)?.[1]||source.language[0]),
    image:imageUrl?{url:new URL(imageUrl,response.url||url).href,credit:attr(html,'twitter:creator')||attr(html,'author')||undefined,caption:attr(html,'og:image:alt')||undefined,sourceUrl:response.url||url}:undefined
  };
}
