import maplibregl,{type Map as MLMap,type MapMouseEvent} from 'maplibre-gl';
import {Protocol} from 'pmtiles';
import {DEFAULT_LAYER_IDS,MAP_LAYERS,WEST_PAPUA_BOUNDS,WEST_PAPUA_CENTER,layerById,type MapLayerDefinition} from './registry';
import {parseMapState,writeMapState} from './state';
import {WATCH_BASE_STYLE} from './style';

type FeatureCollection={type:'FeatureCollection';features:any[]};
let protocolReady=false;
function ensureProtocol(){if(protocolReady)return;const protocol=new Protocol();maplibregl.addProtocol('pmtiles',protocol.tile);protocolReady=true}
const emptyFC=():FeatureCollection=>({type:'FeatureCollection',features:[]});
const absolute=(path:string)=>new URL(path,location.origin).href;
const pmtilesUrl=(path:string)=>`pmtiles://${absolute(path)}`;
const pickCoord=(places:any[])=>{for(const p of places||[]){const lat=Number(p.latitude),lon=Number(p.longitude);if(Number.isFinite(lat)&&Number.isFinite(lon))return [lon,lat] as [number,number]}return null};

function developmentFeature(data:any,id:any){const c=pickCoord(data?.places);if(!c)return null;const d=data?.development||{};return {type:'Feature',geometry:{type:'Point',coordinates:c},properties:{kind:'development',id:Number(id)||d.id,title:d.title_en||'Development',title_id:d.title_id||d.title_en||'',summary:d.summary_en||'',story_url:`/story/?id=${Number(id)||d.id}`,place:data?.places?.[0]?.name||'',source_count:Number(data?.articles?.length||0),updated_at:d.updated_at||''}}}

async function currentGeoJSON(root:HTMLElement):Promise<FeatureCollection>{
  const context=root.dataset.context||'';const value=root.dataset.contextValue||'';
  if(context==='development'){
    const id=value==='query:id'?new URL(location.href).searchParams.get('id'):value;if(!id||!/^\d+$/.test(id))return emptyFC();
    const d=await fetch(`/api/development/${id}`,{headers:{accept:'application/json'}}).then(r=>r.ok?r.json():null);if(!d)return emptyFC();const feature=developmentFeature(d,id);return feature?{type:'FeatureCollection',features:[feature]}:emptyFC();
  }
  if(context==='issue'&&value){
    const issue=await fetch(`/api/issue/${encodeURIComponent(value)}`,{headers:{accept:'application/json'}}).then(r=>r.ok?r.json():null);if(!issue?.developments?.length)return emptyFC();
    const details=await Promise.all(issue.developments.slice(0,8).map((d:any)=>fetch(`/api/development/${d.id}`,{headers:{accept:'application/json'}}).then(r=>r.ok?r.json():null).catch(()=>null)));
    return {type:'FeatureCollection',features:details.map((d:any,i:number)=>d?developmentFeature(d,issue.developments[i]?.id):null).filter(Boolean)};
  }
  const data=await fetch('/api/current',{headers:{accept:'application/json'}}).then(r=>r.ok?r.json():null);const features=[];
  for(const x of data?.items||[]){const c=pickCoord(x.places);if(!c)continue;features.push({type:'Feature',geometry:{type:'Point',coordinates:c},properties:{kind:'development',id:x.id,title:x.title?.en||x.title?.id||'',title_id:x.title?.id||x.title?.en||'',summary:x.summary?.en||'',story_url:x.story_url||'',issue_slug:x.issue_slug||'',place:x.place||'',source_count:Number(x.source_count||0),updated_at:x.updated_at||''}})}
  return {type:'FeatureCollection',features};
}

async function fireGeoJSON():Promise<FeatureCollection>{try{const r=await fetch('/api/fires',{headers:{accept:'application/geo+json'}});if(!r.ok)return emptyFC();const d=await r.json();return d?.type==='FeatureCollection'?d:emptyFC()}catch{return emptyFC()}}

function baseLayerId(def:MapLayerDefinition){return `watch-${def.id}`}
function createMapLayer(def:MapLayerDefinition):any{return {id:baseLayerId(def),type:def.geometry,source:`watch-source-${def.id}`,...(def.sourceLayer?{'source-layer':def.sourceLayer}:{}),minzoom:def.minZoom,maxzoom:def.maxZoom,layout:{visibility:'none'},paint:def.style}}
function sourceSpec(def:MapLayerDefinition,data?:FeatureCollection):any{if(def.sourceType==='pmtiles')return {type:'vector',url:pmtilesUrl(def.source),attribution:def.attribution};return {type:'geojson',data:data||emptyFC(),cluster:false,attribution:def.attribution}}
function setText(node:Element|null,value:any){if(node)node.textContent=String(value??'')}

function selectedFeatureDetails(feature:any,def:MapLayerDefinition,locale:'en'|'pmy'){
  const p=feature?.properties||{};let title=locale==='pmy'?def.titleId:def.title;const rows:[string,string][]=[];let href='';const l=(en:string,id:string)=>locale==='pmy'?id:en;
  if(def.id==='mining-permits'){title=p.usaha||l('Mining permit','Izin tambang');if(p.komoditas)rows.push([l('Commodity','Komoditas'),p.komoditas]);if(p.kegiatan)rows.push([l('Permit activity','Kegiatan izin'),p.kegiatan]);if(p.luas)rows.push([l('Area','Luas'),`${Number(p.luas).toLocaleString()} ha`]);if(p.kab||p.prov)rows.push([l('Administrative area','Wilayah administrasi'),[p.kab,p.prov].filter(Boolean).join(', ')])}
  else if(def.id==='forest-plantation-permits'){title=p.nama||p.grup||l('Forest / plantation permit','Izin hutan / perkebunan');if(p.jenis)rows.push([l('Type','Jenis'),p.jenis]);if(p.izin)rows.push([l('Permit','Izin'),p.izin]);if(p.luas)rows.push([l('Area','Luas'),`${Number(p.luas).toLocaleString()} ha`]);if(p.sk)rows.push(['SK',p.sk]);if(p.tahun)rows.push([l('Year','Tahun'),String(p.tahun)])}
  else if(def.id==='protected-areas'){title=p.nkws||l('Protected area','Kawasan konservasi');if(p.remark)rows.push([l('Zone','Zona'),p.remark]);if(p.nprov)rows.push([l('Province','Provinsi'),p.nprov]);if(p.nupt)rows.push([l('Management unit','Unit pengelola'),p.nupt])}
  else if(def.id==='cultural-regions'){title=p.region||l('Cultural region','Wilayah budaya');rows.push([l('Geometry','Geometri'),l('Generalized reference region','Wilayah referensi tergeneralisasi')]);rows.push([l('Boundary note','Catatan batas'),l('Derived from regency membership; not a customary-land boundary.','Diturunkan dari keanggotaan kabupaten; bukan batas tanah adat.')])}
  else if(def.id==='province-boundaries'){title=p.provinsi||p.wadmpr||l('Province','Provinsi');rows.push([l('Type','Jenis'),l('Administrative province','Provinsi administratif')])}
  else if(def.id==='fire-hotspots'){title=l('Fire hotspot','Titik panas');if(p.acq_date)rows.push([l('Observed','Diamati'),`${p.acq_date}${p.acq_time?` ${p.acq_time} UTC`:''}`]);if(p.frp)rows.push(['FRP',`${p.frp} MW`]);if(p.confidence)rows.push([l('Confidence','Kepercayaan'),String(p.confidence)]);rows.push([l('Caveat','Catatan'),l('Satellite thermal anomaly; not automatically a confirmed wildfire.','Anomali termal satelit; tidak otomatis berarti kebakaran terkonfirmasi.')])}
  else if(def.id==='current-developments'){title=(locale==='pmy'?(p.title_id||p.title):p.title)||l('Development','Perkembangan');if(p.place)rows.push([l('Place','Tempat'),p.place]);if(p.source_count)rows.push([l('Sources','Sumber'),String(p.source_count)]);if(p.updated_at)rows.push([l('Updated','Diperbarui'),new Date(p.updated_at).toLocaleDateString(locale==='pmy'?'id-ID':'en-GB')]);href=p.story_url||'';if(href&&locale==='pmy'&&!href.startsWith('/pmy/'))href=`/pmy${href}`}
  return {title,rows,href};
}

function populateFeaturePanel(root:HTMLElement,feature:any,def:MapLayerDefinition,locale:'en'|'pmy'){
  const panel=root.querySelector<HTMLElement>('[data-map-feature]');if(!panel)return;panel.hidden=false;const details=selectedFeatureDetails(feature,def,locale);setText(panel.querySelector('[data-map-feature-kicker]'),locale==='pmy'?def.titleId:def.title);setText(panel.querySelector('[data-map-feature-title]'),details.title);
  const rows=panel.querySelector<HTMLElement>('[data-map-feature-rows]');if(rows){rows.replaceChildren();for(const [key,val] of details.rows){const row=document.createElement('div'),k=document.createElement('span'),v=document.createElement('strong');k.textContent=key;v.textContent=val;row.append(k,v);rows.append(row)}}
  const source=panel.querySelector<HTMLAnchorElement>('[data-map-feature-source]');if(source){source.href=def.sourceUrl;source.textContent=`${locale==='pmy'?'Sumber':'Source'}: ${def.attribution} ↗`}
  const related=panel.querySelector<HTMLAnchorElement>('[data-map-feature-related]');if(related){related.hidden=!details.href;if(details.href){related.href=details.href;related.textContent=locale==='pmy'?'Buka perkembangan →':'Open development →'}}
}

function activeLayerIds(map:MLMap){return MAP_LAYERS.filter(d=>map.getLayer(baseLayerId(d))&&map.getLayoutProperty(baseLayerId(d),'visibility')!=='none').map(baseLayerId)}
function setLayerVisibility(map:MLMap,id:string,visible:boolean){const def=layerById[id];if(!def)return;const layer=baseLayerId(def);if(map.getLayer(layer))map.setLayoutProperty(layer,'visibility',visible?'visible':'none')}

async function initOne(root:HTMLElement){
  ensureProtocol();const locale: 'en'|'pmy'=root.dataset.locale==='pmy'?'pmy':'en';const canvas=root.querySelector<HTMLElement>('[data-map-canvas]');if(!canvas)return;
  const status=await fetch('/api/geo-status',{headers:{accept:'application/json'}}).then(r=>r.ok?r.json():{layers:{}}).catch(()=>({layers:{}}));
  const state=parseMapState(location.search);const context=Boolean(root.dataset.context);let current=emptyFC();try{current=await currentGeoJSON(root)}catch{}
  if(context&&current.features.length===0){root.hidden=true;return}
  const map=new maplibregl.Map({container:canvas,style:WATCH_BASE_STYLE,center:WEST_PAPUA_CENTER,zoom:4.05,minZoom:3,maxZoom:14,maxBounds:WEST_PAPUA_BOUNDS,attributionControl:false,dragRotate:false,pitchWithRotate:false,renderWorldCopies:false,fadeDuration:120});
  map.addControl(new maplibregl.NavigationControl({showCompass:false,visualizePitch:false}),'bottom-right');
  let enabled=new Set<string>(state.explore&&!context?state.layers:DEFAULT_LAYER_IDS);const unavailable=new Set<string>();
  map.on('load',async()=>{
    for(const def of MAP_LAYERS){let available=true;if(def.sourceType==='pmtiles'||def.id==='fire-hotspots')available=status?.layers?.[def.id]?.available===true;if(!available){unavailable.add(def.id);continue}
      let data:FeatureCollection|undefined;if(def.id==='current-developments')data=current;else if(def.id==='fire-hotspots')data=await fireGeoJSON();
      map.addSource(`watch-source-${def.id}`,sourceSpec(def,data));map.addLayer(createMapLayer(def));setLayerVisibility(map,def.id,enabled.has(def.id));
    }
    syncControls();if(context&&current.features.length)fitFeatures(current);else if(state.place&&!context)await focusPlace(state.place);
  });
  map.on('click',(e:MapMouseEvent)=>{const ids=activeLayerIds(map);if(!ids.length)return;const fs=map.queryRenderedFeatures(e.point,{layers:ids});const f=fs[0];if(!f)return;const id=String(f.layer.id).replace(/^watch-/,'');const def=layerById[id];if(def)populateFeaturePanel(root,f,def,locale)});
  map.on('mousemove',(e:MapMouseEvent)=>{const ids=activeLayerIds(map);map.getCanvas().style.cursor=ids.length&&map.queryRenderedFeatures(e.point,{layers:ids}).length?'pointer':''});
  function fitFeatures(fc:FeatureCollection){const points=fc.features.map(f=>f.geometry?.type==='Point'?f.geometry.coordinates:null).filter(Boolean) as number[][];if(!points.length)return;if(points.length===1){map.easeTo({center:points[0] as [number,number],zoom:7,duration:650});return}const b=new maplibregl.LngLatBounds(points[0] as [number,number],points[0] as [number,number]);points.slice(1).forEach(p=>b.extend(p as [number,number]));map.fitBounds(b,{padding:70,maxZoom:8,duration:650})}
  async function focusPlace(slug:string){try{const r=await fetch(`/api/places?q=${encodeURIComponent(slug.replaceAll('-',' '))}`).then(x=>x.ok?x.json():null);const rows=r?.items||r||[];const p=rows.find((x:any)=>x.slug===slug)||rows[0];const lat=Number(p?.latitude),lon=Number(p?.longitude);if(Number.isFinite(lat)&&Number.isFinite(lon))map.easeTo({center:[lon,lat],zoom:7,duration:700})}catch{}}
  function syncControls(){root.querySelectorAll<HTMLButtonElement>('[data-map-layer]').forEach(button=>{const id=button.dataset.mapLayer||'';const off=unavailable.has(id);button.disabled=off;button.classList.toggle('active',enabled.has(id)&&!off);button.dataset.availability=off?'unavailable':'available';const note=button.querySelector<HTMLElement>('small');if(note&&off)note.textContent=locale==='pmy'?'Data tidak tersedia':'Data unavailable'});root.querySelectorAll<HTMLButtonElement>('[data-map-family]').forEach(button=>{const family=button.dataset.mapFamily;button.classList.toggle('active',MAP_LAYERS.filter(x=>x.family===family&&!unavailable.has(x.id)).some(x=>enabled.has(x.id)))})}
  function commit(){for(const d of MAP_LAYERS)setLayerVisibility(map,d.id,enabled.has(d.id));root.dataset.explore='true';syncControls();setText(root.querySelector('[data-map-state]'),locale==='pmy'?'Eksplorasi':'Explore');if(!context)writeMapState({layers:[...enabled],place:null,explore:true})}
  root.querySelectorAll<HTMLButtonElement>('[data-map-layer]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.mapLayer||'';if(!id||unavailable.has(id))return;enabled.has(id)?enabled.delete(id):enabled.add(id);commit()}));
  root.querySelectorAll<HTMLButtonElement>('[data-map-family]').forEach(button=>button.addEventListener('click',()=>{const family=button.dataset.mapFamily;const ids=MAP_LAYERS.filter(x=>x.family===family&&!unavailable.has(x.id)).map(x=>x.id);const turnOn=!ids.some(id=>enabled.has(id));ids.forEach(id=>turnOn?enabled.add(id):enabled.delete(id));commit()}));
  const panel=root.querySelector<HTMLElement>('[data-map-layers-panel]');root.querySelectorAll<HTMLButtonElement>('[data-map-layers-open]').forEach(b=>b.addEventListener('click',()=>{if(panel)panel.hidden=!panel.hidden}));root.querySelectorAll<HTMLButtonElement>('[data-map-layers-close]').forEach(b=>b.addEventListener('click',()=>{if(panel)panel.hidden=true}));root.querySelectorAll<HTMLButtonElement>('[data-map-feature-close]').forEach(b=>b.addEventListener('click',()=>{const p=root.querySelector<HTMLElement>('[data-map-feature]');if(p)p.hidden=true}));
  const search=root.querySelector<HTMLInputElement>('[data-map-place-search]'),results=root.querySelector<HTMLElement>('[data-map-place-results]');let timer=0;search?.addEventListener('input',()=>{clearTimeout(timer);timer=window.setTimeout(async()=>{const q=search.value.trim();if(q.length<2){results?.replaceChildren();return}const data=await fetch(`/api/places?q=${encodeURIComponent(q)}`).then(r=>r.ok?r.json():null).catch(()=>null);const rows=data?.items||data||[];if(!results)return;results.replaceChildren();for(const p of rows.slice(0,8)){const lat=Number(p.latitude),lon=Number(p.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;const b=document.createElement('button');b.type='button';b.textContent=p.name;b.addEventListener('click',()=>{map.easeTo({center:[lon,lat],zoom:7,duration:650});root.dataset.explore='true';setText(root.querySelector('[data-map-state]'),p.name);if(!context)writeMapState({layers:[...enabled],place:p.slug,explore:true});results.replaceChildren();search.value=p.name});results.append(b)}},220)});
  function expand(on:boolean){root.classList.toggle('map-expanded',on);document.body.classList.toggle('no-scroll',on);setTimeout(()=>map.resize(),80);const close=root.querySelector<HTMLButtonElement>('[data-map-close-expanded]');if(close)close.hidden=!on;if(on){root.dataset.explore='true';setText(root.querySelector('[data-map-state]'),locale==='pmy'?'Eksplorasi':'Explore')}}
  root.querySelectorAll<HTMLButtonElement>('[data-map-expand]').forEach(b=>b.addEventListener('click',()=>expand(true)));root.querySelectorAll<HTMLButtonElement>('[data-map-close-expanded]').forEach(b=>b.addEventListener('click',()=>expand(false)));
  root.querySelectorAll<HTMLButtonElement>('[data-map-return]').forEach(b=>b.addEventListener('click',()=>{enabled=new Set(DEFAULT_LAYER_IDS);root.dataset.explore='false';for(const d of MAP_LAYERS)setLayerVisibility(map,d.id,enabled.has(d.id));syncControls();setText(root.querySelector('[data-map-state]'),'');if(!context)writeMapState({layers:[...enabled],place:null,explore:false});map.fitBounds(WEST_PAPUA_BOUNDS,{padding:40,duration:650})}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('map-expanded'))expand(false)});
}

export function initWatchMaps(){document.querySelectorAll<HTMLElement>('[data-watch-map]').forEach(root=>{if(root.dataset.mapInitialized==='true')return;root.dataset.mapInitialized='true';initOne(root).catch(err=>{console.warn('Watch map unavailable',err);root.dataset.mapError='true';const state=root.querySelector<HTMLElement>('[data-map-state]');if(state)state.textContent=root.dataset.locale==='pmy'?'Peta tidak tersedia':'Map data unavailable'})})}
