import {sources} from './sources';
import {issues} from './issues';
import {dossiers} from './dossiers';
import {developments} from './developments';
import selection from '../../content/resources.json';
import extras from '../../content/reference-sources.json';
import overrides from '../../content/library-metadata.json';
import {normalizeLibraryItem,broadTopics,mergeLibraryItems} from '../../shared/library';
const selected=new Set([...selection.resourceIds,...extras.filter(s=>s.published!==false).map(s=>s.id)]);
const topics=[...issues,...dossiers];
export const itemPool=sources.map(s=>{
 const metadata=(overrides as Record<string,any>)[s.id]||{};
 const tags=(selection.tagsById as Record<string,string[]>)[s.id]||s.tags||[];
 return {sourceId:s.id,...normalizeLibraryItem({...s,...metadata,tags,curated:selected.has(s.id),topics:[...new Set([...topics.filter(t=>t.sourceIds.includes(s.id)).map(t=>t.slug),...broadTopics(tags),...(metadata.topics||[])])],stories:developments.filter(d=>d.sourceIds.includes(s.id)).map(d=>d.slug),places:metadata.places||[]})};
});
export const libraryItems=mergeLibraryItems(itemPool.filter(i=>i.curated),[]);
export const libraryForTopic=(slug:string)=>libraryItems.filter(i=>i.topics.includes(slug));
export const itemBySourceId=Object.fromEntries(itemPool.map(item=>[item.sourceId,item]));
