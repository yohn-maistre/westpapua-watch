import {useEffect,useState} from 'react';
import {Popover} from '@base-ui/react/popover';
import {Checkbox} from '@base-ui/react/checkbox';
import {CheckboxGroup} from '@base-ui/react/checkbox-group';
import '../../styles/resource-filters.css';
type Facet={key:string;label:string;options:[string,string,string?][]};
export default function ResourceFilters({facets,locale}:{facets:Facet[];locale:string}){
 const [values,setValues]=useState<Record<string,string[]>>({});
 useEffect(()=>{const p=new URL(location.href).searchParams;const initial=Object.fromEntries(facets.map(f=>[f.key,(p.get(f.key)||'').split(',').filter(v=>f.options.some(o=>o[0]===v))]));setValues(initial);dispatch(initial);const reset=()=>{setValues({});dispatch({})};document.addEventListener('watch:resource-reset',reset);return()=>document.removeEventListener('watch:resource-reset',reset)},[]);
 const dispatch=(next:Record<string,string[]>)=>document.dispatchEvent(new CustomEvent('watch:resource-filter',{detail:next}));
 const change=(key:string,next:string[])=>{const state={...values,[key]:next};setValues(state);dispatch(state)};
 return <div className="resource-dropdowns">{facets.map(f=><Popover.Root key={f.key}><Popover.Trigger className="resource-filter-trigger">{f.label}{values[f.key]?.length>0&&<span className="resource-filter-count">{values[f.key].length}</span>}<svg className="filter-chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg></Popover.Trigger><Popover.Portal><Popover.Positioner sideOffset={8} align="start" collisionPadding={16} className="resource-filter-positioner"><Popover.Popup className="resource-filter-popup"><div className="resource-filter-heading"><Popover.Title>{f.label}</Popover.Title><Popover.Close aria-label={locale==='pmy'?'Tutup':'Close'}>×</Popover.Close></div><CheckboxGroup aria-label={f.label} value={values[f.key]||[]} onValueChange={next=>change(f.key,next)}>{f.options.map(([value,label,group],index)=><div key={value}>{group&&group!==f.options[index-1]?.[2]&&<h3 className="filter-group-title">{group}</h3>}<label className="resource-filter-option" key={value}><Checkbox.Root value={value} className="resource-filter-checkbox"><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Root><span>{label}</span></label></div>)}</CheckboxGroup><button className="resource-filter-clear" type="button" onClick={()=>change(f.key,[])}>{locale==='pmy'?'Hapus pilihan':'Clear selection'}</button></Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>)}</div>
}
