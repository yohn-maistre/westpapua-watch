import {DEFAULT_LAYER_IDS,layerById} from './registry';
export type WatchMapState={layers:string[];place:string|null;explore:boolean};
export function parseMapState(search:string):WatchMapState{
  const p=new URLSearchParams(search);const requested=(p.get('layers')||'').split(',').map(x=>x.trim()).filter(x=>x in layerById);
  return {layers:requested.length?requested:DEFAULT_LAYER_IDS.slice(),place:p.get('place'),explore:p.get('map')==='explore'||requested.length>0||Boolean(p.get('place'))};
}
export function writeMapState(state:WatchMapState){
  const url=new URL(location.href);if(state.explore){url.searchParams.set('map','explore');url.searchParams.set('layers',state.layers.join(','));if(state.place)url.searchParams.set('place',state.place);else url.searchParams.delete('place')}else{url.searchParams.delete('map');url.searchParams.delete('layers');url.searchParams.delete('place')}history.replaceState(null,'',url);
}
