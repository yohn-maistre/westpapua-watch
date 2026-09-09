import {DEFAULT_LAYER_IDS,baseById,layerById,viewById,type MapBaseId,type MapViewId} from './registry';
export type WatchMapState={base:MapBaseId;view:MapViewId|null;layers:string[];place:string|null;explore:boolean;period?:string|null};
export function parseMapState(search:string):WatchMapState{
  const p=new URLSearchParams(search);
  const requested=(p.get('layers')||'').split(',').map(x=>x.trim()).filter(x=>x in layerById);
  const base=(p.get('base')||'atlas') as MapBaseId;
  const view=(p.get('view')||'overview') as MapViewId;
  const validBase=baseById[base]?base:'atlas';
  const validView=viewById[view]?view:'overview';
  return {
    base:validBase,
    view:validView,
    layers:p.has('layers')?requested:viewById[validView].layers.slice(),
    place:p.get('place'),period:p.get('period'),
    explore:p.get('map')==='explore'||p.has('layers')||Boolean(p.get('place'))||validBase!=='atlas'||validView!=='overview'
  };
}
export function writeMapState(state:WatchMapState){
  const url=new URL(location.href);
  if(state.explore){
    url.searchParams.set('map','explore');
    if(state.period)url.searchParams.set('period',state.period);else url.searchParams.delete('period');
    if(state.base!=='atlas')url.searchParams.set('base',state.base);else url.searchParams.delete('base');
    if(state.view)url.searchParams.set('view',state.view);else url.searchParams.delete('view');
    url.searchParams.set('layers',state.layers.join(','));
    if(state.place)url.searchParams.set('place',state.place);else url.searchParams.delete('place');
  }else{
    for(const k of ['map','base','view','layers','place','period'])url.searchParams.delete(k);
  }
  history.replaceState(null,'',url);
}
export const defaultMapState=():WatchMapState=>({base:'atlas',view:'overview',layers:DEFAULT_LAYER_IDS.slice(),place:null,explore:false});
