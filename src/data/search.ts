import {events} from './events';
import {exhibitionItems} from './exhibition';
import {topicTimelines} from './topic-timelines';
import { dossiers } from './dossiers';
import { issues } from './issues';
import { glossary } from './glossary';
import { historyChapters } from './history';
import { resources } from './resources';

export const searchCorpus = [
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
    title: { en: item.title, pmy: item.title },
    text: { en: item.description||item.publisher, pmy: item.description||item.publisher },
    href: item.url,
    tags: [item.publisher, item.type, item.year]
  }))
];
