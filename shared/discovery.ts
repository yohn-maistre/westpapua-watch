import {pairProblems} from './analysis';
export type DiscoveryKind='news'|'case'|'review'|'library'|'archive'|'art'|'event';
export type DiscoveryItem={id:string;kind:DiscoveryKind;title:{en:string;pmy:string};href:string;detail?:string;date?:string;expires?:string};
export type DiscoveryEdition={seed:number;createdAt:number;ids:string[]};
export const DISCOVERY_INTERVAL=4*3600000;
export function isEditorialNews(text:string){return !/\bIFRC\b|congratulat|selamat ulang|anniversary|hosting.{0,35}(?:competition|championship)|tuan rumah.{0,35}(?:kompetisi|turnamen)/i.test(text)}
export function discoveryNews(items:any[],now=Date.now()):DiscoveryItem|null{
 const item=items.find(x=>x.publication_kind==='reviewed'&&typeof x.title?.en==='string'&&typeof (x.title?.pmy||x.title?.id)==='string'&&!pairProblems({en:x.title.en,pmy:x.title.pmy||x.title.id}).length&&/^\/story\/\?id=\d+$/.test(x.story_url||'')&&Number.isFinite(Date.parse(x.latest_report_at))&&Date.parse(x.latest_report_at)<=now&&now-Date.parse(x.latest_report_at)<14*86400000&&isEditorialNews(x.title.en+' '+(x.title.id||x.title.pmy)));
 return item?{id:'news:'+item.id,kind:'news',title:{en:item.title.en,pmy:item.title.pmy||item.title.id},href:item.story_url,date:item.latest_report_at}:null;
}
function shuffle<T>(items:T[],seed:number){let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};return items.map(item=>({item,order:random()})).sort((a,b)=>a.order-b.order).map(x=>x.item)}
export function eligibleDiscoveryItems(pool:DiscoveryItem[],now:number,currentPath:string){
 const page=new URL(currentPath.replace(/^\/id(?=\/)/,''),'https://westpapua.watch');
 return pool.filter(x=>x.kind!=='news'&&(!x.expires||Date.parse(x.expires)>now)&&/^\//.test(x.href)&&!/^\/\//.test(x.href)).filter(x=>{const u=new URL(x.href,page.origin);if(u.pathname!==page.pathname)return true;if(x.kind==='case')return false;if(x.kind==='library'&&u.searchParams.get('q')&&u.searchParams.get('q')===page.searchParams.get('q'))return false;return !!u.search||!!u.hash});
}
/** A small stable discovery edition; a page visit never consumes an AI call. */
export function selectDiscovery(pool:DiscoveryItem[],seed:number,now:number,currentPath:string,previousIds:string[]=[]){
 const eligible=eligibleDiscoveryItems(pool,now,currentPath);
 const ordered=shuffle(eligible,seed),fresh=ordered.filter(x=>!previousIds.includes(x.id));
 const chosen:DiscoveryItem[]=[];const choose=(kind:DiscoveryKind)=>{const found=fresh.find(x=>x.kind===kind&&!chosen.includes(x))||ordered.find(x=>x.kind===kind&&!chosen.includes(x));if(found)chosen.push(found)};
 choose('case');choose('review');
 for(const kind of shuffle<DiscoveryKind>(['library','archive','art','event'],seed^0x9e3779b9)){choose(kind);if(chosen.length===5)break}
 return chosen;
}
export function editionIsFresh(value:unknown,now:number):value is DiscoveryEdition{
 const x=value as DiscoveryEdition;return !!x&&Number.isInteger(x.seed)&&Number.isFinite(x.createdAt)&&now>=x.createdAt&&now-x.createdAt<DISCOVERY_INTERVAL&&Array.isArray(x.ids)&&x.ids.every(id=>typeof id==='string');
}
