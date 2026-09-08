import { sourceById } from './sources';
import raw from '../../content/resources.json';
import extra from '../../content/reference-sources.json';

// Resources are a curated long-term library. News articles stay on Current and Issue pages.
const tagsById=(raw as {tagsById?:Record<string,string[]>}).tagsById||{};
export const resources=[...new Set([...raw.resourceIds,...extra.map(s=>s.id)])].map(id=>sourceById[id]).filter(Boolean).map(source=>({...source,year:source.date?.slice(0,4)||'—',format:source.format||(/\.pdf(?:$|[?#])/i.test(source.url)?'pdf':'web'),tags:tagsById[source.id]||source.tags||[]}));
