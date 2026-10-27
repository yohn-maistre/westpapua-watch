import {libraryItems} from './library';
import {archiveItems} from './archive';
import {exhibitionItems} from './exhibition';
import {events} from './events';
import {caseIndex} from './case-presentation';
import type {DiscoveryItem} from '../../shared/discovery';
function endOfEvent(date:string,timezone:string){const at=Date.parse(date+'T23:59:59Z');const offset=new Intl.DateTimeFormat('en-US',{timeZone:timezone,timeZoneName:'longOffset'}).formatToParts(at).find(p=>p.type==='timeZoneName')?.value||'GMT';const m=offset.match(/GMT([+-])(\d{2}):(\d{2})/);const minutes=m?(Number(m[2])*60+Number(m[3]))*(m[1]==='+'?1:-1):0;return new Date(at-minutes*60000).toISOString()}
const shorten=(s:string)=>s.length>125?s.slice(0,122).replace(/\s+\S*$/,'')+'…':s;
export const discoveryPool:DiscoveryItem[]=[
 ...caseIndex.map(c=>({id:'case:'+c.id,kind:'case' as const,title:c.title,href:c.href+'#explore'})),
 {id:'weekly',kind:'review',title:{en:'Read the week in context',pmy:'Baca perkembangan dalam konteks'},href:'/news/#weekly-review'},
 ...libraryItems.filter(x=>['book','research','report','film','dataset','document','map'].includes(x.itemType)).slice(0,100).map(x=>({id:'library:'+x.id,kind:'library' as const,title:{en:shorten(x.title),pmy:shorten(x.title)},detail:[x.authors?.[0]||x.publisher,x.year].filter(Boolean).join(' · '),href:'/resources/?q='+encodeURIComponent(x.title)})),
 ...archiveItems.filter(x=>x.access.mode!=='permission_pending'&&(x.mediaType==='film'?x.resolved.playback:x.resolved.image)).map(x=>({id:'archive:'+x.id,kind:'archive' as const,title:x.title,detail:x.date,href:'/history/?record='+encodeURIComponent(x.id)+'#archive'})),
 ...exhibitionItems.filter(x=>x.rights!=='source-only').map(x=>({id:'art:'+x.slug,kind:'art' as const,title:{en:x.title,pmy:x.title},detail:x.creator||x.credit?.split('.')[0]||x.publisher,href:'/exhibition/#work-'+x.slug})),
 ...events.filter(x=>!x.openEnded).map(x=>({id:'event:'+x.id,kind:'event' as const,title:{en:x.title,pmy:x.title},detail:x.place,date:x.date,expires:endOfEvent(x.endDate||x.date,x.timezone),href:'/events/#'+x.id}))
];
