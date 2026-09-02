#!/usr/bin/env node
import {mkdir,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';

const ROOT=new URL('.',import.meta.url).pathname;const WORK=join(ROOT,'.build');const OUT=join(ROOT,'out');
const BBOX=[129,-11,141.15,1.5];
const now=new Date().toISOString();
await rm(WORK,{recursive:true,force:true});await rm(OUT,{recursive:true,force:true});await mkdir(WORK,{recursive:true});await mkdir(OUT,{recursive:true});

const SOURCES={
  admin:'https://kspservices.big.go.id/satupeta/rest/services/PUBLIK/BATAS_WILAYAH/MapServer/2/query',
  provinces:'https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_WILAYAH/MapServer/12/query',
  mining:'https://geoportal.esdm.go.id/gis1/rest/services/Join_WIUP_vs_IPPKH/MapServer/0/query',
  permits:'https://kspservices.big.go.id/satupeta/rest/services/PUBLIK/PERIZINAN_DAN_PERTANAHAN/MapServer',
  protected:'https://kspservices.big.go.id/satupeta/rest/services/PUBLIK/SUMBER_DAYA_ALAM_DAN_LINGKUNGAN/MapServer/33/query'
};
const status={generated_at:now,bbox:BBOX,sources:{}};
const clean=(v)=>String(v??'').replace(/\s+/g,' ').trim();
const normalize=(v)=>clean(v).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/^(kabupaten|kota)\s+/,'').replace(/[^a-z0-9]+/g,' ').trim();
function stripZM(c){if(!Array.isArray(c))return c;if(typeof c[0]==='number')return [c[0],c[1]];return c.map(stripZM)}
function normalizeFeature(f,props){if(!f?.geometry?.coordinates)return null;return {type:'Feature',geometry:{type:f.geometry.type,coordinates:stripZM(f.geometry.coordinates)},properties:props(f.properties||{})}}
async function queryArcGIS(url,{fields='*',where='1=1',pageSize=1000,maxPages=30,offset=.0025,precision=5}={}){
  const out=[];for(let page=0;page<maxPages;page++){
    const q=new URLSearchParams({where,outFields:fields,returnGeometry:'true',outSR:'4326',inSR:'4326',f:'geojson',geometry:BBOX.join(','),geometryType:'esriGeometryEnvelope',spatialRel:'esriSpatialRelIntersects',maxAllowableOffset:String(offset),geometryPrecision:String(precision),resultOffset:String(page*pageSize),resultRecordCount:String(pageSize)});
    const r=await fetch(`${url}?${q}`,{headers:{accept:'application/geo+json,application/json','user-agent':'WestPapuaWatch-Geo/1.0'},signal:AbortSignal.timeout(60000)});if(!r.ok)throw new Error(`${r.status} ${url}`);const d=await r.json();if(d.error)throw new Error(`${url}: ${JSON.stringify(d.error).slice(0,300)}`);const fs=d.features||[];out.push(...fs);if(fs.length<pageSize)break;await new Promise(s=>setTimeout(s,180));
  }return out
}
async function writeFC(name,features){await writeFile(join(WORK,`${name}.geojson`),JSON.stringify({type:'FeatureCollection',features}));return features.length}
async function attempt(id,fn){try{const result=await fn();status.sources[id]={available:true,...(typeof result==='number'?{features:result}:result)};console.log(`geo ${id}: ${status.sources[id].features??'ok'}`)}catch(e){status.sources[id]={available:false,error:String(e?.message||e).slice(0,500)};console.warn(`geo ${id}: unavailable`,e?.message||e)}}

const REGION_MEMBERS={
  'Mamta / Tabi':['Jayapura','Kota Jayapura','Sarmi','Mamberamo Raya','Keerom'],
  'Saireri':['Biak Numfor','Supiori','Kepulauan Yapen','Waropen'],
  'Mee Pago':['Nabire','Intan Jaya','Paniai','Dogiyai','Deiyai','Mimika'],
  'Laa Pago':['Puncak','Puncak Jaya','Tolikara','Mamberamo Tengah','Lanny Jaya','Nduga','Jayawijaya','Yalimo','Yahukimo','Pegunungan Bintang'],
  'Anim Ha':['Asmat','Merauke','Mappi','Boven Digoel'],
  'Domberay':['Kota Sorong','Sorong','Raja Ampat','Tambrauw','Maybrat','Sorong Selatan','Pegunungan Arfak','Manokwari','Manokwari Selatan','Teluk Bintuni','Teluk Wondama'],
  'Bomberay':['Fakfak','Fak Fak','Kaimana']
};
const regionFor=new Map();for(const [region,names] of Object.entries(REGION_MEMBERS))for(const n of names)regionFor.set(normalize(n),region);
let adminCache=null;async function adminAreas(){if(adminCache)return adminCache;adminCache=await queryArcGIS(SOURCES.admin,{fields:'namobj,wadmkk,wadmpr,kdpkab,kdppum',offset:.0015});return adminCache}

await attempt('province-boundaries',async()=>{
  const fs=await queryArcGIS(SOURCES.provinces,{fields:'namobj,wadmpr,kdppum,remark',offset:.0012});const features=fs.map(f=>normalizeFeature(f,p=>({provinsi:clean(p.wadmpr||p.namobj||p.remark),kode:clean(p.kdppum)}))).filter(Boolean);await writeFC('provinces',features);return features.length
});
await attempt('cultural-regions',async()=>{
  const fs=await adminAreas();const unknown=new Set();const features=[];for(const f of fs){const p=f.properties||{},kab=clean(p.wadmkk||p.namobj),prov=clean(p.wadmpr),region=regionFor.get(normalize(kab));if(!region){if(kab)unknown.add(kab);continue}const nf=normalizeFeature(f,()=>({region,kabupaten:kab,provinsi:prov,method:'Generalized from regency membership in RPJMN 2020–2024'}));if(nf)features.push(nf)}await writeFC('cultural_source',features);return {features:features.length,unmapped:[...unknown].sort()}
});
await attempt('mining-permits',async()=>{
  const fs=await queryArcGIS(SOURCES.mining,{fields:'komoditas,nama_usaha,kegiatan,luas_sk,nama_prov,nama_kab,cnc',offset:.0025});const group=(k)=>{const s=clean(k).toUpperCase();if(s.includes('BATUBARA'))return'coal';if(/NIKEL|NICKEL/.test(s))return'nickel';if(/EMAS|GOLD|PERAK/.test(s))return'gold';if(/TEMBAGA|COPPER/.test(s))return'copper';return'other'};const features=fs.map(f=>normalizeFeature(f,p=>({komoditas:clean(p.komoditas),grup:group(p.komoditas),usaha:clean(p.nama_usaha),kegiatan:clean(p.kegiatan),luas:Math.round(Number(p.luas_sk)||0),prov:clean(p.nama_prov),kab:clean(p.nama_kab),cnc:clean(p.cnc)}))).filter(Boolean);await writeFC('mining',features);return features.length
});
await attempt('forest-plantation-permits',async()=>{
  const specs=[{id:1,jenis:'logging'},{id:2,jenis:'hti'},...[51,52,53,54,55,56,57].map(id=>({id,jenis:'sawit',izin:'usaha'})),...Array.from({length:22},(_,i)=>({id:28+i,jenis:'sawit',izin:'lokasi'}))];const features=[];const missing=[];
  for(const s of specs){try{const fs=await queryArcGIS(`${SOURCES.permits}/${s.id}/query`,{fields:'*',offset:.0025,maxPages:8});for(const f of fs){const p=f.properties||{};const nf=normalizeFeature(f,()=>({jenis:s.jenis,izin:s.izin||'',nama:clean(p.nama_prsh||p.namobj||p.nama),luas:Math.round(Number(p.luas_ha||p.lssk)||0),status:clean(p.status),sk:clean(p.no_sk||p.nmr_sk_iup||p.nmr_sk_il),grup:clean(p.grp_usaha),tahun:String(p.tgl_sk||p.tgl_sk_iup||p.tgl_sk_il||'').match(/(19|20)\d{2}/)?.[0]||''}));if(nf)features.push(nf)}}catch(e){missing.push(s.id);console.warn(`permit sublayer ${s.id} unavailable: ${e?.message||e}`)}await new Promise(r=>setTimeout(r,100))}
  if(!features.length)throw new Error('no public permit features returned');await writeFC('concessions',features);return {features:features.length,partial:true,missing_sublayers:missing}
});
await attempt('protected-areas',async()=>{
  const fs=await queryArcGIS(SOURCES.protected,{fields:'fgskws,nkws,nprov,nupt,remark,catatan,keterangan',offset:.0025});const features=fs.map(f=>normalizeFeature(f,p=>({fgskws:clean(p.fgskws),nkws:clean(p.nkws),nprov:clean(p.nprov),nupt:clean(p.nupt),remark:clean(p.remark),catatan:clean(p.catatan),keterangan:clean(p.keterangan)}))).filter(Boolean);await writeFC('protected',features);return features.length
});
await writeFile(join(WORK,'manifest.json'),JSON.stringify(status,null,2));console.log('Geo source harvest complete; PMTiles compilation follows in geo/compile.sh');
