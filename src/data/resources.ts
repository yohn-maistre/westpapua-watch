import {libraryItems} from './library';
// Compatibility adapter for older consumers; metadata is owned by the shared pool.
export const resources=libraryItems.map(item=>({...item,type:item.itemType,language:item.languages[0]}));
