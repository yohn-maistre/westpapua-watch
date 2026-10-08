type Locale='en'|'pmy';
const array=(v:any):any[]=>{if(Array.isArray(v))return v;try{const a=JSON.parse(v||'[]');return Array.isArray(a)?a:[]}catch{return[]}};
const object=(v:any)=>{if(v&&typeof v==='object')return v;try{return JSON.parse(v||'null')}catch{return null}};
export const normalizedEditorialText=(v:any)=>String(v||'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function storySynthesisSections(s:any,locale:Locale,summary=''){
  const local=locale==='pmy';
  const points=array(local?(s.key_points?.id||s.key_points_id_json):(s.key_points?.en||s.key_points_en_json)).filter(x=>typeof x==='string');
  const changed=String((local?s.what_changed_id:s.what_changed)||'').trim();
  const stored=object(s.common_ground_json);
  // Legacy lists have no language provenance: only render them on English pages.
  const common=stored?.version===2?array(stored.items).map(x=>local?x.text_id:x.text_en):local?array(s.common_ground_id_json):array(s.common_ground_json);
  const redundant=new Set([summary,...points].map(normalizedEditorialText).filter(Boolean));
  return {points,changed:redundant.has(normalizedEditorialText(changed))?'':changed,
    common:common.filter(x=>typeof x==='string'&&x.trim()&&!redundant.has(normalizedEditorialText(x))).map(x=>x.trim())};
}
