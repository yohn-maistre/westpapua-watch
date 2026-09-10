/** Shared contract for curated references and live Library records. */
export const ITEM_TYPES=['reporting','analysis','statement','report','research','document','dataset','map','book','film','audio','archive','collection'] as const;
export type ItemType=typeof ITEM_TYPES[number];
export const EVIDENCE_ROLES=['reporting','primary_source','investigation','monitoring','research','testimony','analysis','reference'] as const;
export type EvidenceRole=typeof EVIDENCE_ROLES[number];
export type LibraryVisual={url:string;kind:string;source:string;credit:string};
export type LibraryItem={provenance?:Record<string,unknown>;authors:string[];doi?:string;isbn?:string;subtype?:string;accessType?:string;alternateUrls:string[];abstract:string;lastVerifiedAt?:string;visual?:LibraryVisual;following:string[];id:string;url:string;title:string;publisher:string;publisherId?:string;publisherRole?:string;itemType:ItemType;evidenceRoles:EvidenceRole[];format:string;publishedAt?:string;year:string;description:string;languages:string[];tags:string[];topics:string[];places:string[];stories:string[];curated:boolean};
export const LIBRARY_GROUPS=[['report','Reports','Laporan'],['research','Research','Penelitian'],['document','Documents & statements','Dokumen & pernyataan'],['data','Data & maps','Data & peta'],['book','Books','Buku'],['media','Film & audio','Film & audio'],['archive','Archives & collections','Arsip & koleksi'],['analysis','Articles & analysis','Artikel & analisis']] as const;
export const libraryGroup=(type:ItemType)=>({statement:'document',dataset:'data',map:'data',film:'media',audio:'media',collection:'archive',reporting:'analysis'} as Record<string,string>)[type]||type;
const legacy:Record<string,ItemType>={journalism:'reporting',article:'reporting',official:'document',culture:'collection',event:'collection',documentary:'film',commentary:'analysis',reference:'collection',paper:'research',thesis:'research',dissertation:'research',law:'document',policy:'document',dictionary:'book',grammar:'book',lexicon:'book',video:'film',podcast:'audio',photograph:'archive'};
export const itemType=(value:unknown):ItemType=>ITEM_TYPES.includes(value as ItemType)?value as ItemType:legacy[String(value)]||'collection';
export const strings=(value:unknown):string[]=>{if(Array.isArray(value))return [...new Set(value.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim()))];if(typeof value==='string'){try{return strings(JSON.parse(value))}catch{return[]}}return[]};
export function canonicalItemUrl(value:string){try{const u=new URL(value);u.hash='';for(const key of [...u.searchParams.keys()])if(/^utm_|^(fbclid|gclid)$/i.test(key))u.searchParams.delete(key);return u.href.replace(/\/$/,'')}catch{return value}}
export function normalizeLibraryItem(raw:any):LibraryItem{
 let extra:any={};try{extra=typeof raw.metadata_json==='string'?JSON.parse(raw.metadata_json):raw.metadata||{}}catch{}
 raw={...extra,...raw};
 const visualRaw=raw.visual||{};
 const visualUrl=safeVisualUrl(visualRaw.url||raw.cover_url||raw.image_url);
 const visual=visualUrl?{url:visualUrl,kind:String(visualRaw.kind||'cover'),source:String(visualRaw.source||raw.url||raw.source_url||''),credit:String(visualRaw.credit||raw.publisher||raw.publisher_name||'')}:undefined;
 const url=String(raw.url||raw.source_url||''),kind=itemType(raw.itemType||raw.item_type||raw.type||raw.kind);
 const date=String(raw.publishedAt||raw.published_at||raw.publishedYear||raw.year||raw.date||'');
 const publishedAt=/^\d{4}(?:-\d{2}(?:-\d{2}(?:T.*)?)?)?$/.test(date)?date:undefined;
 const roles=strings(raw.evidenceRoles||raw.evidence_roles||raw.evidence_roles_json).filter(r=>EVIDENCE_ROLES.includes(r as EvidenceRole)) as EvidenceRole[];
 return {authors:strings(raw.authors||raw.authors_json),doi:raw.doi||undefined,isbn:raw.isbn||undefined,subtype:raw.subtype||(['thesis','dissertation','dictionary','grammar','lexicon','law','policy','photograph'].includes(raw.type)?raw.type:undefined),accessType:raw.accessType||raw.access_type||undefined,alternateUrls:strings(raw.alternateUrls||raw.alternate_urls),abstract:String(raw.abstract||''),lastVerifiedAt:raw.lastVerifiedAt||raw.last_verified_at||undefined,visual,following:strings(raw.following||raw.issueRefs),provenance:raw.provenance,id:String(raw.recordId||(String(raw.id||'').startsWith('research:')?raw.id:canonicalItemUrl(url))),url,title:String(raw.title||''),publisher:String(raw.publisher||raw.publisher_name||raw.publisher_id||''),publisherId:raw.publisherId||raw.publisher_id,publisherRole:raw.publisherRole||raw.publisher_role,itemType:kind,evidenceRoles:roles,
 format:String(raw.format||(/\.pdf(?:$|[?#])/i.test(url)?'pdf':['film'].includes(kind)?'video':kind==='audio'?'audio':'web')),publishedAt,year:publishedAt?.slice(0,4)||'—',description:String(raw.description||''),languages:strings(raw.languages||raw.languages_json).length?strings(raw.languages||raw.languages_json):raw.language?[String(raw.language).toLowerCase()]:[],tags:strings(raw.tags||raw.tags_json),topics:[...new Set([...strings(raw.topics||raw.topics_json),...broadTopics(strings(raw.tags||raw.tags_json))])],places:strings(raw.places||raw.places_json),stories:strings(raw.stories||raw.stories_json),curated:raw.curated===true};
}
export function mergeLibraryItems(curated:LibraryItem[],live:LibraryItem[]){const pool=new Map(live.map(i=>[i.id,i]));for(const item of curated){const doi=(i:LibraryItem)=>(i.doi||i.url.match(/10\.\d{4,9}\/[^?#]+/)?.[0]||'').toLowerCase();const other=pool.get(item.id)||[...pool.values()].find(i=>doi(item)&&doi(i)===doi(item)&&i.title.toLowerCase()===item.title.toLowerCase());if(other&&other.id!==item.id)pool.delete(other.id);pool.set(item.id,other?{...other,...item,publisherId:item.publisherId||other.publisherId,publisherRole:item.publisherRole||other.publisherRole,publishedAt:item.publishedAt||other.publishedAt,year:item.publishedAt?item.year:other.year,description:item.description||other.description,visual:item.visual||other.visual,authors:item.authors.length?item.authors:other.authors,doi:item.doi||other.doi,isbn:item.isbn||other.isbn,abstract:item.abstract||other.abstract,alternateUrls:[...new Set([...item.alternateUrls,...other.alternateUrls,...(item.url!==other.url?[other.url]:[])])],following:[...new Set([...other.following,...item.following])],languages:item.languages.length?item.languages:other.languages,topics:[...new Set([...other.topics,...item.topics])],places:[...new Set([...other.places,...item.places])],stories:[...new Set([...other.stories,...item.stories])]}:item)}return [...pool.values()]}
export const broadTopics=(tags:string[],text='')=>{
 const aliases:Record<string,string>={'human-rights-security':'human-rights-conflict-security','politics-governance':'politics-governance-representation','health-wellbeing':'health-food-public-services','water-sanitation-housing':'health-food-public-services','education-knowledge':'education-language-culture','culture-language':'education-language-culture','gender-social-inclusion':'women-gender-social-inclusion'};
 const out=new Set(tags.map(t=>aliases[t]||t));if(/mining|tambang|extract|nikel|nickel|gold|emas|copper|tembaga|freeport|grasberg|logging|pembalakan|plantation|perkebunan|food estate|industrial/i.test(text+' '+tags.join(' ')))out.add('extraction-industrial-development');return [...out];
};
export function retrieveLibrary(items:LibraryItem[],query:string,limit=5){
 const q=query.toLowerCase(),stop=new Set('the a an in on about of for any is there me show find this that here what are reports report research books film documentary library resources ada apa tentang ini itu sini cari laporan penelitian pustaka sumber'.split(' '));
 const terms=q.replace(/[^\p{L}\p{N}\s-]/gu,' ').split(/\s+/).filter(w=>w.length>2&&!stop.has(w));
 const requested=/research|penelitian|riset|academic/.test(q)?'research':/report|laporan/.test(q)?'report':/book|buku/.test(q)?'book':/film|documentary|dokumenter|audio/.test(q)?'media':null;
 return items.map(item=>{const text=`${item.title} ${item.description} ${item.publisher} ${item.authors.join(' ')} ${item.doi||''} ${item.isbn||''} ${item.abstract} ${item.tags.join(' ')} ${item.topics.join(' ')} ${item.places.join(' ')}`.toLowerCase();return {item,score:terms.reduce((n,w)=>n+(text.includes(w)?1:0),0)}}).filter(({item,score})=>(!requested||libraryGroup(item.itemType)===requested)&&(terms.length?score>0:requested!==null)).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.item);
}

export function safeVisualUrl(value:unknown){try{const url=new URL(String(value||''));return url.protocol==='https:'?url.href:undefined}catch{return undefined}}
export function libraryVisualTone(item:Pick<LibraryItem,'topics'|'id'>){
 const topics=item.topics.join(' ');
 if(/environment|land-|climate|extraction/.test(topics))return 'land';
 if(/human-rights|conflict|politics/.test(topics))return 'rights';
 if(/culture|language|education|history/.test(topics))return 'culture';
 let hash=0;for(const ch of item.id)hash=(hash*31+ch.charCodeAt(0))>>>0;
 return ['land','rights','culture','society'][hash%4];
}
