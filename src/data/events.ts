import raw from '../../content/events.json';
export type WatchEvent={id:string;date:string;endDate:string|null;time:string|null;timezone:string;title:string;place:string;region:'Papua'|'International'|'Indonesia'|'Online';kind:string;format:string;summary:{en:string;pmy:string};sourceUrl:string;sourceId:string;organizer:string;series?:string;issueSlug?:string;openEnded?:boolean;hidden?:boolean};
export const events=(raw.events as WatchEvent[]).filter(event=>!event.hidden).sort((a,b)=>`${a.date}T${a.time||'00:00'}`.localeCompare(`${b.date}T${b.time||'00:00'}`));
export const campaignMaterials=raw.campaignMaterials.filter(item=>!item.hidden);
export const eventsAsOf=raw.asOf;
/** Compare a listing against the calendar date where it takes place. */
export function dateInZone(timezone:string,now=new Date()):string{
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const value=(type:string)=>parts.find(part=>part.type===type)?.value||'';
 return `${value('year')}-${value('month')}-${value('day')}`;
}
