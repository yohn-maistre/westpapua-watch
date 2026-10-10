import additions from '../../content/following-timelines.json';
import merauke from '../../content/merauke-timeline.json';
import type {Localized} from './types';
// Curated event dates remain separate from the worker's live current picture.
export type Milestone={id:string;date:string;dateEnd?:string;title:Localized;text:Localized;source:string;publisher:string;sources?:{url:string;publisher:string}[];mediaIds?:string[];featured?:boolean;sourceDateLabel?:string};
export const topicTimelines:Record<string,Milestone[]>={...additions,'south-papua-food-energy-estate':merauke};
export function milestoneDate(entry:Milestone,locale:'en'|'pmy'){
 const format=(date:string)=>date.length===4?date:new Intl.DateTimeFormat(locale==='en'?'en-GB':'id-ID',{...(date.length>7?{day:'numeric' as const}:{}),month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${date.length===7?date+'-01':date}T00:00:00Z`));
 return `${format(entry.date)}${entry.dateEnd?' – '+format(entry.dateEnd):''}`;
}
