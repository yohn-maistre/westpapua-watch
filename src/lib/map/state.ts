import {DEFAULT_LAYER_IDS,baseById,layerById,viewById,type MapBaseId,type MapViewId} from './registry';
export type WatchMapState={base:MapBaseId;view:MapViewId|null;layers:string[];place:string|null;explore:boolean};
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
    layers:requested.length?requested:viewById[validView].layers.slice(),
    place:p.get('place'),
    explore:p.get('map')==='explore'||requested.length>0||Boolean(p.get('place'))||validBase!=='atlas'||validView!=='overview'
  };
}
export function writeMapState(state:WatchMapState){
  const url=new URL(location.href);
  if(state.explore){
    url.searchParams.set('map','explore');
    if(state.base!=='atlas')url.searchParams.set('base',state.base);else url.searchParams.delete('base');
    if(state.view)url.searchParams.set('view',state.view);else url.searchParams.delete('view');
    url.searchParams.set('layers',state.layers.join(','));
    if(state.place)url.searchParams.set('place',state.place);else url.searchParams.delete('place');
  }else{
    for(const k of ['map','base','view','layers','place'])url.searchParams.delete(k);
  }
  history.replaceState(null,'',url);
}
export const defaultMapState=():WatchMapState=>({base:'atlas',view:'overview',layers:DEFAULT_LAYER_IDS.slice(),place:null,explore:false});
