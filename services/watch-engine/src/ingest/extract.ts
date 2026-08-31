import { Readability } from '@mozilla/readability';
import { Defuddle } from 'defuddle/node';
import { parseHTML } from 'linkedom';
import type { ExtractedArticle,ExtractionMethod,SourceConfig } from '../types';

const USER_AGENT='WestPapuaWatch/0.3 (+https://westpapua.watch)';
const decode=(value:string)=>value.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ');
const cleanText=(value:string)=>decode(value.replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
const safeUrl=(value:string|undefined,base:string)=>{try{return value?new URL(value,base).href:undefined}catch{return undefined}};

function metadata(html:string,url:string){
  const {document}=parseHTML(html);const meta=(key:string)=>document.querySelector(`meta[property="${key}"]`)?.getAttribute('content')||document.querySelector(`meta[name="${key}"]`)?.getAttribute('content')||'';
  const canonical=safeUrl(document.querySelector('link[rel="canonical"]')?.getAttribute('href')||undefined,url)||url;
  return {
    canonical,
    title:(meta('og:title')||document.querySelector('title')?.textContent||'').trim(),
    description:(meta('description')||meta('og:description')||'').trim(),
    publishedAt:(meta('article:published_time')||meta('date')||'').trim()||undefined,
    author:(meta('author')||'').trim()||undefined,
    language:document.documentElement.getAttribute('lang')||undefined,
    image:safeUrl(meta('og:image')||meta('twitter:image')||undefined,url),
    imageAlt:(meta('og:image:alt')||'').trim()||undefined
  };
}

async function fromHtml(html:string,url:string,source:SourceConfig,methodPrefix:'fetch'|'browser-run'):Promise<ExtractedArticle|null>{
  if(html.length<500)return null;const meta=metadata(html,url);let body='';let title='';let description='';let author: string|undefined;let language: string|undefined;let method:ExtractionMethod=methodPrefix==='browser-run'?'browser-run':'fetch+fallback';
  try{
    const {document}=parseHTML(html);const result:any=await Defuddle(document as any,url,{markdown:false});
    const text=cleanText(String(result?.content||''));
    if(text.length>=320){body=text;title=String(result?.title||'').trim();description=String(result?.description||'').trim();author=String(result?.author||'').trim()||undefined;language=String(result?.language||'').trim()||undefined;method=methodPrefix==='browser-run'?'browser-run':'fetch+defuddle'}
  }catch{}
  if(body.length<320){
    try{const {document}=parseHTML(html);const article:any=new Readability(document as any,{charThreshold:180}).parse();const text=cleanText(String(article?.content||''));if(text.length>=320){body=text;title=String(article?.title||'').trim();description=String(article?.excerpt||'').trim();author=String(article?.byline||'').trim()||undefined;method=methodPrefix==='browser-run'?'browser-run':'fetch+readability'}}catch{}
  }
  if(body.length<320){const {document}=parseHTML(html);body=cleanText(document.querySelector('article')?.innerHTML||document.querySelector('main')?.innerHTML||document.body?.innerHTML||'');if(body.length<250)return null}
  title=(title||meta.title).slice(0,500);if(!title)return null;
  description=(description||meta.description||body.slice(0,420)).slice(0,1000);
  return {canonicalUrl:meta.canonical,title,description,body:body.slice(0,65000),publishedAt:meta.publishedAt,author:author||meta.author,language:language||meta.language||source.language[0],extractionMethod:method,image:meta.image?{url:meta.image,caption:meta.imageAlt,credit:author||meta.author,sourceUrl:url}:undefined};
}

async function browserRun(url:string,source:SourceConfig,env:any){
  if(!env.BROWSER?.quickAction)return null;
  try{const response=await env.BROWSER.quickAction('content',{url,gotoOptions:{waitUntil:'networkidle2',timeout:22000}});if(!response.ok)return null;const payload:any=await response.json();const html=String(payload?.result||'');return await fromHtml(html,url,source,'browser-run')}catch{return null}
}

async function firecrawl(url:string,source:SourceConfig,env:any):Promise<ExtractedArticle|null>{
  if(!env.FIRECRAWL_API_KEY)return null;
  try{
    const response=await fetch('https://api.firecrawl.dev/v2/scrape',{method:'POST',headers:{authorization:`Bearer ${env.FIRECRAWL_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({url,formats:['markdown','html'],onlyMainContent:true,onlyCleanContent:false,maxAge:0,storeInCache:false,zeroDataRetention:true,timeout:30000}),signal:AbortSignal.timeout(35000)});if(!response.ok)return null;
    const payload:any=await response.json();const data=payload?.data||{};if(data.html){const parsed=await fromHtml(String(data.html),url,source,'browser-run');if(parsed)return {...parsed,extractionMethod:'firecrawl'}}
    const body=String(data.markdown||'').replace(/\s+/g,' ').trim();if(body.length<250)return null;const meta=data.metadata||{};return {canonicalUrl:String(meta.sourceURL||meta.url||url),title:String(meta.title||url).slice(0,500),description:String(meta.description||body.slice(0,420)).slice(0,1000),body:body.slice(0,65000),language:String(meta.language||source.language[0]),extractionMethod:'firecrawl'};
  }catch{return null}
}

export async function extractArticle(url:string,source:SourceConfig,env?:any):Promise<ExtractedArticle|null>{
  try{const response=await fetch(url,{headers:{'user-agent':USER_AGENT,'accept':'text/html,application/xhtml+xml'},redirect:'follow',signal:AbortSignal.timeout(16000)});if(response.ok&&(response.headers.get('content-type')||'').includes('text/html')){const parsed=await fromHtml(await response.text(),response.url||url,source,'fetch');if(parsed)return parsed}}catch{}
  return await browserRun(url,source,env)||await firecrawl(url,source,env);
}
