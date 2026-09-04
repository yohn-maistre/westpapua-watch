import * as maplibregl from 'maplibre-gl';
import type {Map as MLMap,MapMouseEvent} from 'maplibre-gl';
import {Protocol} from 'pmtiles';
import {
  DEFAULT_LAYER_IDS,MAP_BASES,MAP_CONTEXT_BOUNDS,MAP_LAYERS,MAP_VIEWS,WEST_PAPUA_BOUNDS,WEST_PAPUA_CENTER,
  WEST_PAPUA_IMAGE_CORNERS,baseById,layerById,viewById,
  type MapBaseId,type MapLayerDefinition,type MapViewId
} from './registry';
import {defaultMapState,parseMapState,writeMapState} from './state';
import {WATCH_BASE_STYLE,WATCH_ATLAS_COLORS} from './style';

type FeatureCollection={type:'FeatureCollection';features:any[]};
let protocolReady=false;
function ensureProtocol(){if(protocolReady)return;const protocol=new Protocol();maplibregl.addProtocol('pmtiles',protocol.tile);protocolReady=true}
const emptyFC=():FeatureCollection=>({type:'FeatureCollection',features:[]});
const absolute=(path:string)=>new URL(path,location.origin).href;
const pmtilesUrl=(path:string)=>`pmtiles://${absolute(path)}`;
const pickCoord=(places:any[])=>{for(const p of places||[]){const lat=Number(p.latitude),lon=Number(p.longitude);if(Number.isFinite(lat)&&Number.isFinite(lon))return [lon,lat] as [number,number]}return null};

function lowMemoryDevice(){
  const nav=navigator as Navigator&{deviceMemory?:number;connection?:{saveData?:boolean;effectiveType?:string}};
  return Boolean((nav.deviceMemory&&nav.deviceMemory<=4)||nav.connection?.saveData||/2g/.test(nav.connection?.effectiveType||'')||innerWidth<=520);
}
function showFallback(root:HTMLElement,reason:string){
  root.classList.add('map-fallback');root.dataset.mapError=reason;
  const fallback=root.querySelector<HTMLElement>('[data-map-fallback]');if(fallback)fallback.hidden=false;
  const state=root.querySelector<HTMLElement>('[data-map-state]');if(state)state.textContent=root.dataset.locale==='pmy'?'Peta tidak tersedia':'Map unavailable';
}
function rendererFor(map:MLMap){const canvas=map.getCanvas();return canvas.getContext('webgl2')?'webgl2':canvas.getContext('webgl')?'webgl1':'unknown'}
async function jsonOr<T>(url:string,fallback:T):Promise<T>{try{const r=await fetch(url,{headers:{accept:'application/json, application/geo+json'}});return r.ok?await r.json():fallback}catch{return fallback}}

function developmentFeature(data:any,id:any){
  const c=pickCoord(data?.places);if(!c)return null;const d=data?.development||{};
  const latest=(data?.articles||[]).map((a:any)=>a.published_at).filter(Boolean).sort().at(-1)||'';
  return {type:'Feature',geometry:{type:'Point',coordinates:c},properties:{kind:'development',id:Number(id)||d.id,title:d.title_en||'Development',title_id:d.title_id||d.title_en||'',summary:d.summary_en||'',story_url:`/story/?id=${Number(id)||d.id}`,place:data?.places?.[0]?.name||'',source_count:Number(data?.articles?.length||0),latest_report_at:latest}};
}
async function currentGeoJSON(root:HTMLElement):Promise<FeatureCollection>{
  const context=root.dataset.context||'',value=root.dataset.contextValue||'';
  if(context==='development'){
    const id=value==='query:id'?new URL(location.href).searchParams.get('id'):value;if(!id||!/^\d+$/.test(id))return emptyFC();
    const d=await jsonOr<any>(`/api/development/${id}`,null);if(!d)return emptyFC();const f=developmentFeature(d,id);return f?{type:'FeatureCollection',features:[f]}:emptyFC();
  }
  if(context==='issue'&&value){
    const issue=await jsonOr<any>(`/api/issue/${encodeURIComponent(value)}`,null);if(!issue?.developments?.length)return emptyFC();
    const details=await Promise.all(issue.developments.slice(0,10).map((d:any)=>jsonOr<any>(`/api/development/${d.id}`,null)));
    return {type:'FeatureCollection',features:details.map((d:any,i:number)=>d?developmentFeature(d,issue.developments[i]?.id):null).filter(Boolean)};
  }
  const data=await jsonOr<any>('/api/current?page=1&limit=12',null),features:any[]=[];
  for(const x of data?.items||[]){const c=pickCoord(x.places);if(!c)continue;features.push({type:'Feature',geometry:{type:'Point',coordinates:c},properties:{kind:'development',id:x.id,title:x.title?.en||x.title?.id||'',title_id:x.title?.id||x.title?.en||'',summary:x.summary?.en||'',story_url:x.story_url||'',issue_slug:x.issue_slug||'',place:x.place||'',source_count:Number(x.source_count||0),latest_report_at:x.latest_report_at||''}})}
  return {type:'FeatureCollection',features};
}
async function fireGeoJSON():Promise<FeatureCollection>{const d=await jsonOr<any>('/api/fires',emptyFC());return d?.type==='FeatureCollection'?d:emptyFC()}

function baseLayerId(def:MapLayerDefinition){return `watch-${def.id}`}
function setText(node:Element|null,value:any){if(node)node.textContent=String(value??'')}
function setHidden(node:HTMLElement|null,on:boolean){if(node)node.hidden=on}
function safeDate(v:any,locale:'en'|'pmy'){if(!v)return'';const d=new Date(String(v));return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString(locale==='pmy'?'id-ID':'en-GB',{day:'numeric',month:'short',year:'numeric'})}
function numberText(v:any){const n=Number(v);return Number.isFinite(n)&&n>0?n.toLocaleString():''}

function selectedFeatureDetails(feature:any,def:MapLayerDefinition,locale:'en'|'pmy'){
  const p=feature?.properties||{};let title=locale==='pmy'?def.titleId:def.title;const rows:[string,string][]=[];let href='',profile='';const l=(en:string,id:string)=>locale==='pmy'?id:en;
  if(def.id==='mining-permits'){title=p.usaha||l('Mining permit','Izin tambang');if(p.komoditas)rows.push([l('Commodity','Komoditas'),p.komoditas]);if(p.kegiatan)rows.push([l('Permit activity','Kegiatan izin'),p.kegiatan]);if(p.luas)rows.push([l('Area','Luas'),`${numberText(p.luas)} ha`]);if(p.kab||p.prov)rows.push([l('Administrative area','Wilayah administrasi'),[p.kab,p.prov].filter(Boolean).join(', ')])}
  else if(def.id==='major-extraction-sites'){title=p.name||l('Major extraction site','Lokasi ekstraksi utama');if(p.operator)rows.push([l('Operator','Operator'),p.operator]);if(p.site)rows.push([l('Site','Lokasi'),p.site]);if(p.commodity)rows.push([l('Commodity','Komoditas'),p.commodity]);if(p.geometry_note)rows.push([l('Geometry','Geometri'),p.geometry_note])}
  else if(def.id==='forest-plantation-permits'){title=p.nama||p.grup||l('Forest / plantation permit','Izin hutan / perkebunan');if(p.jenis)rows.push([l('Type','Jenis'),p.jenis]);if(p.izin)rows.push([l('Permit','Izin'),p.izin]);if(p.luas)rows.push([l('Area','Luas'),`${numberText(p.luas)} ha`]);if(p.sk)rows.push(['SK',p.sk]);if(p.tahun)rows.push([l('Year','Tahun'),String(p.tahun)])}
  else if(def.id==='protected-areas'){title=p.nkws||l('Protected area','Kawasan konservasi');if(p.remark)rows.push([l('Zone','Zona'),p.remark]);if(p.nprov)rows.push([l('Province','Provinsi'),p.nprov]);if(p.nupt)rows.push([l('Management unit','Unit pengelola'),p.nupt])}
  else if(def.id==='cultural-regions'){title=p.region||l('Cultural/reference region','Wilayah budaya/referensi');rows.push([l('Type','Jenis'),l('Generalized cultural/reference region','Wilayah budaya/referensi tergeneralisasi')]);if(p.member_regencies)rows.push([l('Regencies','Kabupaten'),String(p.member_regencies).replace(/\|/g,' · ')]);rows.push([l('Boundary','Batas'),l('Not a customary or cadastral boundary','Bukan batas adat atau kadaster')])}
  else if(def.id==='province-boundaries'){title=p.provinsi||p.wadmpr||l('Province','Provinsi');if(p.capital)rows.push([l('Capital','Ibu kota'),p.capital]);if(p.admin_units)rows.push([l('Regencies / cities','Kabupaten / kota'),String(p.admin_units)]);if(p.peoples_languages)rows.push([l('Peoples & languages','Masyarakat & bahasa'),p.peoples_languages]);if(p.reference_sources)rows.push([l('Reference sources','Sumber rujukan'),p.reference_sources]);if(p.context_note)rows.push([l('Context','Konteks'),p.context_note]);if(p.reference_regions)rows.push([l('Reference regions','Wilayah referensi'),String(p.reference_regions).replace(/\|/g,' · ')]);if(p.bps_url)profile=p.bps_url}
  else if(def.id==='fire-hotspots'){title=l('Fire hotspot','Titik panas');if(p.acq_date)rows.push([l('Observed','Diamati'),`${p.acq_date}${p.acq_time?` ${p.acq_time} UTC`:''}`]);if(p.frp)rows.push(['FRP',`${p.frp} MW`]);if(p.confidence)rows.push([l('Confidence','Kepercayaan'),String(p.confidence)])}
  else if(def.id==='airports'){title=p.name||p.namobj||title;if(p.city)rows.push([l('City','Kota'),p.city]);if(p.iata)rows.push(['IATA',p.iata]);if(p.icao)rows.push(['ICAO',p.icao]);if(p.class)rows.push([l('Class','Kelas'),p.class])}
  else if(def.id==='ports'){title=p.name||p.namobj||title;if(p.type)rows.push([l('Type','Jenis'),p.type]);if(p.function)rows.push([l('Function','Fungsi'),p.function]);if(p.class)rows.push([l('Class','Kelas'),p.class])}
  else if(def.id==='settlements'){title=p.name||p.namobj||title;if(p.kind)rows.push([l('Type','Jenis'),p.kind]);if(p.regency||p.province)rows.push([l('Administrative area','Wilayah administrasi'),[p.regency,p.province].filter(Boolean).join(', ')])}
  else if(def.id==='current-developments'){title=(locale==='pmy'?(p.title_id||p.title):p.title)||l('Development','Perkembangan');if(p.place)rows.push([l('Place','Tempat'),p.place]);if(p.source_count)rows.push([l('Sources','Sumber'),String(p.source_count)]);if(p.latest_report_at)rows.push([l('Published','Terbit'),safeDate(p.latest_report_at,locale)]);href=p.story_url||'';if(href&&locale==='pmy'&&!href.startsWith('/pmy/'))href=`/pmy${href}`}
  return {title,rows,href,profile};
}
function populateFeaturePanel(root:HTMLElement,feature:any,def:MapLayerDefinition,locale:'en'|'pmy'){
  const panel=root.querySelector<HTMLElement>('[data-map-feature]');if(!panel)return;panel.hidden=false;const details=selectedFeatureDetails(feature,def,locale);
  setText(panel.querySelector('[data-map-feature-kicker]'),locale==='pmy'?def.titleId:def.title);setText(panel.querySelector('[data-map-feature-title]'),details.title);
  const rows=panel.querySelector<HTMLElement>('[data-map-feature-rows]');if(rows){rows.replaceChildren();for(const [key,val] of details.rows.slice(0,8)){const row=document.createElement('div'),k=document.createElement('span'),v=document.createElement('strong');k.textContent=key;v.textContent=val;row.append(k,v);rows.append(row)}}
  const source=panel.querySelector<HTMLAnchorElement>('[data-map-feature-source]');if(source){source.href=def.sourceUrl;source.textContent=`${locale==='pmy'?'Sumber':'Source'}: ${def.attribution} ↗`}
  const related=panel.querySelector<HTMLAnchorElement>('[data-map-feature-related]');if(related){if(details.href){related.hidden=false;related.href=details.href;related.textContent=locale==='pmy'?'Buka perkembangan →':'Open development →'}else{related.hidden=true;related.removeAttribute('href');related.textContent=''}}
  const profile=panel.querySelector<HTMLAnchorElement>('[data-map-feature-profile]');if(profile){if(details.profile){profile.hidden=false;profile.href=details.profile;profile.target='_blank';profile.rel='noreferrer';profile.textContent=locale==='pmy'?'Profil/sumber provinsi ↗':'Province profile/source ↗'}else{profile.hidden=true;profile.removeAttribute('href');profile.textContent=''}}
}

function sourceSpec(def:MapLayerDefinition,data?:FeatureCollection):any{
  if(def.sourceType==='pmtiles')return {type:'vector',url:pmtilesUrl(def.source),attribution:def.attribution};
  if(def.sourceType==='live')return {type:'geojson',data:data||emptyFC(),cluster:false,attribution:def.attribution};
  if(def.sourceType==='raster')return {type:'raster',tiles:def.tiles||[def.source],tileSize:256,attribution:def.attribution,maxzoom:def.maxZoom};
  if(def.sourceType==='image')return {type:'image',url:def.source,coordinates:WEST_PAPUA_IMAGE_CORNERS,attribution:def.attribution};
  return null;
}
function createMapLayer(def:MapLayerDefinition):any{
  const common={id:baseLayerId(def),source:`watch-source-${def.id}`,...(def.sourceLayer?{'source-layer':def.sourceLayer}:{}),minzoom:def.minZoom,maxzoom:def.maxZoom,layout:{visibility:'none'}};
  if(def.geometry==='image'||def.geometry==='raster')return {...common,type:'raster',paint:def.style};
  return {...common,type:def.geometry,paint:def.style};
}
function interactiveVisualLayers(def:MapLayerDefinition):string[]{if(def.geometry==='image'||def.geometry==='raster')return[];return [baseLayerId(def)]}

async function initOne(root:HTMLElement){
  ensureProtocol();const locale:'en'|'pmy'=root.dataset.locale==='pmy'?'pmy':'en';const canvas=root.querySelector<HTMLElement>('[data-map-canvas]');if(!canvas)return;
  const lowMemory=lowMemoryDevice();root.dataset.mapLowMemory=lowMemory?'true':'false';
  const status=await jsonOr<any>('/api/geo-status',{layers:{}});
  const state=parseMapState(location.search),context=root.dataset.context||'';let current=emptyFC();try{current=await currentGeoJSON(root)}catch{}
  if(context==='development'&&current.features.length===0){root.hidden=true;return}
  const requested=(root.dataset.initialView||state.view||'overview') as MapViewId,initialView=viewById[requested]?requested:'overview';
  let enabled=new Set<string>(state.explore&&!context&&state.layers.length?state.layers:viewById[initialView].layers),activeView:MapViewId|null=initialView,activeBase:MapBaseId=state.base||'atlas';

  const map=new maplibregl.Map({
    container:canvas,style:WATCH_BASE_STYLE as any,center:WEST_PAPUA_CENTER,zoom:context?5.1:3.85,minZoom:2.7,maxZoom:14,maxBounds:MAP_CONTEXT_BOUNDS,
    attributionControl:false,dragRotate:false,pitchWithRotate:false,renderWorldCopies:false,fadeDuration:lowMemory?0:120,cooperativeGestures:true,
    pixelRatio:lowMemory?1:Math.min(window.devicePixelRatio||1,1.5),maxTileCacheSize:lowMemory?36:56,maxTileCacheZoomLevels:lowMemory?2:3
  });
  root.dataset.mapRenderer=rendererFor(map);console.info('[Watch map] renderer',root.dataset.mapRenderer,'lowMemory',lowMemory);
  map.addControl(new maplibregl.NavigationControl({showCompass:false,visualizePitch:false}),'bottom-right');
  let contextLossTimer=0;map.getCanvas().addEventListener('webglcontextlost',()=>{root.dataset.mapRenderer='context-lost';clearTimeout(contextLossTimer);contextLossTimer=window.setTimeout(()=>showFallback(root,'webgl-context-lost'),2400)});
  map.getCanvas().addEventListener('webglcontextrestored',()=>{clearTimeout(contextLossTimer);root.classList.remove('map-fallback');const fb=root.querySelector<HTMLElement>('[data-map-fallback]');if(fb)fb.hidden=true;root.dataset.mapRenderer=rendererFor(map)});
  map.on('error',(event:any)=>console.warn('[Watch map]',event?.error||event));
  const unavailable=new Set<string>(),interactive=new Map<string,string>(),baseLayers=new Map<MapBaseId,string>();
  let silhouetteAvailable=false;

  function available(def:MapLayerDefinition){
    if(def.availability==='always'||def.sourceType==='raster')return true;
    if(def.sourceType==='live')return def.id==='fire-hotspots'?status?.layers?.[def.id]?.available===true:true;
    return status?.layers?.[def.id]?.available===true;
  }
  async function addAtlasPlate(){
    const contextLand=await jsonOr<FeatureCollection>('/data/context-land.geojson',emptyFC()),silhouette=await jsonOr<FeatureCollection>('/data/west-papua-silhouette.geojson',emptyFC());
    if(contextLand.features.length){map.addSource('watch-context-land-source',{type:'geojson',data:contextLand});map.addLayer({id:'watch-context-land',type:'fill',source:'watch-context-land-source',paint:{'fill-color':'#eff0f5','fill-opacity':.92}});baseLayers.set('atlas','watch-context-land')}
    if(silhouette.features.length){silhouetteAvailable=true;map.addSource('watch-silhouette-source',{type:'geojson',data:silhouette});map.addLayer({id:'watch-west-papua-land',type:'fill',source:'watch-silhouette-source',paint:{'fill-color':WATCH_ATLAS_COLORS.land,'fill-opacity':1}})}
    if(status?.layers?.hillshade?.available){try{map.addSource('watch-hillshade-source',{type:'image',url:'/raster/hillshade.png',coordinates:WEST_PAPUA_IMAGE_CORNERS});map.addLayer({id:'watch-hillshade',type:'raster',source:'watch-hillshade-source',paint:{'raster-opacity':.18,'raster-contrast':.08}})}catch(e){console.warn('[Watch map] hillshade unavailable',e)}}
  }
  function ensureBaseRaster(id:Exclude<MapBaseId,'atlas'>){
    if(baseLayers.has(id))return baseLayers.get(id)!;const def=baseById[id];if(!def?.tiles?.length)return'';
    const source=`watch-base-${id}-source`,layer=`watch-base-${id}`;map.addSource(source,{type:'raster',tiles:def.tiles,tileSize:256,maxzoom:def.maxZoom||14,attribution:def.attribution});map.addLayer({id:layer,type:'raster',source,paint:{'raster-opacity':1}},map.getLayer('watch-context-land')?'watch-context-land':undefined);baseLayers.set(id,layer);return layer
  }
  function applyBase(id:MapBaseId){
    activeBase=baseById[id]?id:'atlas';
    for(const x of ['watch-context-land','watch-west-papua-land','watch-hillshade'])if(map.getLayer(x))map.setLayoutProperty(x,'visibility',activeBase==='atlas'?'visible':'none');
    for(const b of ['satellite','night'] as const){let layer=baseLayers.get(b);if(activeBase===b&&!layer)layer=ensureBaseRaster(b);if(layer&&map.getLayer(layer))map.setLayoutProperty(layer,'visibility',activeBase===b?'visible':'none')}
    const photographic=activeBase!=='atlas',text=photographic?'#f7f6fb':'#626570',halo=photographic?'rgba(10,11,16,.82)':'#f6f5fa';
    for(const layer of ['watch-province-labels','watch-settlement-labels','watch-cultural-regions-label'])if(map.getLayer(layer)){map.setPaintProperty(layer,'text-color',text);map.setPaintProperty(layer,'text-halo-color',halo);map.setPaintProperty(layer,'text-halo-width',photographic?1.6:1.1)}
    if(map.getLayer('watch-province-boundaries'))map.setPaintProperty('watch-province-boundaries','line-color',photographic?'#f0eef7':'#555864');
    if(map.getLayer('watch-cultural-regions-line'))map.setPaintProperty('watch-cultural-regions-line','line-color',photographic?'#d4cff1':'#77799f');
    root.querySelectorAll<HTMLButtonElement>('[data-map-base]').forEach(b=>b.classList.toggle('active',b.dataset.mapBase===activeBase));
    updateCredit();write();
  }
  function updateCredit(){const node=root.querySelector<HTMLElement>('[data-map-credit]'),def=baseById[activeBase];if(!node)return;node.textContent=[def.attribution,'BIG · Bappenas · ESDM · NASA FIRMS',locale==='pmy'?'sumber: metadata lapisan':'source: layer metadata'].filter(Boolean).join(' · ')}

  const registered=new Set<string>();
  async function registerLayer(def:MapLayerDefinition){
    if(registered.has(def.id))return true;
    if(!available(def)){unavailable.add(def.id);return false}
    let data:FeatureCollection|undefined;
    if(def.id==='current-developments')data=current;
    else if(def.id==='fire-hotspots')data=await fireGeoJSON();
    else if(def.id==='major-extraction-sites')data=await jsonOr<FeatureCollection>('/data/major-extraction-sites.geojson',emptyFC());
    try{
      map.addSource(`watch-source-${def.id}`,sourceSpec(def,data));
      if(def.id==='province-boundaries'){
        if(!silhouetteAvailable)map.addLayer({id:'watch-west-papua-land-fallback',type:'fill',source:`watch-source-${def.id}`,'source-layer':def.sourceLayer,paint:{'fill-color':WATCH_ATLAS_COLORS.land,'fill-opacity':1}});
        map.addLayer(createMapLayer(def));
        map.addLayer({id:'watch-province-hit',type:'fill',source:`watch-source-${def.id}`,'source-layer':def.sourceLayer,paint:{'fill-color':'#000','fill-opacity':.001},layout:{visibility:'none'}});
        map.addLayer({id:'watch-province-labels',type:'symbol',source:`watch-source-${def.id}`,'source-layer':def.sourceLayer,minzoom:3.3,maxzoom:10,layout:{visibility:'none','text-field':['get','provinsi'],'text-size':['interpolate',['linear'],['zoom'],3.3,9,7,12],'text-font':['Noto Sans Regular'],'text-allow-overlap':false},paint:{'text-color':'#626570','text-halo-color':'#f6f5fa','text-halo-width':1.2}});
        interactive.set('watch-province-hit',def.id);
      }else if(def.id==='cultural-regions'){
        map.addLayer(createMapLayer(def));
        map.addLayer({id:'watch-cultural-regions-line',type:'line',source:`watch-source-${def.id}`,'source-layer':def.sourceLayer,minzoom:def.minZoom,maxzoom:def.maxZoom,layout:{visibility:'none'},paint:{'line-color':'#77799f','line-width':['interpolate',['linear'],['zoom'],3,1,8,1.55],'line-dasharray':[2.5,2.5],'line-opacity':.78}});
        map.addLayer({id:'watch-cultural-regions-label',type:'symbol',source:`watch-source-${def.id}`,'source-layer':def.sourceLayer,minzoom:3.5,maxzoom:9,layout:{visibility:'none','text-field':['get','region'],'text-size':['interpolate',['linear'],['zoom'],3.5,9,7,11],'text-letter-spacing':.08,'text-font':['Noto Sans Regular'],'text-allow-overlap':false},paint:{'text-color':'#77799f','text-halo-color':'#f6f5fa','text-halo-width':1}});
        interactive.set(baseLayerId(def),def.id);
      }else if(def.id==='settlements'){
        map.addLayer(createMapLayer(def));map.addLayer({id:'watch-settlement-labels',type:'symbol',source:`watch-source-${def.id}`,'source-layer':def.sourceLayer,minzoom:3.6,maxzoom:14,layout:{visibility:'none','text-field':['coalesce',['get','name'],['get','namobj']],'text-size':['interpolate',['linear'],['zoom'],3.6,9,9,12],'text-offset':[0,.8],'text-anchor':'top','text-font':['Noto Sans Regular'],'text-allow-overlap':false},paint:{'text-color':'#545762','text-halo-color':'#f6f5fa','text-halo-width':1}});interactive.set(baseLayerId(def),def.id)
      }else{map.addLayer(createMapLayer(def));for(const id of interactiveVisualLayers(def))interactive.set(id,def.id)}
      registered.add(def.id);setLayerVisibility(def.id,enabled.has(def.id));return true
    }catch(error){unavailable.add(def.id);console.warn(`[Watch map] failed to register ${def.id}`,error);return false}
  }
  map.on('load',async()=>{
    await addAtlasPlate();
    for(const def of MAP_LAYERS){
      const expensive=def.sourceType==='image'||def.sourceType==='raster';
      if(expensive&&!enabled.has(def.id))continue;
      await registerLayer(def);
    }
    applyBase(activeBase);syncControls();
    if(context&&current.features.length)fitFeatures(current);else if(state.place&&!context)await focusPlace(state.place);
    else if(!context)map.fitBounds(WEST_PAPUA_BOUNDS,{padding:innerWidth<=520?24:42,duration:0});
    if(new URL(location.href).searchParams.get('mapDebug')==='1'){(map as any).showTileBoundaries=true;const d=root.querySelector<HTMLElement>('[data-map-debug]');if(d){d.hidden=false;d.textContent=`${root.dataset.mapRenderer} · lowMemory ${lowMemory} · unavailable ${[...unavailable].join(', ')||'none'}`}}
  });

  function setLayerVisibility(id:string,visible:boolean){
    const def=layerById[id];if(!def)return;const ids=[baseLayerId(def)];
    if(id==='province-boundaries')ids.push('watch-province-hit','watch-province-labels');
    if(id==='cultural-regions')ids.push('watch-cultural-regions-line','watch-cultural-regions-label');
    if(id==='settlements')ids.push('watch-settlement-labels');
    for(const layer of ids)if(map.getLayer(layer))map.setLayoutProperty(layer,'visibility',visible?'visible':'none');
  }
  function activeInteractiveIds(){return [...interactive.keys()].filter(id=>map.getLayer(id)&&map.getLayoutProperty(id,'visibility')!=='none')}
  map.on('click',(e:MapMouseEvent)=>{const ids=activeInteractiveIds();if(!ids.length)return;const fs=map.queryRenderedFeatures(e.point,{layers:ids});const f=fs[0];if(!f)return;const def=layerById[interactive.get(f.layer.id)||''];if(def)populateFeaturePanel(root,f,def,locale)});
  map.on('mousemove',(e:MapMouseEvent)=>{const ids=activeInteractiveIds();map.getCanvas().style.cursor=ids.length&&map.queryRenderedFeatures(e.point,{layers:ids}).length?'pointer':''});

  function fitFeatures(fc:FeatureCollection){const points=fc.features.map(f=>f.geometry?.type==='Point'?f.geometry.coordinates:null).filter(Boolean) as number[][];if(!points.length)return;if(points.length===1){map.easeTo({center:points[0] as [number,number],zoom:7,duration:550});return}const b=new maplibregl.LngLatBounds(points[0] as [number,number],points[0] as [number,number]);points.slice(1).forEach(p=>b.extend(p as [number,number]));map.fitBounds(b,{padding:60,maxZoom:8,duration:550})}
  async function focusPlace(slug:string){const r=await jsonOr<any>(`/api/places?q=${encodeURIComponent(slug.replaceAll('-',' '))}`,null),rows=r?.items||r||[],p=rows.find((x:any)=>x.slug===slug)||rows[0],lat=Number(p?.latitude),lon=Number(p?.longitude);if(Number.isFinite(lat)&&Number.isFinite(lon))map.easeTo({center:[lon,lat],zoom:7,duration:600})}

  function matchingView(set:Set<string>):MapViewId|null{for(const v of MAP_VIEWS)if(set.size===v.layers.length&&v.layers.every(x=>set.has(x)))return v.id;return null}
  function syncControls(){
    activeView=matchingView(enabled);
    root.querySelectorAll<HTMLButtonElement>('[data-map-view]').forEach(button=>button.classList.toggle('active',button.dataset.mapView===activeView));
    root.querySelectorAll<HTMLButtonElement>('[data-map-base]').forEach(button=>button.classList.toggle('active',button.dataset.mapBase===activeBase));
    root.querySelectorAll<HTMLButtonElement>('[data-map-layer]').forEach(button=>{const id=button.dataset.mapLayer||'',off=unavailable.has(id);button.disabled=off;button.classList.toggle('active',enabled.has(id)&&!off);button.dataset.availability=off?'unavailable':'available';const note=button.querySelector<HTMLElement>('small');if(note&&off)note.textContent=locale==='pmy'?'Data tidak tersedia':'Data unavailable'});
    setText(root.querySelector('[data-map-state]'),activeView?(locale==='pmy'?viewById[activeView].titleId:viewById[activeView].title):(locale==='pmy'?'Kustom':'Custom'));
  }
  async function applyVisibility(){for(const d of MAP_LAYERS)if(enabled.has(d.id)&&!registered.has(d.id))await registerLayer(d);for(const d of MAP_LAYERS)setLayerVisibility(d.id,enabled.has(d.id));syncControls()}
  function write(){if(!context)writeMapState({base:activeBase,view:activeView,layers:[...enabled],place:null,explore:true})}
  async function applyView(id:MapViewId){const view=viewById[id];if(!view)return;enabled=new Set(view.layers);await applyVisibility();root.dataset.explore='true';write()}
  async function commitCustom(){await applyVisibility();root.dataset.explore='true';write()}
  root.querySelectorAll<HTMLButtonElement>('[data-map-base]').forEach(button=>button.addEventListener('click',()=>applyBase(button.dataset.mapBase as MapBaseId)));
  root.querySelectorAll<HTMLButtonElement>('[data-map-view]').forEach(button=>button.addEventListener('click',()=>{void applyView(button.dataset.mapView as MapViewId)}));
  root.querySelectorAll<HTMLButtonElement>('[data-map-layer]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.mapLayer||'';if(!id||unavailable.has(id))return;enabled.has(id)?enabled.delete(id):enabled.add(id);void commitCustom()}));

  const panel=root.querySelector<HTMLElement>('[data-map-layers-panel]'),backdrop=root.querySelector<HTMLButtonElement>('[data-map-panel-backdrop]');
  function panelOpen(on:boolean){if(panel)panel.hidden=!on;if(backdrop)backdrop.hidden=!on;const largeSheet=on&&root.classList.contains('map-expanded')&&innerWidth<=760;document.body.classList.toggle('map-sheet-open',largeSheet)}
  root.querySelectorAll<HTMLButtonElement>('[data-map-layers-open]').forEach(b=>b.addEventListener('click',()=>panelOpen(Boolean(panel?.hidden))));
  root.querySelectorAll<HTMLButtonElement>('[data-map-layers-close]').forEach(b=>b.addEventListener('click',()=>panelOpen(false)));backdrop?.addEventListener('click',()=>panelOpen(false));
  root.querySelectorAll<HTMLButtonElement>('[data-map-feature-close]').forEach(b=>b.addEventListener('click',()=>{const p=root.querySelector<HTMLElement>('[data-map-feature]');if(p)p.hidden=true}));

  const search=root.querySelector<HTMLInputElement>('[data-map-place-search]'),results=root.querySelector<HTMLElement>('[data-map-place-results]');let timer=0;
  search?.addEventListener('input',()=>{clearTimeout(timer);timer=window.setTimeout(async()=>{const q=search.value.trim();if(q.length<2){results?.replaceChildren();return}const data=await jsonOr<any>(`/api/places?q=${encodeURIComponent(q)}`,null),rows=data?.items||data||[];if(!results)return;results.replaceChildren();for(const p of rows.slice(0,8)){const lat=Number(p.latitude),lon=Number(p.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;const b=document.createElement('button');b.type='button';b.textContent=p.name;b.addEventListener('click',()=>{map.easeTo({center:[lon,lat],zoom:7,duration:550});root.dataset.explore='true';setText(root.querySelector('[data-map-state]'),p.name);if(!context)writeMapState({base:activeBase,view:activeView,layers:[...enabled],place:p.slug,explore:true});results.replaceChildren();search.value=p.name;panelOpen(false)});results.append(b)}},220)});

  function expand(on:boolean){root.classList.toggle('map-expanded',on);document.body.classList.toggle('no-scroll',on);panelOpen(false);root.querySelectorAll<HTMLButtonElement>('[data-map-expand]').forEach(b=>b.hidden=on);root.querySelectorAll<HTMLButtonElement>('[data-map-close-expanded]').forEach(b=>b.hidden=!on);const cooperative=(map as any).cooperativeGestures;if(cooperative){on?cooperative.disable():cooperative.enable()}setTimeout(()=>map.resize(),80)}
  root.querySelectorAll<HTMLButtonElement>('[data-map-expand]').forEach(b=>b.addEventListener('click',()=>expand(true)));root.querySelectorAll<HTMLButtonElement>('[data-map-close-expanded]').forEach(b=>b.addEventListener('click',()=>expand(false)));
  root.querySelectorAll<HTMLButtonElement>('[data-map-return]').forEach(b=>b.addEventListener('click',()=>{const d=defaultMapState();activeBase=d.base;enabled=new Set(DEFAULT_LAYER_IDS);void applyVisibility();applyBase('atlas');root.dataset.explore='false';if(!context)writeMapState(d);map.fitBounds(WEST_PAPUA_BOUNDS,{padding:40,duration:550});panelOpen(false)}));
  document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(panel&&!panel.hidden){panelOpen(false);return}const f=root.querySelector<HTMLElement>('[data-map-feature]');if(f&&!f.hidden){f.hidden=true;return}if(root.classList.contains('map-expanded'))expand(false)});
}
export function initWatchMaps(){document.querySelectorAll<HTMLElement>('[data-watch-map]').forEach(root=>{if(root.dataset.mapInitialized==='true')return;root.dataset.mapInitialized='true';initOne(root).catch(err=>{console.warn('Watch map unavailable',err);showFallback(root,err instanceof Error?err.name:'initialization-failed')})})}
