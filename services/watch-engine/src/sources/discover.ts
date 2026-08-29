import { SOURCES } from './registry';
import type { DiscoveredItem,SourceConfig } from '../types';

const entityDecode=(value:string)=>value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const strip=(value:string)=>entityDecode(value.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
const tag=(block:string,name:string)=>{const m=block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'));return m?strip(m[1]):''};
const absolute=(href:string,base:string)=>{try{return new URL(entityDecode(href),base).href}catch{return''}};

function parseFeed(xml:string,source:SourceConfig):DiscoveredItem[]{
  const blocks=[...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(m=>m[2]);
  return blocks.slice(0,18).map(block=>{
    const linkTag=block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1]||tag(block,'link');
    return {sourceId:source.id,url:absolute(linkTag,source.homepage),title:tag(block,'title'),publishedAt:tag(block,'pubDate')||tag(block,'published')||tag(block,'updated')||undefined};
  }).filter(item=>item.url&&item.title);
}

function parseHomepage(html:string,source:SourceConfig):DiscoveredItem[]{
  const seen=new Set<string>();const result:DiscoveredItem[]=[];
  for(const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
    const url=absolute(m[1],source.homepage);const title=strip(m[2]);
    if(!url||!title||title.length<18||seen.has(url))continue;
    try{if(new URL(url).hostname!==new URL(source.homepage).hostname)continue}catch{continue}
    if(/\/(tag|category|author|page)\//i.test(url))continue;
    seen.add(url);result.push({sourceId:source.id,url,title});if(result.length>=18)break;
  }
  return result;
}

export async function discoverSource(source:SourceConfig):Promise<DiscoveredItem[]>{
  const headers={'user-agent':'WestPapuaWatch/0.1 (+https://westpapua.watch)','accept':'application/rss+xml, application/atom+xml, text/xml, text/html;q=0.8'};
  if(source.feed){
    try{const res=await fetch(source.feed,{headers,signal:AbortSignal.timeout(12000)});if(res.ok){const text=await res.text();const items=parseFeed(text,source);if(items.length)return items}}catch{}
  }
  try{const res=await fetch(source.homepage,{headers,signal:AbortSignal.timeout(12000)});if(!res.ok)return[];return parseHomepage(await res.text(),source)}catch{return[]}
}

export async function discoverEnabled():Promise<DiscoveredItem[]>{
  const batches=await Promise.all(SOURCES.filter(source=>source.enabled).map(source=>discoverSource(source)));
  const seen=new Set<string>();return batches.flat().filter(item=>!seen.has(item.url)&&seen.add(item.url));
}
