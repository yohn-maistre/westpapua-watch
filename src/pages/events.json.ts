import type {APIRoute} from 'astro';
import {events,eventsAsOf} from '../data/events';
export const GET:APIRoute=()=>new Response(JSON.stringify({asOf:eventsAsOf,items:events.map(({id,date,endDate,time,timezone,title,place,region,kind,format,summary,sourceUrl,organizer,series,issueSlug,openEnded})=>({id,date,endDate,time,timezone,title,place,region,kind,format,summary,sourceUrl,organizer,series,issueSlug,openEnded}))}),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=3600'}});
