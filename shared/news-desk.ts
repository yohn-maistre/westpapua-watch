import registry from '../content/news-sources.json';
export const NEWS_DESKS=['focus','rights','land','politics','regional','all'] as const;
export type NewsDesk=typeof NEWS_DESKS[number];
export const newsDesk=(value:unknown):NewsDesk=>NEWS_DESKS.includes(value as NewsDesk)?value as NewsDesk:'focus';
export const NEWS_LABELS:Record<NewsDesk,{en:string;pmy:string}>={focus:{en:'In focus',pmy:'Sorotan'},rights:{en:'Rights & conflict',pmy:'HAM & konflik'},land:{en:'Land & environment',pmy:'Tanah & lingkungan'},politics:{en:'Politics',pmy:'Politik'},regional:{en:'Across Papua',pmy:'Kabar Papua'},all:{en:'All news',pmy:'Semua berita'}};
export function publisherFamily(id:string){return ['antara','antara-papua'].includes(id)?'antara':id}
export function sourceProvenance(id:string,role?:string){const s=registry.find(x=>x.id===id),r=role||s?.role||'';
 if(['state_media','state_public_media'].includes(r))return {kind:'state',en:'Indonesian public / state media',pmy:'Media publik / negara Indonesia'};
 if(r==='public_service_media')return {kind:'public',en:'International public-service media',pmy:'Media layanan publik internasional'};
 if(['civil_society','monitoring_org'].includes(r))return {kind:'civil',en:'Civil society',pmy:'Masyarakat sipil'};
 if(r==='movement_media')return {kind:'movement',en:'Movement media',pmy:'Media gerakan'};
 if(['investigative_newsroom','environmental_newsroom'].includes(r))return {kind:'independent',en:'Independent reporting',pmy:'Peliputan independen'};
 if(['local_newsroom','alternative_media'].includes(r)||id==='papuan-voices')return {kind:'papuan',en:'Papuan reporting',pmy:'Peliputan Papua'};
 return {kind:'other',en:'Source',pmy:'Sumber'};
}
const array=(v:any):any[]=>Array.isArray(v)?v:typeof v==='string'?(()=>{try{return JSON.parse(v)}catch{return[]}})():[];
export function newsSignals(item:any){
 const text=[item.search_text,item.issue_slug,item.title_en,item.title_id,item.title?.en,item.title?.id,item.summary_en,item.summary_id,item.summary?.en,item.summary?.id,item.category,...array(item.topics),...array(item.issues).map(x=>typeof x==='string'?x:x.slug)].filter(Boolean).join(' ').toLowerCase();
 const headline=[item.title_en,item.title_id,item.title?.en,item.title?.id].filter(Boolean).join(' ').toLowerCase();
 const culturalOrSport=/poem|poetry|puisi|book launch|peluncuran buku|film screening|pemutaran film|football|sepak bola|tournament|turnamen|\bsport|olahraga/.test(headline);
 const concreteNewsHook=/\bshoot|penembakan|\bkill|tewas|arrest|ditangkap|detain|ditahan|torture|penyiksaan|censor|sensor|\bban(?:ned)?\b|dilarang|intimid|threat|ancam|attack|serang|displac|pengungsi|evict|penggusuran|criminalis|kriminalis|court|pengadilan|ruling|putusan/.test(headline);
 const thematic=culturalOrSport&&!concreteNewsHook;
 const rights=!thematic&&/human.rights|hak asasi|\bham\b|human-rights-security|conflict|konflik|military|militer|police|polisi|displac|pengungsi|kekerasan|penembakan|shooting|killings?|killed|tewas|torture|penyiksaan|detention|penahanan|civic.space|internet.shutdown|pemadaman internet|freedom.of.expression|kebebasan berekspresi/.test(text);
 const land=!thematic&&/land-indigenous-rights|\bland\b|environment|lingkungan|forest|hutan|customary|ulayat|tanah adat|masyarakat adat|mining|tambang|nikel|nickel|food.estate|mifee|deforest|conserv|konserv|pencemaran|pollution|climate|iklim|banjir|flood|kebakaran|wildfire/.test(text);
 const politics=!thematic&&/politics-governance|politic|politik|otonomi|autonomy|corrupt|korupsi|accountability|akuntabil|pemekaran|election|pemilu|pilkada|representation|perwakilan|diploma|united nations|perserikatan bangsa|\bpbb\b|self.determination|penentuan nasib/.test(text);
 const report=array(item.item_types).some(x=>/^(investigation|investigative_report|research|report|analysis|kajian|penelitian)$/.test(x))||array(item.sources).some(x=>['monitoring_org','investigative_newsroom','environmental_newsroom'].includes(x.role));
 const regional=thematic||/regional|health|kesehatan|education|pendidikan|school|sekolah|hospital|rumah sakit|livelihood|penghidupan|culture|budaya|sport|olahraga|market|pasar|transport|infrastruktur|infrastructure|public.service|pelayanan publik/.test(text);
 return {rights,land,politics,report,regional,focus:rights||land||politics};
}
export function matchesNewsDesk(item:any,desk:NewsDesk){const s=newsSignals(item);return desk==='all'||s[desk]===true}
export function matchesNewsPlace(item:any,place:string){if(!place)return true;return array(item.places).some(x=>x.slug===place)||array(item.place_slugs).includes(place)}
export function orderNews(items:any[],desk:NewsDesk,now=Date.now()){
 const date=(x:any)=>Date.parse(x.latest_report_at||'')||0;
 // A dated weekly shelf stops old high-scoring stories becoming permanent leads.
 const shelf=(x:any)=>Math.floor((Math.floor(now/144e5)*144e5-date(x))/(7*864e5));
 const weight=(x:any)=>{const s=newsSignals(x);return +s.rights*3 + +s.land*2 + +s.politics + +s.report + Math.min(2,Math.log2(Number(x.source_count)||1))};
 return [...items].sort((a,b)=>desk==='focus'?(shelf(a)-shelf(b)||weight(b)-weight(a)||date(b)-date(a)||Number(b.id)-Number(a.id)):(date(b)-date(a)||Number(b.id)-Number(a.id)));
}
export function newsSources(item:any){const sources=array(item.sources);return sources.length?sources:item.latest_source?[item.latest_source]:[]}
export function provenanceSummary(item:any,locale:'en'|'pmy'){
 const sources=newsSources(item),groups=[...new Map(sources.map(s=>{const p=sourceProvenance(s.publisher_id||s.id,s.role);return[p.kind,p]})).values()];
 return {kind:groups.length===1?groups[0].kind:'mixed',label:groups.length===1?groups[0][locale]:groups.length?(locale==='en'?'Mixed sources':'Beragam sumber'):'',names:sources.map(s=>s.publisher||s.name).filter(Boolean).join(' · ')};
}
export function newsCount(value:number,kind:'report'|'source',locale:'en'|'pmy'){const n=Number.isFinite(Number(value))?Number(value):0;return `${n} ${locale==='pmy'?(kind==='report'?'laporan':'sumber'):kind+(n===1?'':'s')}`}
export function newsCategory(value:unknown,locale:'en'|'pmy'){
 const key=String(value||'current').toLowerCase().replaceAll('_',' ');
 const labels:Record<string,{en:string;pmy:string}>={'human rights':{en:'Human rights',pmy:'HAM'},environment:{en:'Environment',pmy:'Lingkungan'},land:{en:'Land',pmy:'Tanah'},politics:{en:'Politics',pmy:'Politik'},culture:{en:'Culture',pmy:'Budaya'},regional:{en:'Across Papua',pmy:'Kabar Papua'},current:{en:'News',pmy:'Berita'},other:{en:'News',pmy:'Berita'}};
 return labels[key]?.[locale]||(locale==='pmy'?'Berita':String(value||'News'));
}
