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
for(const r of publicRecords)validateRecord(r);
if(new Set(publicRecords.map(r=>r.slug)).size!==publicRecords.length)throw Error('Public record slug collision');
export const recordById=new Map(publicRecords.map(r=>[r.id,r]));

if(recordById.size!==publicRecords.length)throw Error('Public record identity collision');
for(const r of publicRecords)for(const rel of r.relations)if(!recordById.has(rel.target))throw Error(`Unknown relationship target: ${rel.target}`);
