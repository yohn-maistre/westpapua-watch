import candidates from '../content/research/library-candidates.json';
import overrides from '../content/research/verified-overrides.json';
import {normalizeLibraryItem,canonicalItemUrl,type ItemType} from './library';
import {matchesFollowing} from './following';
const lanes:Record<string,string[]>={
 'history-decolonisation':['history-decolonisation','politics-governance-representation'],
 'governance-development':['politics-governance-representation','economy-livelihoods'],
 'politics-law-governance':['politics-governance-representation'],
 'society-anthropology':['society-culture-religion'], 'society-culture-religion':['society-culture-religion'],
 'land-ecology':['land-indigenous-rights','environment-biodiversity'],
 'land-extraction-environment':['land-indigenous-rights','environment-biodiversity','extraction-industrial-development'],
 'rights-conflict':['human-rights-conflict-security'],'peace-dialogue':['human-rights-conflict-security'],
 'language-oral-knowledge':['education-language-culture'],'language-education-knowledge':['education-language-culture'],
 'archaeology':['history-decolonisation','society-culture-religion'], 'archives-material-culture':['history-decolonisation','society-culture-religion'],
 'culture-literature':['society-culture-religion'], 'health-everyday-life':['health-food-public-services'],
 'economy-livelihoods-development':['economy-livelihoods'], 'population-migration':['economy-livelihoods','society-culture-religion']
};
const roleMap:Record<string,string>={'scholarly-analysis':'research','primary-source':'primary_source','institutional-report':'monitoring','statistical-source':'reference','contextual-analysis':'analysis','cultural-work':'reference','peace-dialogue':'analysis','movement-analysis':'analysis'};
export function researchType(type:string):ItemType{
 if(/paper|thesis|dissertation|study|survey|review|assessment|synthesis/.test(type))return 'research';
 if(/book|grammar|lexicon|dictionary|novel|volume|monograph|memoir|anthology|folklore|short-stories|encyclopedia/.test(type))return 'book';
 if(/documentary|film/.test(type))return type==='film-hub'?'collection':'film';
 if(/audio|sound/.test(type))return 'audio';
 if(/report/.test(type))return 'report';
 if(/statistics|dataset|database|government-data|corpus/.test(type))return 'dataset';
 if(/archive|photo|museum-object/.test(type))return 'archive';
 if(type==='map'||type==='satellite-resource')return 'map';
 if(/primary-source|policy-document|submission|UN-resource/.test(type))return 'document';
 if(type==='statement')return 'statement';
 if(/analysis|essay|article|journalism/.test(type))return 'analysis';
 return 'collection';
}
export const researchKey=(r:{title:string;creator:string;year:string})=>'research:'+`${r.title}|${r.creator}|${r.year}`.normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}|]+/gu,'-').replace(/-+/g,'-');
const following=['south-papua-food-energy-estate','nduga-displacement','mining-raja-ampat','freeport-mimika','awyu-customary-forests','puncak-displacement','intan-jaya-displacement'];
const places=['Merauke','Mimika','Freeport','Nduga','Intan Jaya','Puncak','Raja Ampat','Jayapura','Sentani','Sorong','Fakfak','Biak','Baliem','Wamena','Keerom','Mamberamo','Manokwari','Kaimana','Maybrat','Asmat','Boven Digoel','Deiyai','Paniai','Dogiyai','Nabire'];
export const researchRecords=candidates.map(raw=>{
 const fix=(overrides as Record<string,any>)[raw.title]||{},r={...raw,...fix};
 let url:URL|undefined;try{url=new URL(r.url)}catch{}
 const type=researchType(r.itemType),text=`${r.title} ${r.note}`,topics=lanes[r.lane]||[];
 const hub=url&&url.pathname.replace(/\//g,'')===''&&!['collection','archive','dataset'].includes(type);
 const unresolved=!url||!['http:','https:'].includes(url.protocol)||r.metadataStatus==='bibliographic-lead'||hub;
 return {raw,reason:!url?'missing-url':r.metadataStatus==='bibliographic-lead'?'bibliographic-lead':hub?'item-link-needed':null,published:!unresolved,item:normalizeLibraryItem({
  recordId:researchKey(raw),title:r.title,url:r.url,authors:r.creator?[r.creator]:[],publisher:fix.publisher||url?.hostname.replace(/^www\./,'')||'',
  itemType:type,subtype:r.itemType,publishedAt:/^\d{4}$/.test(String(r.year))?String(r.year):undefined,
  description:r.note,accessType:r.access,evidenceRoles:[roleMap[r.evidenceRole||'']||r.evidenceRole||'reference'],
  topics,following:following.filter(slug=>matchesFollowing(slug,text)),places:places.filter(p=>new RegExp(`\\b${p}\\b`,'i').test(text)),
  tags:[r.lane,...(/women|female|gender|perempuan|mama\b/i.test(text)?['women-gender']:[]),...(/religio|church|theolog|christian|mission|koreri/i.test(text)?['religion']:[])],
  isbn:fix.isbn,doi:url?.hostname==='doi.org'?decodeURIComponent(url.pathname.slice(1)):undefined,visual:fix.visual,
  provenance:{kind:'supplied-bibliography',sourcePass:r.sourcePass,reportedMetadataStatus:r.metadataStatus,verifiedHere:fix.verifiedHere===true},
  languages:fix.languages||[],curated:true
 })};
});
// Same DOI with conflicting titles is not automatically accepted as two works.
const doiTitles=new Map<string,Set<string>>();for(const r of researchRecords)if(r.item.doi){const id=r.item.doi.toLowerCase();if(!doiTitles.has(id))doiTitles.set(id,new Set());doiTitles.get(id)!.add(r.item.title.toLowerCase())}
for(const r of researchRecords)if(r.item.doi&&(doiTitles.get(r.item.doi.toLowerCase())?.size||0)>1){r.published=false;r.reason='conflicting-doi'}
export const researchLibrary=researchRecords.filter(r=>r.published).map(r=>r.item);
