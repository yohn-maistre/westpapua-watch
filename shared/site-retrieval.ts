import {searchCorpus} from '../src/data/search';
const stop=new Set('the a an of in on and or is was were what who how about tell me does do did please apa siapa bagaimana tentang dan di ke yang ini itu saya sejarah history'.split(' '));
const words=(value:string)=>value.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s-]/gu,' ').split(/\s+/).filter(w=>w.length>1&&!stop.has(w));
export function retrieveSite(query:string,locale:'en'|'pmy'='en',limit=8){
 const terms=[...new Set(words(query))],history=/history|sejarah|historical/i.test(query),resources=/resource|documentary|film|book|buku|report|laporan|research/i.test(query);
 return searchCorpus.map((item:any)=>{const title=words(item.title.en+' '+item.title.pmy),body=words(JSON.stringify(item.text)+' '+item.tags.join(' '));const score=terms.reduce((sum,w)=>sum+(title.includes(w)?5:0)+(body.includes(w)?1:0),0)+(history&&item.type==='history'?5:0)+(resources&&item.type==='resource'?2:0);return {item,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(({item})=>({kind:item.type,title:item.title[locale]||item.title.en,text:(item.text[locale]||item.text.en||'').slice(0,2000),url:item.href.startsWith('/')?(locale==='pmy'?'/pmy':'')+item.href:item.href,publisher:item.publisher||'West Papua Watch · site collection'}));
}
