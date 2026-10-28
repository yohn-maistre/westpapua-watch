import {parseHTML} from 'linkedom';
export function validPublicationDate(value:unknown,now=Date.now()):string|undefined{
 if(typeof value!=='string'||!/^\d{4}-\d\d-\d\d(?:T|\s|$)/.test(value.trim()))return;
 const time=Date.parse(value);if(!Number.isFinite(time)||time<Date.UTC(1990,0,1)||time>now+864e5)return;return new Date(time).toISOString();
}
export function publicationDate(html:string,now=Date.now(),url=''):string|undefined{
 const {document}=parseHTML(html);
 for(const key of ['article:published_time','datePublished','pubdate','publishdate','DC.date.issued','date']){
  const node=document.querySelector(`meta[property="${key}"],meta[name="${key}"],meta[itemprop="${key}"]`);const value=validPublicationDate(node?.getAttribute('content'),now);if(value)return value;
 }
 const find=(value:any):string|undefined=>{if(!value||typeof value!=='object')return;if(Array.isArray(value)){for(const v of value){const date=find(v);if(date)return date}return}
 const types=Array.isArray(value['@type'])?value['@type']:[value['@type']];if(types.some((t:any)=>/^(?:NewsArticle|Article|ReportageNewsArticle|AnalysisNewsArticle|BlogPosting)$/.test(String(t)))){const date=validPublicationDate(value.datePublished,now);if(date)return date}
 return find(value['@graph']);};
 for(const node of document.querySelectorAll('script[type="application/ld+json"]'))try{const date=find(JSON.parse(node.textContent||''));if(date)return date}catch{}
 // Only explicit publication markers; a footer time or dateModified is not publication.
 for(const node of document.querySelectorAll('time[itemprop="datePublished"],time[pubdate],time.published,meta[itemprop="datePublished"]')){const date=validPublicationDate(node.getAttribute('datetime')||node.getAttribute('content')||node.textContent,now);if(date)return date}
 // RNZ's current article template exposes publication only as a time element.
 if(/^https:\/\/(?:www\.)?rnz\.co\.nz\/news\//.test(url)){const node=document.querySelector('time');return validPublicationDate(node?.getAttribute('datetime')||node?.getAttribute('dateTime'),now)}
 return undefined;
}
