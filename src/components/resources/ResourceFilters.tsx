import {useEffect,useState} from 'react';
import {Popover} from '@base-ui/react/popover';
import {Checkbox} from '@base-ui/react/checkbox';
import {CheckboxGroup} from '@base-ui/react/checkbox-group';
import '../../styles/resource-filters.css';
type Facet={key:string;label:string;options:[string,string,string?][]};
export default function ResourceFilters({facets,locale}:{facets:Facet[];locale:string}){
 const [values,setValues]=useState<Record<string,string[]>>({});
 const [choices,setChoices]=useState(facets);
 const [counts,setCounts]=useState<Record<string,Record<string,number>>>({});
 const dispatch=(next:Record<string,string[]>)=>document.dispatchEvent(new CustomEvent('watch:resource-filter',{detail:next}));
 useEffect(()=>{
  const p=new URL(location.href).searchParams;
  const initial=Object.fromEntries(facets.map(f=>[f.key,(p.get(f.key)||'').split(',').filter(Boolean)]));
  const following=new Set(facets.find(f=>f.key==='following')?.options.map(o=>o[0]));
  initial.following=[...new Set([...initial.following,...initial.topic.filter(v=>following.has(v))])];initial.topic=initial.topic.filter(v=>!following.has(v));
  setValues(initial);dispatch(initial);
  const refresh=()=>{
   const all:Record<string,Record<string,number>>={};for(const f of facets)all[f.key]={};
   document.querySelectorAll<HTMLElement>('[data-resource-row]').forEach(row=>{
    let places:string[]=[];try{places=JSON.parse(row.dataset.resourcePlaces||'[]')}catch{}
    const languages=(row.dataset.resourceLanguages||'').split(' ').filter(Boolean);if(languages.length>1)languages.push('multi');
    const data:Record<string,string[]>={following:(row.dataset.resourceFollowing||'').split(' '),topic:(row.dataset.resourceBroad||'').split(' ').filter(v=>!following.has(v)),type:[row.dataset.resourceType||''],place:places,language:languages};
    for(const f of facets)for(const value of new Set(data[f.key]||[]))if(value)all[f.key][value]=(all[f.key][value]||0)+1;
   });setCounts(all);
   setChoices(facets.map(f=>({...f,options:f.key==='place'||f.key==='language'?[...new Set([...f.options.map(o=>o[0]),...Object.keys(all[f.key])])].filter(v=>all[f.key][v]).sort().map(v=>[v,f.options.find(o=>o[0]===v)?.[1]||v] as [string,string]):f.options})));
  };
  refresh();const reset=()=>{setValues({});dispatch({})};document.addEventListener('watch:resource-reset',reset);document.addEventListener('watch:library-loaded',refresh);
  return()=>{document.removeEventListener('watch:resource-reset',reset);document.removeEventListener('watch:library-loaded',refresh)};
 },[]);
 const change=(key:string,next:string[])=>{const state={...values,[key]:next};setValues(state);dispatch(state)};
 return <><div className="resource-dropdowns">{choices.map(f=><Popover.Root key={f.key}><Popover.Trigger className="resource-filter-trigger">{f.label}{values[f.key]?.length>0&&<span className="resource-filter-count">{values[f.key].length}</span>}<svg className="filter-chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg></Popover.Trigger><Popover.Portal><Popover.Positioner sideOffset={8} align="start" collisionPadding={16} className="resource-filter-positioner"><Popover.Popup className="resource-filter-popup"><div className="resource-filter-heading"><Popover.Title>{f.label}</Popover.Title><Popover.Close aria-label={locale==='pmy'?'Tutup':'Close'}>×</Popover.Close></div><CheckboxGroup aria-label={f.label} value={values[f.key]||[]} onValueChange={next=>change(f.key,next)}>{f.options.map(([value,label])=><label className="resource-filter-option" key={value}><Checkbox.Root value={value} className="resource-filter-checkbox"><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Root><span>{label}</span><small>{counts[f.key]?.[value]||0}</small></label>)}</CheckboxGroup>{values[f.key]?.length>0&&<button className="resource-filter-clear" type="button" onClick={()=>change(f.key,[])}>{locale==='pmy'?'Hapus pilihan':'Clear selection'}</button>}</Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>)}</div><div className="resource-active-filters">{Object.entries(values).flatMap(([key,items])=>items.map(value=><button type="button" key={key+value} onClick={()=>change(key,items.filter(v=>v!==value))} aria-label={`${locale==='pmy'?'Hapus':'Remove'} ${choices.find(f=>f.key===key)?.options.find(o=>o[0]===value)?.[1]||value}`}>{choices.find(f=>f.key===key)?.options.find(o=>o[0]===value)?.[1]||value}<span aria-hidden="true">×</span></button>))}</div></>;
}
