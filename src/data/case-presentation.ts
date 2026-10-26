import routes from '../../content/investigative-routes.json';
import {archiveItemById,archivePreview} from './archive';
import type {Localized} from './types';

const p=(en:string,pmy:string):Localized=>({en,pmy});
export const caseRoute:Record<string,string>=routes;
export const caseIdBySlug:Record<string,string>={
 'south-papua-food-energy-estate':'merauke','freeport-mimika':'freeport','papuan-civic-space':'communications',
 'kiwirok-conflict':'kiwirok','nduga-displacement':'nduga','puncak-displacement':'puncak','intan-jaya-displacement':'intan-jaya',
 'awyu-customary-forests':'awyu','mining-raja-ampat':'raja'
};
export const caseTitles:Record<string,Localized>={
 merauke:p('Merauke: land and estates','Merauke: tanah dan proyek pangan'),freeport:p('Freeport and Mimika','Freeport dan Mimika'),
 nduga:p('Nduga: displacement and return','Nduga: pengungsian dan kepulangan'),puncak:p('Puncak: civilians and services','Puncak: warga dan layanan'),
 'intan-jaya':p('Intan Jaya: land and conflict','Intan Jaya: tanah dan konflik'),awyu:p('Awyu customary forests','Hutan adat Awyu'),
 raja:p('Mining in Raja Ampat','Tambang di Raja Ampat'),communications:p('Civic space and information','Ruang sipil dan informasi'),
 kiwirok:p('Kiwirok: attacks and displacement','Kiwirok: serangan dan pengungsian'),
 'political-access':p('Political access','Akses politik'),'military-business':p('Military business','Bisnis militer')
};
const media:Record<string,string>={merauke:'merauke-source-2',freeport:'grasberg-iss-2005',nduga:'nduga-weneroma-2019',puncak:'puncak-komnas-2025','intan-jaya':'gold-rush-report',awyu:'awyu-hearing-2023',communications:'ariana-elopere-2023',kiwirok:'kiwirok-report-2023','political-access':'merauke-source-1','military-business':'occupation-report-2011'};
export function caseCover(id:string){
 if(id==='communications')return {src:'/images/investigations/papua-internet-blackout-protest-2019.jpg',width:1024,height:681,caption:p('Protesters demand an end to the Papua internet blackout outside the Communications Ministry in Jakarta, 23 August 2019.','Aksi menuntut pencabutan blokir internet Papua di depan Kementerian Kominfo, Jakarta, 23 Agustus 2019.'),credit:'Dasril Roszandi / AFP',url:'https://www.ifj.org/media-centre/news/detail/category/asia-pacific/article/indonesia-court-finds-internet-ban-in-papua-and-west-papua-violates-the-law',document:false,position:'50% 20%'};
 if(id==='raja')return {src:'/images/investigations/gag-nickel-greenpeace-2026.jpg',width:1200,height:899,caption:p('PT Gag Nikel’s mine on Gag Island, photographed for Greenpeace.','Tambang PT Gag Nikel di Pulau Gag, didokumentasikan Greenpeace.'),credit:'© Greenpeace',url:'https://www.greenpeace.org/southeastasia/press/69207/greenpeace-clarifies-findings-on-the-raja-ampats-nickel-report/',document:false,position:'50% 50%'};
 const item=archiveItemById[media[id]],preview=item&&archivePreview(item.id);if(!item||!preview)return null;
 return {src:preview.src,width:preview.width,height:preview.height,caption:item.editorial.caption,credit:item.id.startsWith('merauke-source')?'Pusaka':item.archive.creator||item.archive.institution,url:item.archive.sourceUrl,document:/report|amicus|declaration/.test(item.id),position:'50% 50%'};
}
export const followedCaseIds=['merauke','freeport','nduga','awyu','raja','communications','puncak','intan-jaya','kiwirok'];
export const caseIndex=[...followedCaseIds,'political-access','military-business'].map(id=>({id,href:caseRoute[id],title:caseTitles[id],cover:caseCover(id),thread:['political-access','military-business'].includes(id)}));
export const investigativeRoutes=caseRoute;
