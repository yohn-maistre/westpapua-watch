import type {HistoryPath} from '../data/history-prototype';
import type {Localized} from '../data/types';

export type ReadingPath=Exclude<HistoryPath,'all'|'peoples'>;
export const defaultReadingPath:ReadingPath='political';
export const readingPaths:{id:ReadingPath;label:Localized;start:Localized}[]=[
 {id:'political',label:{en:'Political history',pmy:'Sejarah politik'},start:{en:'Self-determination & public life',pmy:'Penentuan nasib sendiri & kehidupan publik'}},
 {id:'social',label:{en:'Peoples & societies',pmy:'Masyarakat & adat'},start:{en:'Languages, institutions & exchange',pmy:'Bahasa, lembaga & pertukaran'}},
 {id:'culture',label:{en:'Culture & knowledge',pmy:'Budaya & pengetahuan'},start:{en:'Making, performance & transmission',pmy:'Karya, pertunjukan & pewarisan'}},
 {id:'land',label:{en:'Land & livelihoods',pmy:'Tanah & penghidupan'},start:{en:'Food, forests & concessions',pmy:'Pangan, hutan & konsesi'}},
 {id:'archaeology',label:{en:'Early settlement',pmy:'Masa awal'},start:{en:'Landscape & archaeological evidence',pmy:'Bentang alam & bukti arkeologi'}},
];
export const normalizeReadingPath=(path:string|null):ReadingPath=>path==='peoples'?'social':readingPaths.some(p=>p.id===path)?path as ReadingPath:defaultReadingPath;
