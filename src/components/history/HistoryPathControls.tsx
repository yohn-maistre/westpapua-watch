import {useEffect,useRef,useState} from 'react';
import {Popover} from '@base-ui/react/popover';
import {RadioGroup} from '@base-ui/react/radio-group';
import {Radio} from '@base-ui/react/radio';
import {Toggle} from '@base-ui/react/toggle';
import type {HistoryPath} from '../../data/history-prototype';
type Path={id:HistoryPath;label:string;start:string};
type State={path:HistoryPath;mapOpen:boolean};
export default function HistoryPathControls({paths,locale}:{paths:Path[];locale:'en'|'pmy'}){
 const [state,setState]=useState<State>({path:'all',mapOpen:false}),[open,setOpen]=useState(false),selected=useRef(false);
 useEffect(()=>{const receive=(e:Event)=>setState((e as CustomEvent<State>).detail);document.addEventListener('watch:history-state',receive);document.dispatchEvent(new CustomEvent('watch:history-state-request'));return()=>document.removeEventListener('watch:history-state',receive)},[]);
 const index=paths.findIndex(p=>p.id===state.path);
 const menuPaths=[...paths.filter(p=>p.id==='all'),...paths.filter(p=>p.id!=='all')];
 const choose=(path:HistoryPath)=>{selected.current=true;setOpen(false);document.dispatchEvent(new CustomEvent('watch:history-select',{detail:{path}}))};
 return <div className="prototype-path-control" data-history-controls>
  <Popover.Root open={open} onOpenChange={value=>{if(value)selected.current=false;setOpen(value)}}>
   <Popover.Trigger data-path-index-open className="prototype-path-name"><span data-active-path>{paths[index].label}</span><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4 3 3 3-3" fill="none" stroke="currentColor"/></svg></Popover.Trigger>
   <Popover.Portal><Popover.Positioner align="start" sideOffset={8} collisionPadding={12} className="history-path-positioner"><Popover.Popup data-path-popup className="history-path-popup" finalFocus={()=>selected.current?false:true}>
    <Popover.Title className="sr-only">{locale==='en'?'History paths':'Jalur sejarah'}</Popover.Title>
    <RadioGroup aria-label={locale==='en'?'History paths':'Jalur sejarah'} value={state.path} onValueChange={value=>choose(value as HistoryPath)}>
     {menuPaths.map(p=><label className="history-path-option" key={p.id}><Radio.Root value={p.id} className="history-path-radio"><Radio.Indicator/></Radio.Root><strong>{p.label}</strong>{p.id!=='all'&&<span className="history-path-context">{p.start}</span>}</label>)}
    </RadioGroup>
   </Popover.Popup></Popover.Positioner></Popover.Portal>
  </Popover.Root>
  <Toggle className="prototype-map-toggle" data-history-map-toggle pressed={state.mapOpen} onPressedChange={value=>document.dispatchEvent(new CustomEvent('watch:history-map-toggle',{detail:{open:value}}))} aria-label={locale==='en'?(state.mapOpen?'Hide map':'Show map'):(state.mapOpen?'Sembunyikan peta':'Lihat peta')} aria-expanded={state.mapOpen} aria-controls="history-context-map">
   <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/></svg>
  </Toggle>
 </div>;
}
