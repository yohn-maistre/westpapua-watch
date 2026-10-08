import expansion from '../../content/history-explorer.json';
import { historyChapters } from './history';
import { archiveItemById } from './archive';
import { itemBySourceId } from './library';
import type { Localized } from './types';

export type HistoryPath = 'all' | 'political' | 'archaeology' | 'culture' | 'peoples' | 'social' | 'land';
export type HistoryPlace = { label: string; longitude: number; latitude: number };
export type HistoryRecord = {
  id: string; year: number; era: string; paths: HistoryPath[];
  yearLabel: Localized; title: Localized; body: Localized;
  sources: { title: string; publisher: string; url: string }[];
  media?: { src: string; caption: Localized; credit: string; url: string; license?: string; licenseUrl?: string };
  archiveIds: string[]; resourceIds?:string[]; places: HistoryPlace[];
};
export const historyPaths: { id: HistoryPath; label: Localized; start: Localized; startId?:string }[] = [
 {id:'archaeology',label:{en:'Deep time',pmy:'Masa awal'},start:{en:'Landscape & settlement',pmy:'Bentang alam & permukiman'},startId:'history-geography'},
 {id:'peoples',label:{en:'Peoples & languages',pmy:'Masyarakat & bahasa'},start:{en:'Movement & contact',pmy:'Perpindahan & hubungan'},startId:'history-austronesian'},
 {id:'social',label:{en:'Society & exchange',pmy:'Masyarakat & pertukaran'},start:{en:'Regional histories',pmy:'Sejarah regional'},startId:'history-leadership'},
 {id:'culture',label:{en:'Culture & knowledge',pmy:'Budaya & pengetahuan'},start:{en:'Living practices',pmy:'Praktik yang hidup'},startId:'history-khombouw'},
 {id:'political',label:{en:'Political history',pmy:'Sejarah politik'},start:{en:'1828 onward',pmy:'Sejak 1828'},startId:'history-1828'},
 {id:'land',label:{en:'Land & work',pmy:'Tanah & penghidupan'},start:{en:'Food, forests & industry',pmy:'Pangan, hutan & industri'},startId:'history-sago'},
 {id:'all',label:{en:'Full chronology',pmy:'Kronologi lengkap'},start:{en:'All dates',pmy:'Semua tahun'}}
];
export const historyEras = [
  { id:'early',label:{en:'Early settlement',pmy:'Permukiman awal'} },
  { id:'colonial',label:{en:'1828–1948',pmy:'1828–1948'} },
  { id:'postwar',label:{en:'1949–1960',pmy:'1949–1960'} },
  { id:'transfer',label:{en:'1961–1969',pmy:'1961–1969'} },
  { id:'public-life',label:{en:'1970–1997',pmy:'1970–1997'} },
  { id:'recent',label:{en:'1998 onward',pmy:'Sejak 1998'} },
];
const jayapura: HistoryPlace = {label:'Hollandia / Jayapura',longitude:140.72,latitude:-2.53};
const biak: HistoryPlace = {label:'Biak',longitude:136.05,latitude:-1.18};
const fakfak: HistoryPlace = {label:'Fak-Fak',longitude:132.30,latitude:-2.93};
const manokwari: HistoryPlace = {label:'Manokwari',longitude:134.07,latitude:-0.86};
const merauke: HistoryPlace = {label:'Merauke',longitude:140.40,latitude:-8.49};
const sentani: HistoryPlace = {label:'Lake Sentani',longitude:140.51,latitude:-2.61};
const membership: Record<string,{year:number;era:string;paths:HistoryPath[];places?:HistoryPlace[]}> = {
  'history-living':{year:2012,era:'recent',paths:['culture','social']},
  'history-1949':{year:1949,era:'postwar',paths:['political']},
  'history-1961':{year:1961,era:'transfer',paths:['political'],places:[jayapura]},
  'history-1962':{year:1962,era:'transfer',paths:['political']},
  'history-1969':{year:1969,era:'transfer',paths:['political']},
  'history-land':{year:1970,era:'public-life',paths:['land']},
  'history-mambesak':{year:1978,era:'public-life',paths:['culture']},
  'history-reformasi':{year:1998,era:'recent',paths:['political']},
  'history-2001':{year:2001,era:'recent',paths:['political','social']},
  'history-2014':{year:2014,era:'recent',paths:['political']},
  'history-today':{year:2022,era:'recent',paths:['political','social']},
};
const directTitles: Record<string,Localized> = {
  'history-living':{en:'Noken',pmy:'Noken'},
  'history-1949':{en:'West New Guinea after 1949',pmy:'Nugini Barat setelah 1949'},
  'history-1961':{en:'New Guinea Council',pmy:'Dewan Nugini'},
  'history-1962':{en:'The New York Agreement',pmy:'Perjanjian New York'},
  'history-1969':{en:'Pepera',pmy:'Pepera'},
  'history-land':{en:'Land and livelihoods',pmy:'Tanah dan penghidupan'},
  'history-mambesak':{en:'Mambesak',pmy:'Mambesak'},
  'history-reformasi':{en:'Reformasi and the Papuan Congress',pmy:'Reformasi dan Kongres Papua'},
  'history-2001':{en:'Special autonomy',pmy:'Otonomi khusus'},
  'history-2014':{en:'The Saralana Declaration',pmy:'Deklarasi Saralana'},
  'history-today':{en:'Displacement and humanitarian access',pmy:'Pengungsian dan akses kemanusiaan'},
};
const conciseBodies: Record<string,Localized> = {
  'history-1949':{en:'The Netherlands retained West New Guinea when sovereignty was transferred to Indonesia in 1949. Papuan political aspirations developed amid competing Dutch and Indonesian plans for the territory.',pmy:'Belanda tetap menguasai Nugini Barat ketika kedaulatan diserahkan kepada Indonesia pada 1949. Aspirasi politik Papua berkembang di tengah rencana Belanda dan Indonesia yang bersaing.'},
  'history-1961':{en:'The New Guinea Council became a focus of political life under Dutch administration. On 1 December 1961, the Morning Star flag was raised alongside the Dutch flag. Colonial administration continued; Indonesia opposed a separate Papuan state.',pmy:'Dewan Nugini menjadi salah satu pusat kehidupan politik di bawah pemerintahan Belanda. Pada 1 Desember 1961, Bintang Kejora dikibarkan bersama bendera Belanda. Pemerintahan kolonial masih berlangsung; Indonesia menolak negara Papua tersendiri.'},
  'history-1962':{en:'Indonesia and the Netherlands signed the New York Agreement on 15 August 1962. It provided for temporary UN administration, transfer to Indonesia on 1 May 1963, and an act of self-determination before the end of 1969. Papuan representatives were not signatories.',pmy:'Indonesia dan Belanda menandatangani Perjanjian New York pada 15 Agustus 1962. Perjanjian mengatur pemerintahan sementara PBB, penyerahan administrasi kepada Indonesia pada 1 Mei 1963, dan penentuan nasib sendiri sebelum akhir 1969. Wakil Papua bukan penanda tangan.'},
  'history-1969':{en:'Pepera used selected representative assemblies rather than a vote by all adult residents. The assemblies supported integration with Indonesia. Accounts of pressure and restrictions on expression remain central to Papuan criticism. UN Resolution 2504 took note of the Secretary-General’s report.',pmy:'Pepera menggunakan musyawarah perwakilan, bukan pemungutan suara seluruh penduduk dewasa. Perwakilan mendukung integrasi dengan Indonesia. Laporan tekanan politik dan pembatasan kebebasan berpendapat tetap menjadi bagian penting kritik Papua. Resolusi PBB 2504 mencatat laporan Sekretaris Jenderal.'},
};
const curated: HistoryRecord[] = historyChapters.map(c=>({
  id:c.id,...membership[c.id],yearLabel:c.yearLabel,title:directTitles[c.id]||c.title,
  body:c.body,media:c.media,
  sources:c.sourceIds.map(id=>itemBySourceId[id]).filter(Boolean).map(s=>({title:s.title,publisher:s.publisher,url:s.url})),
  archiveIds:Object.values(archiveItemById).filter(a=>a.relatedHistoryEvents?.includes(c.id)).map(a=>a.id),
  places:membership[c.id].places||[],
}));
function archiveRecord(id:string,year:number,era:string,places:HistoryPlace[]):HistoryRecord {
  const a=archiveItemById[id];
  return {id:`history-${id}`,year,era,paths:['social'],yearLabel:{en:String(year),pmy:String(year)},title:a.title,
    body:a.editorial.caption,sources:[{title:a.archive.identifier||a.title.en,publisher:a.archive.institution,url:a.archive.sourceUrl}],
    media:a.mediaType==='photo'&&a.resolved.image?{src:a.resolved.image,caption:a.editorial.caption,credit:[a.archive.creator,a.archive.institution].filter(Boolean).join(' · '),url:a.archive.sourceUrl,license:a.access.license||a.access.rightsStatus,licenseUrl:a.access.licenseUrl||a.archive.sourceUrl}:undefined,archiveIds:[a.id],places};
}
const archaeology: HistoryRecord[] = [
  {id:'history-mololo',year:-55000,era:'early',paths:['archaeology'],yearLabel:{en:'55,000–50,000 years ago',pmy:'55.000–50.000 tahun lalu'},title:{en:'Mololo Cave, Waigeo',pmy:'Gua Mololo, Waigeo'},
    body:{en:'Research at Mololo Cave on Waigeo dates human activity to approximately 55,000–50,000 years ago. A worked piece of tree resin provides evidence of plant use at the site.',pmy:'Penelitian di Gua Mololo, Waigeo, menunjukkan aktivitas manusia sekitar 55.000–50.000 tahun lalu. Potongan resin pohon yang diolah menjadi bukti pemanfaatan tumbuhan di situs tersebut.'},
    sources:[{title:'Oldest plant artefact found outside Africa reveals Pacific’s role in early human migration',publisher:'University of Oxford · 2024',url:'https://www.ox.ac.uk/news/2024-08-15-oldest-plant-artefact-found-outside-africa-reveals-pacifics-role-early-human'},{title:'Mololo Cave study',publisher:'Antiquity · 2024',url:'https://doi.org/10.15184/aqy.2024.83'}],archiveIds:[],places:[]},
  {id:'history-toe-kria',year:-24000,era:'early',paths:['archaeology'],yearLabel:{en:'24,000 years ago',pmy:'24.000 tahun lalu'},title:{en:'Inland settlement in the Bird’s Head',pmy:'Permukiman pedalaman Kepala Burung'},
    body:{en:'Research at Toé Kria documents occupation of inland rainforest in the Bird’s Head from around 24,000 calibrated years before present. The record concerns this site, rather than a single settlement history for all of Papua.',pmy:'Penelitian di Toé Kria mencatat hunian di hutan pedalaman Kepala Burung sejak sekitar 24.000 tahun terkalibrasi sebelum kini. Temuan ini berkaitan dengan situs tersebut, bukan satu riwayat permukiman untuk seluruh Papua.'},
    sources:[{title:'Late Pleistocene human occupation of inland rainforest, Bird’s Head, Irian Jaya',publisher:'Pasveer, Clarke & Miller · 2002',url:'https://researchportalplus.anu.edu.au/en/publications/late-pleistocene-human-occupation-of-inland-rainforest-birds-head/'}],archiveIds:[],places:[]},
];
export const prototypeHistoryRecords: HistoryRecord[] = [...(expansion.records as HistoryRecord[]),...archaeology,...curated,
  archiveRecord('serido-biak-1950',1950,'postwar',[biak]),
  archiveRecord('hollandia-housing-1953',1953,'postwar',[jayapura]),
  archiveRecord('manokwari-street-1954',1954,'postwar',[manokwari]),
  archiveRecord('fakfak-neighbourhood-1956',1956,'postwar',[fakfak]),
  archiveRecord('sentani-powe-1958',1958,'postwar',[sentani]),
  archiveRecord('merauke-street-1961',1961,'transfer',[merauke]),
  archiveRecord('evacuees-1962',1962,'transfer',[biak,fakfak]),
].sort((a,b)=>a.year-b.year);
export const recordsForPath = (path:HistoryPath)=>prototypeHistoryRecords.filter(r=>path==='all'||r.paths.includes(path));
export function companionFor(record:HistoryRecord):HistoryRecord|undefined {
  if(!['history-mololo','history-1961','history-1969','history-freeport-contract','history-mambesak','history-reformasi','history-mifee'].includes(record.id))return;
  return prototypeHistoryRecords.filter(r=>r.id!==record.id&&r.era===record.era&&!r.paths.some(p=>record.paths.includes(p)))
    .sort((a,b)=>Math.abs(a.year-record.year)-Math.abs(b.year-record.year))[0];
}

export const historyRecords=prototypeHistoryRecords;
