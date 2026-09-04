#!/usr/bin/env node
import {mkdir,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';

const ROOT=new URL('.',import.meta.url).pathname,WORK=join(ROOT,'.build'),OUT=join(ROOT,'out');
const BBOX=[129,-11,141.15,1.5],CONTEXT_BBOX=[124,-13,147,4],now=new Date().toISOString();
await rm(WORK,{recursive:true,force:true});await rm(OUT,{recursive:true,force:true});await mkdir(WORK,{recursive:true});await mkdir(OUT,{recursive:true});

const PAPUA_PROVINCES=['Papua','Papua Barat','Papua Barat Daya','Papua Tengah','Papua Pegunungan','Papua Selatan'];
const PROVINCE_META={
 'Papua':{
   capital:'Jayapura',admin_units:9,bps_url:'https://papua.bps.go.id/',reference_sources:'BPS province statistics · Badan Bahasa Peta Bahasa',
   peoples_languages:'Selected, not exhaustive: Sentani, Biak, Yapen, Waropen, Tobati–Enggros',
   context_note:'North-coast and island province; fisheries, agriculture, services, forests and the Jayapura urban corridor.'
 },
 'Papua Barat':{
   capital:'Manokwari',admin_units:7,bps_url:'https://papuabarat.bps.go.id/',reference_sources:'BPS province statistics · Badan Bahasa Peta Bahasa',
   peoples_languages:'Selected, not exhaustive: Arfak, Meyah, Sougb, Wamesa, Irarutu',
   context_note:'Bird’s Head / Bomberai landscapes; forests, fisheries, agriculture and the Bintuni Bay gas economy.'
 },
 'Papua Barat Daya':{
   capital:'Sorong',admin_units:6,bps_url:'https://papuabarat.bps.go.id/',reference_sources:'BPS province statistics · Badan Bahasa Peta Bahasa',
   peoples_languages:'Selected, not exhaustive: Moi, Maya, Matbat, Tehit, Imekko',
   context_note:'Sorong and Raja Ampat gateway; marine biodiversity, fisheries, tourism, services and extractive pressures.'
 },
 'Papua Tengah':{
   capital:'Nabire',admin_units:8,bps_url:'https://papua.bps.go.id/',reference_sources:'BPS province statistics · Badan Bahasa Peta Bahasa',
   peoples_languages:'Selected, not exhaustive: Mee/Ekari, Moni, Amungme, Kamoro, Wolani',
   context_note:'Central highlands to Arafura-facing lowlands; agriculture, fisheries and the Grasberg copper-gold mining complex.'
 },
 'Papua Pegunungan':{
   capital:'Wamena',admin_units:8,bps_url:'https://papua.bps.go.id/',reference_sources:'BPS province statistics · Badan Bahasa Peta Bahasa',
   peoples_languages:'Selected, not exhaustive: Hubula/Dani, Lani, Yali, Nduga, Mek',
   context_note:'Mountainous interior centered on the Baliem and surrounding highlands; highland agriculture and difficult transport access.'
 },
 'Papua Selatan':{
   capital:'Merauke',admin_units:4,bps_url:'https://papua.bps.go.id/',reference_sources:'BPS province statistics · Badan Bahasa Peta Bahasa',
   peoples_languages:'Selected, not exhaustive: Marind, Asmat, Muyu, Mandobo, Awyu',
   context_note:'Southern wetlands and savannas; sago, fisheries, forests, agriculture and large-scale food/plantation development.'
 }
};
const SOURCES={
 admin:'https://kspservices.big.go.id/satupeta/rest/services/PUBLIK/BATAS_WILAYAH/MapServer/2/query',
 provinces:'https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/12/query',
 mining:'https://geoportal.esdm.go.id/gis1/rest/services/Join_WIUP_vs_IPPKH/MapServer/0/query',
 permits:'https://kspservices.big.go.id/satupeta/rest/services/PUBLIK/PERIZINAN_DAN_PERTANAHAN/MapServer',
 protected:'https://kspservices.big.go.id/satupeta/rest/services/PUBLIK/SUMBER_DAYA_ALAM_DAN_LINGKUNGAN/MapServer/33/query',
 basemap:'https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer',
 roads:'https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer/863/query',
 airports:'https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer/860/query',
 ports:'https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer/861/query',
 provinceCapitals:'https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer/2/query',
 regencyCapitals:'https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer/5/query',
 naturalEarth:'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson'
};
const status={generated_at:now,bbox:BBOX,context_bbox:CONTEXT_BBOX,sources:{}};
const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
const normalize=v=>clean(v).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/^(kabupaten|kota)\s+/,'').replace(/[^a-z0-9]+/g,' ').trim();
const provinceCanonical=v=>PAPUA_PROVINCES.find(x=>normalize(x)===normalize(v))||'';
function stripZM(c){if(!Array.isArray(c))return c;if(typeof c[0]==='number')return[c[0],c[1]];return c.map(stripZM)}
function normalizeFeature(f,props){if(!f?.geometry?.coordinates)return null;return{type:'Feature',geometry:{type:f.geometry.type,coordinates:stripZM(f.geometry.coordinates)},properties:props(f.properties||{})}}
async function fetchJSON(url,timeout=60000){const r=await fetch(url,{headers:{accept:'application/json','user-agent':'WestPapuaWatch-Geo/1.1'},signal:AbortSignal.timeout(timeout)});if(!r.ok)throw new Error(`${r.status} ${url}`);return r.json()}
async function queryArcGIS(url,{fields='*',where='1=1',pageSize=1000,maxPages=30,offset=.0025,precision=5,bbox=BBOX}={}){
 const out=[];for(let page=0;page<maxPages;page++){const q=new URLSearchParams({where,outFields:fields,returnGeometry:'true',outSR:'4326',inSR:'4326',f:'geojson',geometry:bbox.join(','),geometryType:'esriGeometryEnvelope',spatialRel:'esriSpatialRelIntersects',maxAllowableOffset:String(offset),geometryPrecision:String(precision),resultOffset:String(page*pageSize),resultRecordCount:String(pageSize)});
 const r=await fetch(`${url}?${q}`,{headers:{accept:'application/geo+json,application/json','user-agent':'WestPapuaWatch-Geo/1.1'},signal:AbortSignal.timeout(60000)});if(!r.ok)throw new Error(`${r.status} ${url}`);const d=await r.json();if(d.error)throw new Error(`${url}: ${JSON.stringify(d.error).slice(0,300)}`);const fs=d.features||[];out.push(...fs);if(fs.length<pageSize)break;await new Promise(s=>setTimeout(s,120))}return out
}
async function writeFC(name,features){await writeFile(join(WORK,`${name}.geojson`),JSON.stringify({type:'FeatureCollection',features}));return features.length}
async function attempt(id,fn){try{const result=await fn();status.sources[id]={available:true,...(typeof result==='number'?{features:result}:result)};console.log(`geo ${id}: ${status.sources[id].features??'ok'}`)}catch(e){status.sources[id]={available:false,error:String(e?.message||e).slice(0,500)};console.warn(`geo ${id}: unavailable`,e?.message||e)}}
async function leafLayers(base,re){const d=await fetchJSON(`${base}?f=json`);return(d.layers||[]).filter(x=>!x.subLayerIds?.length&&re.test(String(x.name||'')))}
async function queryDiscovered(base,re,{limit=6,offset=.0025}={}){const leaves=(await leafLayers(base,re)).slice(0,limit),all=[];for(const x of leaves){try{all.push(...await queryArcGIS(`${base}/${x.id}/query`,{fields:'*',maxPages:12,offset}))}catch(e){console.warn(`layer ${x.id} ${x.name} unavailable`,e?.message||e)}}return all}

const REGION_MEMBERS={
 'Mamta / Tabi':['Jayapura','Kota Jayapura','Sarmi','Mamberamo Raya','Keerom'],
 'Saireri':['Biak Numfor','Supiori','Kepulauan Yapen','Waropen'],
 'Mee Pago':['Nabire','Intan Jaya','Paniai','Dogiyai','Deiyai','Mimika'],
 'Laa Pago':['Puncak','Puncak Jaya','Tolikara','Mamberamo Tengah','Lanny Jaya','Nduga','Jayawijaya','Yalimo','Yahukimo','Pegunungan Bintang'],
 'Anim Ha':['Asmat','Merauke','Mappi','Boven Digoel'],
 'Domberay':['Kota Sorong','Sorong','Raja Ampat','Tambrauw','Maybrat','Sorong Selatan','Pegunungan Arfak','Manokwari','Manokwari Selatan','Teluk Bintuni','Teluk Wondama'],
 'Bomberay':['Fakfak','Fak Fak','Kaimana']
};
const regionFor=new Map();for(const[region,names]of Object.entries(REGION_MEMBERS))for(const n of names)regionFor.set(normalize(n),region);
let adminCache=null;async function adminAreas(){if(adminCache)return adminCache;adminCache=await queryArcGIS(SOURCES.admin,{fields:'namobj,wadmkk,wadmpr,kdpkab,kdppum',offset:.0015});return adminCache}

await attempt('province-boundaries',async()=>{
 const fs=await queryArcGIS(SOURCES.provinces,{fields:'namobj,wadmpr,kdppum,remark,luaswh',offset:.0012});
 const admin=await adminAreas(),regionsByProvince=new Map(),counts=new Map();
 for(const f of admin){const p=f.properties||{},prov=provinceCanonical(p.wadmpr),kab=clean(p.wadmkk||p.namobj),region=regionFor.get(normalize(kab));if(!prov)continue;counts.set(prov,(counts.get(prov)||new Set()).add(normalize(kab)));if(region)regionsByProvince.set(prov,(regionsByProvince.get(prov)||new Set()).add(region))}
 const features=fs.map(f=>normalizeFeature(f,p=>{const prov=provinceCanonical(p.wadmpr||p.namobj||p.remark);if(!prov)return null;const meta=PROVINCE_META[prov]||{};return{provinsi:prov,kode:clean(p.kdppum),capital:meta.capital||'',admin_units:meta.admin_units||counts.get(prov)?.size||'',peoples_languages:meta.peoples_languages||'',reference_sources:meta.reference_sources||'',context_note:meta.context_note||'',reference_regions:[...(regionsByProvince.get(prov)||[])].join('|'),bps_url:meta.bps_url||''}})).filter(f=>f&&f.properties);
 await writeFC('provinces',features);return features.length
});
await attempt('cultural-regions',async()=>{
 const fs=await adminAreas(),unknown=new Set(),features=[];for(const f of fs){const p=f.properties||{},kab=clean(p.wadmkk||p.namobj),prov=provinceCanonical(p.wadmpr),region=regionFor.get(normalize(kab));if(!region||!prov){if(kab&&!region)unknown.add(kab);continue}const nf=normalizeFeature(f,()=>({region,kabupaten:kab,provinsi:prov,method:'Generalized from regency membership in RPJMN 2020–2024'}));if(nf)features.push(nf)}
 await writeFC('cultural_source',features);return{features:features.length,unmapped:[...unknown].sort()}
});
await attempt('mining-permits',async()=>{
 const fs=await queryArcGIS(SOURCES.mining,{fields:'komoditas,nama_usaha,kegiatan,luas_sk,nama_prov,nama_kab,cnc',offset:.0025});const group=k=>{const s=clean(k).toUpperCase();if(s.includes('BATUBARA'))return'coal';if(/NIKEL|NICKEL/.test(s))return'nickel';if(/EMAS|GOLD|PERAK/.test(s))return'gold';if(/TEMBAGA|COPPER/.test(s))return'copper';return'other'};
 const features=fs.map(f=>normalizeFeature(f,p=>({komoditas:clean(p.komoditas),grup:group(p.komoditas),usaha:clean(p.nama_usaha),kegiatan:clean(p.kegiatan),luas:Math.round(Number(p.luas_sk)||0),prov:clean(p.nama_prov),kab:clean(p.nama_kab),cnc:clean(p.cnc)}))).filter(Boolean);await writeFC('mining',features);return features.length
});
await attempt('forest-plantation-permits',async()=>{
 const specs=[{id:1,jenis:'logging'},{id:2,jenis:'hti'},...[51,52,53,54,55,56,57].map(id=>({id,jenis:'sawit',izin:'usaha'})),...Array.from({length:22},(_,i)=>({id:28+i,jenis:'sawit',izin:'lokasi'}))],features=[],missing=[];
 for(const s of specs){try{const fs=await queryArcGIS(`${SOURCES.permits}/${s.id}/query`,{fields:'*',offset:.0025,maxPages:8});for(const f of fs){const p=f.properties||{},nf=normalizeFeature(f,()=>({jenis:s.jenis,izin:s.izin||'',nama:clean(p.nama_prsh||p.namobj||p.nama),luas:Math.round(Number(p.luas_ha||p.lssk)||0),status:clean(p.status),sk:clean(p.no_sk||p.nmr_sk_iup||p.nmr_sk_il),grup:clean(p.grp_usaha),tahun:String(p.tgl_sk||p.tgl_sk_iup||p.tgl_sk_il||'').match(/(19|20)\d{2}/)?.[0]||''}));if(nf)features.push(nf)}}catch(e){missing.push(s.id)}}
 if(!features.length)throw new Error('no public permit features returned');await writeFC('concessions',features);return{features:features.length,partial:true,missing_sublayers:missing}
});
await attempt('protected-areas',async()=>{
 const fs=await queryArcGIS(SOURCES.protected,{fields:'fgskws,nkws,nprov,nupt,remark,catatan,keterangan',offset:.0025});const features=fs.map(f=>normalizeFeature(f,p=>({fgskws:clean(p.fgskws),nkws:clean(p.nkws),nprov:clean(p.nprov),nupt:clean(p.nupt),remark:clean(p.remark),catatan:clean(p.catatan),keterangan:clean(p.keterangan)}))).filter(Boolean);await writeFC('protected',features);return features.length
});
await attempt('major-roads',async()=>{
 const fs=await queryArcGIS(SOURCES.roads,{fields:'NAMRJL,FGSRJL,AUTRJL,STARJL,REMARK',offset:.0012,maxPages:24});
 const features=fs.map(f=>normalizeFeature(f,p=>({name:clean(p.NAMRJL||p.namrjl||p.REMARK||p.remark),function:clean(p.FGSRJL||p.fgsrjl),ownership:clean(p.AUTRJL||p.autrjl),status:clean(p.STARJL||p.starjl)}))).filter(Boolean);
 if(!features.length)throw new Error('BIG major-road layer returned no features');await writeFC('roads',features);return features.length
});
await attempt('airports',async()=>{
 const fs=await queryArcGIS(SOURCES.airports,{fields:'NAMOBJ,KOBDMI,KDICAO,KDIATA,KLSBMI,TIPAIP,REMARK',offset:.0004,maxPages:8});
 const features=fs.map(f=>normalizeFeature(f,p=>({name:clean(p.NAMOBJ||p.namobj||p.KOBDMI||p.kobdmi),city:clean(p.KOBDMI||p.kobdmi),iata:clean(p.KDIATA||p.kdiata),icao:clean(p.KDICAO||p.kdicao),class:clean(p.KLSBMI||p.klsbmi),type:clean(p.TIPAIP||p.tipaip)}))).filter(Boolean);
 if(!features.length)throw new Error('BIG airport layer returned no features');await writeFC('airports',features);return features.length
});
await attempt('ports',async()=>{
 const fs=await queryArcGIS(SOURCES.ports,{fields:'NAMOBJ,JNSPEL,FGSPEL,KLSPEL,REMARK',offset:.0004,maxPages:8});
 const features=fs.map(f=>normalizeFeature(f,p=>({name:clean(p.NAMOBJ||p.namobj||p.REMARK||p.remark),type:clean(p.JNSPEL||p.jnspel),function:clean(p.FGSPEL||p.fgspel),class:clean(p.KLSPEL||p.klspel)}))).filter(Boolean);
 if(!features.length)throw new Error('BIG port layer returned no features');await writeFC('ports',features);return features.length
});
await attempt('settlements',async()=>{
 const [province,regency]=await Promise.all([
   queryArcGIS(SOURCES.provinceCapitals,{fields:'NAMOBJ,NAMMAP,WADMPR,FTYPE,KLSTPN',offset:.00025,maxPages:4}),
   queryArcGIS(SOURCES.regencyCapitals,{fields:'NAMOBJ,NAMMAP,WADMKK,WADMPR,FTYPE,KLSTPN',offset:.00025,maxPages:8})
 ]);
 const seen=new Set(),features=[];for(const f of [...province,...regency]){const p=f.properties||{},name=clean(p.NAMMAP||p.nammap||p.NAMOBJ||p.namobj),prov=provinceCanonical(p.WADMPR||p.wadmpr);if(!name||!prov)continue;const key=normalize(name);if(seen.has(key))continue;seen.add(key);const nf=normalizeFeature(f,()=>({name,kind:clean(p.FTYPE||p.ftype||p.KLSTPN||p.klstpn||'capital'),province:prov,regency:clean(p.WADMKK||p.wadmkk)}));if(nf)features.push(nf)}
 if(!features.length)throw new Error('BIG capital/toponym layers returned no features');await writeFC('settlements',features);return features.length
});
await attempt('natural-earth-context',async()=>{
 const d=await fetchJSON(SOURCES.naturalEarth,30000),keep=new Set(['IDN','PNG','AUS','SLB']),features=(d.features||[]).filter(f=>keep.has(f.properties?.ADM0_A3)||keep.has(f.properties?.SOV_A3));if(!features.length)throw new Error('no context countries');await writeFC('context_countries',features);return features.length
});

await writeFile(join(WORK,'manifest.json'),JSON.stringify(status,null,2));
console.log('Geo source harvest complete; PMTiles/static compilation follows in geo/compile.sh');
