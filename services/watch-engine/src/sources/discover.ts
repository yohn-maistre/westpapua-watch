import { parseFeed } from '@rowanmanning/feed-parser';
import { SOURCES } from './registry';
import type { DiscoveredItem,SourceConfig } from '../types';

const strip=(value:string)=>value.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const absolute=(href:string,base:string)=>{try{const u=new URL(href,base);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:''}catch{return''}};
const publisherHost=(source:SourceConfig,url:string)=>{try{const strip=(h:string)=>h.toLowerCase().replace(/^www\./,'');const base=strip(new URL(source.homepage).hostname);const host=strip(new URL(url).hostname);return host===base||host.endsWith(`.${base}`)}catch{return false}};

function parseSyndication(xml:string,source:SourceConfig):DiscoveredItem[]{
  try{
    const feed=parseFeed(xml);
    return feed.items.slice(0,24).map(item=>({
      sourceId:source.id,
      url:absolute(item.url||'',source.homepage),
      title:strip(item.title||''),
      publishedAt:(item.published||item.updated)?.toISOString()
    })).filter(item=>item.url&&item.title&&publisherHost(source,item.url));
  }catch{return[]}
}

function parseHomepage(html:string,source:SourceConfig):DiscoveredItem[]{
  const seen=new Set<string>();const result:DiscoveredItem[]=[];
  for(const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
    const url=absolute(m[1],source.homepage);const title=strip(m[2]);
    if(!url||!title||title.length<18||seen.has(url))continue;
    try{if(new URL(url).hostname!==new URL(source.homepage).hostname)continue}catch{continue}
    if(/\/(tag|category|author|page)\//i.test(url))continue;
    seen.add(url);result.push({sourceId:source.id,url,title});if(result.length>=24)break;
  }
  return result;
}

export async function discoverSource(source:SourceConfig):Promise<DiscoveredItem[]>{
  const headers={'user-agent':'WestPapuaWatch/0.3 (+https://westpapua.watch)','accept':'application/rss+xml, application/atom+xml, text/xml, text/html;q=0.8'};
  if(source.feed){
    try{const res=await fetch(source.feed,{headers,signal:AbortSignal.timeout(12000)});if(res.ok){const items=parseSyndication(await res.text(),source);if(items.length)return items}}catch{}
  }
  try{const res=await fetch(source.homepage,{headers,signal:AbortSignal.timeout(12000)});if(!res.ok)return[];return parseHomepage(await res.text(),source)}catch{return[]}
}

export async function discoverEnabled():Promise<DiscoveredItem[]>{
  const batches=await Promise.all(SOURCES.filter(source=>source.enabled).map(source=>discoverSource(source)));
  const seen=new Set<string>();return batches.flat().filter(item=>!seen.has(item.url)&&seen.add(item.url));
}
