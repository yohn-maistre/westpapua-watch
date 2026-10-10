import reading from '../../content/history-reading.json';
import {prototypeHistoryRecords,historyPaths,type HistoryPath,type HistoryRecord,type HistoryPlace} from './history-prototype';
import {archiveItemById} from './archive';
import type {Localized} from './types';

export type TemporalKind='event'|'period'|'undated'|'living'|'orientation'|'context';
export type ReadingParagraph={text:Localized;sourceUrls:string[]};
export type ReadingRecord=HistoryRecord & {exhibition?:boolean;additionalArchiveIds?:string[];visualIds?:string[];paragraphs?:ReadingParagraph[];places:(HistoryPlace & {note?:Localized})[]};
export type HistoryPanel={id:string;label:Localized;paths:HistoryPath[];records:ReadingRecord[];visualIds:string[]};
export type ReadingChapter={id:string;era:string;date:Localized;title:Localized;kind:TemporalKind;main:boolean;panels:HistoryPanel[]};
export const readingEras=reading.eras;
export const readingPaths=historyPaths.map(p=>p.id==='all'?{...p,label:{en:'Timeline',pmy:'Linimasa'},start:{en:'Settlement to the present',pmy:'Permukiman hingga sekarang'}}:p.id==='political'?{...p,start:{en:'Institutions & movements',pmy:'Lembaga & gerakan'}}:p);
const overrides=reading.overrides as Record<string,Partial<ReadingRecord>>;
export const readingRecords:ReadingRecord[]=[...prototypeHistoryRecords,...reading.records as HistoryRecord[]].map(r=>{
 const amended={...r,...overrides[r.id]};
 return {...amended,archiveIds:[...new Set([...r.archiveIds,...(amended.additionalArchiveIds||[])])].filter(id=>!['mansinam-route','digoel-internment','khombouw-materials'].includes(id))};
});
const byId=Object.fromEntries(readingRecords.map(r=>[r.id,r]));
const panelLabels:Record<string,Localized>={political:{en:'Politics',pmy:'Politik'},culture:{en:'Culture',pmy:'Budaya'},peoples:{en:'Peoples',pmy:'Masyarakat'},social:{en:'Society',pmy:'Kehidupan sosial'},land:{en:'Land',pmy:'Tanah'},archaeology:{en:'Archaeology',pmy:'Arkeologi'}};
const priority:HistoryPath[]=['political','archaeology','social','culture','land','peoples'];
export const readingChapters:ReadingChapter[]=reading.chapters.map(c=>{
 const primary=c.primary.map(id=>byId[id]);
 const paths=[...new Set(primary.flatMap(r=>r.paths))];
 const mainPath=priority.find(p=>paths.includes(p))!;
 return {...c,kind:c.kind as TemporalKind,panels:[{id:c.id+'-main',label:('mainLabel' in c?c.mainLabel:null)||(c.kind==='orientation'?{en:'Landscape',pmy:'Bentang alam'}:panelLabels[mainPath]),paths,records:primary,visualIds:c.visualIds},...c.facets.map((f,i)=>({id:c.id+'-'+f.path+'-'+i,label:('label' in f?f.label:null)||panelLabels[f.path],paths:[...new Set([f.path as HistoryPath,...f.records.flatMap(id=>byId[id].paths)])],records:f.records.map(id=>byId[id]),visualIds:f.visualIds}))]};
});
export const chaptersForPath=(path:HistoryPath)=>readingChapters.filter(c=>path==='all'?c.main:c.panels.some(p=>p.paths.includes(path)));
export const panelForPath=(c:ReadingChapter,path:HistoryPath)=>path==='all'?c.panels[0]:c.panels.find(p=>p.paths.includes(path))||c.panels[0];
export const sourcesForPanel=(p:HistoryPanel)=>[...new Map(p.records.flatMap(r=>r.sources).map(s=>[s.url,s])).values()];
// URL-derived anchors stay stable when editors reorder references.
export function sourceAnchor(panelId:string,url:string){let hash=2166136261;for(const char of url)hash=Math.imul(hash^char.charCodeAt(0),16777619);return `source-${panelId}-${(hash>>>0).toString(36)}`;}
export function paragraphsForRecord(r:ReadingRecord):ReadingParagraph[]{
 if(r.paragraphs)return r.paragraphs;
 const en=r.body.en.split('\n\n'),pmy=r.body.pmy.split('\n\n');
 return en.map((text,i)=>({text:{en:text,pmy:pmy[i]||text},sourceUrls:r.sources.map(s=>s.url)}));
}
// This is the geographic reference projection used by the existing atlas fallback.
export {projectHistoryPoint} from '../lib/map/history-projection';
export function figuresForPanel(p:HistoryPanel){
 return p.visualIds.map(id=>({archiveId:id,item:archiveItemById[id]})).filter(x=>x.item?.resolved.image||x.item?.resolved.poster);
}
export function placesForPanel(p:HistoryPanel):(HistoryPlace & {note:Localized;source:string})[]{
 const seen=new Set<string>();
 return p.records.flatMap(r=>r.places.map(place=>({...place,note:place.note||r.title,source:r.sources[0]?.url||''}))).filter(place=>{const key=place.label;if(seen.has(key))return false;seen.add(key);return true;});
}
