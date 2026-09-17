import {publicRecords} from './records';
import {events} from './events';
import {exhibitionItems} from './exhibition';
import {topicTimelines} from './topic-timelines';
import { dossiers } from './dossiers';
import { issues } from './issues';
import { glossary } from './glossary';
import { historyChapters } from './history';
import { resources } from './resources';

export const searchCorpus = [
 ...publicRecords.filter(r=>r.kind==='place').flatMap(r=>r.observations.map((o,i)=>({id:`observation:${r.slug}:${i}`,type:'observation',title:{en:`${r.title} · ${o.metric} · ${o.period}`,pmy:`${r.title} · ${o.metric} · ${o.period}`},text:{en:`${o.metric}: ${o.value} ${o.unit}. Period: ${o.period}. Place: ${o.place}. Measure: ${o.measure}. Method: ${o.method}. Geography: ${o.geographyVersion}. Source: ${o.source.publisher}, ${o.source.url}. Source date: ${o.source.publishedAt||'not specified'}. Retrieved: ${o.source.retrievedAt||'not specified'}. ${o.source.note||''}`,pmy:`${o.metric}: ${o.value} ${o.unit}. Periode: ${o.period}. Wilayah: ${o.place}. Ukuran: ${o.measure}. Metode: ${o.method}. Sumber: ${o.source.publisher}, ${o.source.url}. ${o.source.note||''}`},publisher:o.source.publisher,href:`/data/${r.slug}/`,tags:['data','statistics','statistik',r.title,o.metric,o.period]}))),
 ...publicRecords.map(r=>({id:r.id,type:'record',title:{en:r.title,pmy:r.title},text:{en:`Catalogue record: ${r.description}. Sources: ${r.sources.map(s=>s.publisher+' '+s.url).join('; ')}`,pmy:`Catatan katalog: ${r.description}. Sumber: ${r.sources.map(s=>s.publisher+' '+s.url).join('; ')}`},href:`/data/${r.slug}/`,tags:[r.kind,...r.topics,...r.places]})),
 ...events.map((e:any)=>({id:`event:${e.id||e.slug||e.title?.en}`,type:'event',title:e.title,text:{en:JSON.stringify(e),pmy:JSON.stringify(e)},href:'/events/',tags:['events','acara',e.date]})),
 ...exhibitionItems.map(e=>({id:`exhibition:${e.slug}`,type:'exhibition',title:{en:e.title,pmy:e.title},text:{en:e.summary,pmy:e.summary},href:'/exhibition/view/',tags:['exhibition','artist','culture',e.type]})),
 ...Object.entries(topicTimelines).flatMap(([slug,items])=>items.map(e=>({id:`timeline:${e.id}`,type:'timeline',title:e.title,text:e.text,href:`/topics/${slug}/#timeline`,tags:['timeline','mifee',slug,e.date]}))),

  ...[...issues,...dossiers].map((item) => ({
    id: `issue:${item.slug}`,
    type: 'topic',
    title: item.title,
    text: item.summary,
    href: `/topics/${item.slug}/`,
    tags: [item.category, ...item.concepts]
  })),
  ...historyChapters.map((item) => ({
    id: `history:${item.year}`,
    type: 'history',
    title: { en: `${item.year} — ${item.title.en}`, pmy: `${item.year} — ${item.title.pmy}` },
    text: item.body,
    href: `/history/#${item.id}`,
    tags: [item.year, 'history']
  })),
  ...glossary.map((item) => ({
    id: `term:${item.slug}`,
    type: 'term',
    title: { en: item.term, pmy: item.term },
    text: item.definition,
    href: `/resources/#${item.slug}`,
    tags: ['glossary', item.slug]
  })),
  ...resources.map((item) => ({
    id: `resource:${item.id}`,
    type: 'resource',
    publisher:item.publisher,
    evidenceRoles:item.evidenceRoles,
    title: { en: item.title, pmy: item.title },
    text: { en: `Catalogue metadata: ${item.description||item.publisher}`, pmy: `Metadata katalog: ${item.description||item.publisher}` },
    href: item.url,
    tags: [item.publisher,...item.authors,item.doi||'',item.isbn||'',item.type, item.year,...item.topics,...item.places,...item.tags]
  }))
];
