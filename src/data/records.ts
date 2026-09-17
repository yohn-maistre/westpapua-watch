import apbd from '../../content/data/apbd.json';
import otsus from '../../content/data/otsus.json';
import hdi from '../../content/data/hdi.json';
import {libraryItems} from './library';
import {organizations,organizationIdsFor} from '../../shared/organizations';
import {recordSlug,validateRecord,type PublicRecord} from '../../shared/records';
import curated from '../../content/records/curated.json';
const base={topics:[],places:[],sources:[],libraryIds:[],relations:[],observations:[],status:'catalogue' as const};
const orgRecords:PublicRecord[]=organizations.map(o=>({...base,id:`org:${o.id}`,slug:o.id,kind:'organization',title:o.name,description:o.description||o.role,sources:[{url:o.url,publisher:o.name,note:o.provenance}],libraryIds:libraryItems.filter(i=>organizationIdsFor(i).includes(o.id)).map(i=>i.id)}));
const catalogue:PublicRecord[]=libraryItems.filter(i=>['document','dataset','map','archive','collection','statement'].includes(i.itemType)).map(i=>({...base,id:`library:${i.id}`,slug:recordSlug(i.id),kind:i.itemType==='dataset'||i.itemType==='map'?'dataset':i.itemType==='collection'||i.itemType==='archive'?'collection':'document',title:i.title,description:i.description||i.title,topics:i.topics,places:i.places,libraryIds:[i.id],sources:[{url:i.url,publisher:i.publisher||'Catalogue source',publishedAt:i.publishedAt,note:'Catalogue metadata; full text is not implied.'}],relations:organizationIdsFor(i).map(id=>({predicate:'published by',target:`org:${id}`,evidence:{url:i.url,publisher:i.publisher}}))}));
const places:PublicRecord[]=['Papua','Papua Barat','Papua Tengah','Papua Pegunungan','Papua Selatan','Papua Barat Daya'].map(title=>({...base,id:'place:'+title,slug:title.toLowerCase().replaceAll(' ','-'),kind:'place',title,description:`Browse the Watch collection for ${title}.`,places:[title],sources:[{url:'https://www.bps.go.id/id',publisher:'Badan Pusat Statistik',note:'Province name; this record contains no population estimate.'}],libraryIds:libraryItems.filter(i=>i.places.includes(title)).map(i=>i.id)}));
const gateways:PublicRecord[]=[
 ['bps-statistics','BPS statistics','dataset','Population, economy and public-service statistics.','https://www.bps.go.id/id','Badan Pusat Statistik'],
 ['regional-finance','Regional public finance','dataset','APBD budgets and reported realization. Select the period and region at the source.','https://djpk.kemenkeu.go.id/portal/data/apbd','DJPK'],
 ['election-data','Election data','dataset','KPU datasets covering elections, participation and representation.','https://opendata.kpu.go.id/','KPU'],
 ['legal-records','Laws & regulations','collection','Search published regulations and their source documents.','https://peraturan.bpk.go.id/','JDIH BPK']
].map(([slug,title,kind,description,url,publisher])=>({...base,id:'source:'+slug,slug,title,kind:kind as any,description,sources:[{url,publisher,retrievedAt:'2026-09-17',note:'Source directory; individual records are not yet synchronized.'}]}));
export const publicRecords:PublicRecord[]=[...orgRecords,...places,...gateways,...catalogue,...curated as PublicRecord[]];
// One observation pool feeds the dashboard, province pages and JSON exports.
const apbdSource={url:apbd.sourceUrl,publisher:'DJPK · APBD',retrievedAt:apbd.diambil,note:'Fiscal year 2024, period 12; snapshot via Detak Detik.'};
const otsusSource={url:otsus.sourceUrl,publisher:otsus.source,publishedAt:otsus.sourceAsOf,retrievedAt:otsus.retrievedAt,note:otsus.scope};
const hdiSource={url:hdi.sourceUrl,publisher:hdi.source,retrievedAt:hdi.retrievedAt,note:hdi.publication+' · '+hdi.page};
for(const record of places){
 const fiscal=apbd.baris.find(x=>x.nama==='Provinsi '+record.title)!,transfers=otsus.rows.find(x=>x.province===record.title)!,index=hdi.rows.find(x=>x.province===record.title)!;
 const observation=(metric:string,value:number,unit:string,period:string,measure:any,source:any,method:string)=>({metric,value,unit,period,place:record.title,measure,source,method,geographyVersion:'Six-province Papua geography after the 2022 divisions'});
 record.observations=[
 observation('APBD expenditure budget',fiscal.bA,'IDR','2024','allocation',apbdSource,'Provincial government, period 12'),
 observation('APBD expenditure',fiscal.b,'IDR','2024','expenditure',apbdSource,'Provincial government, period 12'),
 observation('APBD personnel expenditure',fiscal.p,'IDR','2024','expenditure',apbdSource,'Provincial government, period 12'),
 observation('APBD capital expenditure',fiscal.m,'IDR','2024','expenditure',apbdSource,'Provincial government, period 12'),
 observation('General Otsus allocation',transfers.generalBudget,'IDR billion','2026','allocation',otsusSource,'Province-labelled account in national TKD report'),
 observation('General Otsus transferred',transfers.generalActual,'IDR billion','2026','transfer',otsusSource,'Province-labelled account in national TKD report'),
 observation('Earmarked Otsus allocation',transfers.earmarkedBudget,'IDR billion','2026','allocation',otsusSource,'Province-labelled account in national TKD report'),
 observation('Earmarked Otsus transferred',transfers.earmarkedActual,'IDR billion','2026','transfer',otsusSource,'Province-labelled account in national TKD report'),
 observation('Infrastructure allocation',transfers.infrastructureBudget,'IDR billion','2026','allocation',otsusSource,'Province-labelled account in national TKD report'),
 observation('Infrastructure transferred',transfers.infrastructureActual,'IDR billion','2026','transfer',otsusSource,'Province-labelled account in national TKD report'),
 observation('Human Development Index',index.previous,'index (0–100)','2023','observed',hdiSource,'BPS HDI series in appendix 4'),
 observation('Human Development Index',index.current,'index (0–100)','2024','observed',hdiSource,'BPS HDI series in appendix 4')];
 record.sources=[apbdSource,otsusSource,hdiSource];record.status='documented';record.description='Provincial expenditure, special-autonomy transfers and human-development indicators. Each observation preserves its period, unit and source.';
}
const finance=gateways.find(x=>x.slug==='regional-finance')!;finance.observations=places.flatMap(x=>x.observations.filter(o=>o.metric.startsWith('APBD')));finance.sources=[apbdSource];finance.description='2024 provincial budgets and reported expenditure for all six provinces; period 12.';finance.status='documented';
const stats=gateways.find(x=>x.slug==='bps-statistics')!;stats.observations=places.flatMap(x=>x.observations.filter(o=>o.metric==='Human Development Index'));stats.sources=[hdiSource];stats.description='Comparable 2023–2024 human-development indicators for six provinces.';stats.status='documented';
for(const r of publicRecords)validateRecord(r);
if(new Set(publicRecords.map(r=>r.slug)).size!==publicRecords.length)throw Error('Public record slug collision');
export const recordById=new Map(publicRecords.map(r=>[r.id,r]));

if(recordById.size!==publicRecords.length)throw Error('Public record identity collision');
for(const r of publicRecords)for(const rel of r.relations)if(!recordById.has(rel.target))throw Error(`Unknown relationship target: ${rel.target}`);
