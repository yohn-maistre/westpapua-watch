import { dossiers } from './dossiers';
import { issues } from './issues';
import { glossary } from './glossary';
import { historyChapters } from './history';
import { resources } from './resources';

export const searchCorpus = [
  ...[...issues,...dossiers].map((item) => ({
    id: `issue:${item.slug}`,
    type: 'topic',
    title: item.title,
    text: item.summary,
    href: `/issues/${item.slug}/`,
    tags: [item.category, ...item.concepts]
  })),
  ...historyChapters.map((item) => ({
    id: `history:${item.year}`,
    type: 'history',
    title: { en: `${item.year} — ${item.title.en}`, pmy: `${item.year} — ${item.title.pmy}` },
    text: item.body,
    href: `/history/`,
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
    text: { en: item.publisher, pmy: item.publisher },
    href: item.url,
    tags: [item.publisher, item.type, item.year]
  }))
];
