import type {APIRoute} from 'astro';
import {events} from '../data/events';
const escape=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const stamp=(s:string)=>s.replaceAll('-','');
const fold=(line:string)=>{const chunks:string[]=[];let part='';for(const char of line){if(new TextEncoder().encode(part+char).length>72){chunks.push(part);part=' '+char}else part+=char}chunks.push(part);return chunks.join('\r\n')};
export const GET:APIRoute=()=>{
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//West Papua Watch//Public events//EN','CALSCALE:GREGORIAN','X-WR-CALNAME:West Papua Watch events'];
 for(const e of events.filter(x=>!x.openEnded||x.endDate)){
  lines.push('BEGIN:VEVENT',`UID:${e.id}@westpapua.watch`,`DTSTAMP:${stamp(new Date().toISOString().slice(0,10))}T000000Z`);
  if(e.time)lines.push(`DTSTART;TZID=${e.timezone}:${stamp(e.date)}T${e.time.replace(':','')}00`);
  else {lines.push(`DTSTART;VALUE=DATE:${stamp(e.date)}`);const after=new Date(`${e.endDate||e.date}T12:00:00Z`);after.setUTCDate(after.getUTCDate()+1);lines.push(`DTEND;VALUE=DATE:${stamp(after.toISOString().slice(0,10))}`)}
  lines.push(`SUMMARY:${escape(e.title)}`,`LOCATION:${escape(e.place)}`,`DESCRIPTION:${escape(e.summary.en)}\\nSource: ${escape(e.sourceUrl)}`,`URL:${e.sourceUrl}`,'END:VEVENT');
 }
 lines.push('END:VCALENDAR');return new Response(lines.map(fold).join('\r\n')+'\r\n',{headers:{'Content-Type':'text/calendar; charset=utf-8','Cache-Control':'public, max-age=3600'}});
};
