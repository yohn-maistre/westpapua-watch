import { parseFeed } from '@rowanmanning/feed-parser';
import { SOURCES } from './registry';
import type { DiscoveredItem,SourceConfig } from '../types';

const strip=(value:string)=>value.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const absolute=(href:string,base:string)=>{try{const u=new URL(href,base);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:''}catch{return''}};
const publisherHost=(source:SourceConfig,url:string)=>{try{const clean=(h:string)=>h.toLowerCase().replace(/^www\./,'');const base=clean(new URL(source.homepage).hostname);const host=clean(new URL(url).hostname);return host===base||host.endsWith(`.${base}`)}catch{return false}};
const headers={'user-agent':'WestPapuaWatch/0.4 (+https://westpapua.watch)','accept':'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.8'};
const interleave=(batches:DiscoveredItem[][])=>{const out:DiscoveredItem[]=[];const max=Math.max(0,...batches.map(x=>x.length));for(let i=0;i<max;i++)for(const batch of batches)if(batch[i])out.push(batch[i]!);return out};

function parseSyndication(xml:string,source:SourceConfig,limit=24):DiscoveredItem[]{
  try{
    const feed=parseFeed(xml);
    return feed.items.slice(0,limit).map(item=>({sourceId:source.id,url:absolute(item.url||'',source.homepage),title:strip(item.title||''),publishedAt:(item.published||item.updated)?.toISOString()})).filter(item=>item.url&&item.title&&publisherHost(source,item.url));
  }catch{return[]}
}

function parseHomepage(html:string,source:SourceConfig):DiscoveredItem[]{
  const seen=new Set<string>();const result:DiscoveredItem[]=[];
  for(const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
    const url=absolute(m[1],source.homepage),title=strip(m[2]);if(!url||!title||title.length<18||seen.has(url))continue;
    if(!publisherHost(source,url)||/\/(tag|category|author|page)\//i.test(url))continue;
    seen.add(url);result.push({sourceId:source.id,url,title});if(result.length>=24)break;
  }
  return result;
}

function sitemapLocs(xml:string){return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(m=>strip(m[1]||''));}
function sitemapUrls(xml:string,source:SourceConfig,cutoff:number){
  const blocks=[...xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)];const out:DiscoveredItem[]=[];
  for(const block of blocks){const body=block[1]||'',loc=strip(body.match(/<loc>\s*([^<]+?)\s*<\/loc>/i)?.[1]||''),lastmod=strip(body.match(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/i)?.[1]||'');if(!loc||!publisherHost(source,loc))continue;const t=lastmod?Date.parse(lastmod):NaN;if(Number.isFinite(t)&&t<cutoff)continue;const slug=decodeURIComponent(new URL(loc).pathname.split('/').filter(Boolean).pop()||'').replace(/[-_]+/g,' ');out.push({sourceId:source.id,url:loc,title:strip(slug)||loc,publishedAt:Number.isFinite(t)?new Date(t).toISOString():undefined})}
  return out;
}

async function fetchText(url:string,timeout=12000){try{const res=await fetch(url,{headers,signal:AbortSignal.timeout(timeout)});return res.ok?await res.text():''}catch{return''}}

export async function discoverSource(source:SourceConfig):Promise<DiscoveredItem[]>{
  if(source.feed){const xml=await fetchText(source.feed);if(xml){const items=parseSyndication(xml,source,24);if(items.length)return items}}
  const html=await fetchText(source.homepage);return html?parseHomepage(html,source):[];
}

export async function discoverSourceBackfill(source:SourceConfig,days=14):Promise<DiscoveredItem[]>{
  const cutoff=Date.now()-Math.max(1,Math.min(31,days))*864e5;const out:DiscoveredItem[]=[];
  if(source.feed){const xml=await fetchText(source.feed,16000);if(xml)out.push(...parseSyndication(xml,source,180).filter(x=>!x.publishedAt||Date.parse(x.publishedAt)>=cutoff))}

  // Generic sitemap pass. Handles both normal urlsets and WordPress-style sitemap
  // indexes without source-specific crawling code. Child sitemap fan-out is bounded.
  for(const path of ['/sitemap.xml','/sitemap_index.xml','/wp-sitemap.xml']){
    const root=new URL(path,source.homepage).href,rootXml=await fetchText(root,16000);if(!rootXml)continue;
    if(/<sitemapindex/i.test(rootXml)){
      const children=sitemapLocs(rootXml).filter(x=>publisherHost(source,x)).slice(0,8);
      for(const child of children){const xml=await fetchText(child,16000);if(xml)out.push(...sitemapUrls(xml,source,cutoff));if(out.length>=120)break}
    }else out.push(...sitemapUrls(rootXml,source,cutoff));
    if(out.length>=40)break;
  }

  const seen=new Set<string>();return out.filter(item=>item.url&&!seen.has(item.url)&&seen.add(item.url)).slice(0,120);
}

export async function discoverEnabled():Promise<DiscoveredItem[]>{
  const batches=await Promise.all(SOURCES.filter(source=>source.enabled).map(source=>discoverSource(source)));
  const seen=new Set<string>();return interleave(batches).filter(item=>!seen.has(item.url)&&seen.add(item.url));
}

export async function discoverBackfill(days=14):Promise<DiscoveredItem[]>{
  const batches=await Promise.all(SOURCES.filter(source=>source.enabled).map(source=>discoverSourceBackfill(source,days)));
  const seen=new Set<string>();return interleave(batches).filter(item=>!seen.has(item.url)&&seen.add(item.url));
}
