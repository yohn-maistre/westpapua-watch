const FIRMS_SOURCE='VIIRS_NOAA21_NRT';
const WNG_BBOX='129,-11,141.15,1.5';
const csvRows=(text:string)=>{const rows:string[][]=[];let row:string[]=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(field);field=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);field='';if(row.some(x=>x.length))rows.push(row);row=[]}else field+=c}if(field||row.length){row.push(field);rows.push(row)}return rows};
export async function geographicStatus(env:any){return {coverage:'Western New Guinea',fires:{available:Boolean(env.FIRMS_MAP_KEY),source:FIRMS_SOURCE,updated_at:null}}}
export async function fireHotspots(env:any){
  if(!env.FIRMS_MAP_KEY)return {status:503,body:{type:'FeatureCollection',features:[],available:false,reason:'FIRMS_MAP_KEY not configured'}};
  const url=`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${encodeURIComponent(env.FIRMS_MAP_KEY)}/${FIRMS_SOURCE}/${WNG_BBOX}/2`;
  const r=await fetch(url,{headers:{accept:'text/csv','user-agent':'WestPapuaWatch/1.0'},signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error(`NASA FIRMS ${r.status}`);const rows=csvRows(await r.text());if(rows.length<2)return {status:200,body:{type:'FeatureCollection',features:[],available:true,source:FIRMS_SOURCE}};
  const head=rows[0].map(x=>x.trim().toLowerCase()),idx=(name:string)=>head.indexOf(name);const features=[] as any[];
  for(const cells of rows.slice(1)){const lat=Number(cells[idx('latitude')]),lon=Number(cells[idx('longitude')]);if(!Number.isFinite(lat)||!Number.isFinite(lon)||lon<129||lon>141.15||lat< -11||lat>1.5)continue;features.push({type:'Feature',geometry:{type:'Point',coordinates:[lon,lat]},properties:{acq_date:cells[idx('acq_date')]||'',acq_time:cells[idx('acq_time')]||'',satellite:cells[idx('satellite')]||'NOAA-21',confidence:cells[idx('confidence')]||'',frp:Number(cells[idx('frp')])||0,daynight:cells[idx('daynight')]||'',instrument:cells[idx('instrument')]||'VIIRS'}})}
  return {status:200,body:{type:'FeatureCollection',features,available:true,source:FIRMS_SOURCE,coverage:'Western New Guinea',caveat:'Satellite thermal detections are not automatically confirmed wildfires.'}};
}
