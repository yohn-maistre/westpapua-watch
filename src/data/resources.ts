import { sourceById } from './sources';
import raw from '../../content/resources.json';

// Resources are a curated long-term library. News articles stay on Current and Issue pages.
export const resources=raw.resourceIds.map(id=>sourceById[id]).filter(Boolean).map(source=>({...source,year:source.date?.slice(0,4)||'—'}));
