import type {HistoryPath,HistoryPlace} from '../data/history-prototype';
type Scene={id:string;year:number;era:string;paths:HistoryPath[];date:string;places:HistoryPlace[]};
export function initHistoryPrototype(){
  const root=document.querySelector<HTMLElement>('[data-history-prototype]');if(!root)return;
  const data=JSON.parse(root.querySelector('[data-history-prototype-data]')!.textContent!) as {records:Scene[];paths:{id:HistoryPath;label:string}[];eras:{id:string;label:string}[]};
  const reader=root.querySelector<HTMLElement>('[data-history-reader]')!;
  const controls=root.querySelector<HTMLElement>('[data-history-controls]')!;
  const map=root.querySelector<HTMLElement>('[data-context=history]')!;
  const mobile=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const scenes=[...root.querySelectorAll<HTMLElement>('[data-history-scene]')];
  let active:HistoryPath='all',current:Scene=data.records[0],frame=0,suppressURL=false,starting=true;
  const recordsFor=(path:HistoryPath)=>data.records.filter(r=>path==='all'||r.paths.includes(path));
  const label=(path:HistoryPath)=>data.paths.find(p=>p.id===path)!.label;
  function nearest(path:HistoryPath){const options=recordsFor(path),same=options.filter(r=>r.era===current.era);return [...(same.length?same:options)].sort((a,b)=>Math.abs(a.year-current.year)-Math.abs(b.year-current.year))[0]}
  function write(path:HistoryPath,id:string,push=false){const url=new URL(location.href);url.searchParams.set('path',path);url.hash=id;history[push?'pushState':'replaceState']({historyPath:path,event:id},'',url)}
  function emitState(){document.dispatchEvent(new CustomEvent('watch:history-state',{detail:{path:active,mapOpen:reader.dataset.mapOpen==='true'}}))}
  document.addEventListener('watch:history-state-request',emitState);
  function setCurrent(record:Scene,writeURL=false){
    current=record;
    root.querySelector('[data-active-era]')!.textContent=data.eras.find(e=>e.id===record.era)!.label;
    root.querySelector('[data-history-map-date]')!.textContent=record.date;
    root.querySelector('[data-history-map-places]')!.textContent=record.places.map(p=>p.label).join(' · ')||(root.dataset.locale==='pmy'?'Nugini':'New Guinea');
    root.querySelectorAll<HTMLElement>('[data-history-date]').forEach(a=>{const r=data.records.find(r=>r.id===a.dataset.historyDate)!;a.hidden=!recordsFor(active).includes(r)||r.era!==record.era;a.setAttribute('aria-current',String(r.id===record.id))});
    map.dataset.historyFeatures=JSON.stringify({type:'FeatureCollection',features:record.places.map(p=>({type:'Feature',geometry:{type:'Point',coordinates:[p.longitude,p.latitude]},properties:{name:p.label}}))});
    const plate=map.querySelector('[data-history-map-points]')!;plate.replaceChildren();
    for(const p of record.places){const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('cx',String((p.longitude-128)/15*600));dot.setAttribute('cy',String((2-p.latitude)/13*380));dot.setAttribute('r','8');dot.setAttribute('fill','#8674b3');dot.setAttribute('stroke','#f5f3ec');dot.setAttribute('stroke-width','3');plate.append(dot)}
    map.dataset.historyPeriod=record.date;map.dispatchEvent(new CustomEvent('watch:history-context'));
    emitState();
    if(writeURL&&!suppressURL)write(active,record.id);
  }
  function lineGeometry(){const visible=scenes.filter(s=>!s.hidden);visible.forEach((s,i)=>{const next=visible[i+1];s.dataset.last=String(!next);if(next)s.style.setProperty('--next-node-y',`${parseFloat(getComputedStyle(next,'::before').top)+6.5}px`)})}
  function select(path:HistoryPath,id?:string,push=true,scroll=true){
    const options=recordsFor(path);const target=options.find(r=>r.id===id)||options[0];
    active=path;scenes.forEach(s=>s.hidden=!options.some(r=>r.id===s.id));
    root.querySelectorAll<HTMLElement>('[data-history-path]').forEach(a=>a.setAttribute('aria-current',String(a.dataset.historyPath===path)));
    setCurrent(target);lineGeometry();
    if(push)write(path,target.id,true);
    if(scroll){suppressURL=true;const position=()=>{const nav=document.querySelector('[data-compact-nav]')!.getBoundingClientRect().height;const toolbar=mobile.matches?root.querySelector('.prototype-margin')!.getBoundingClientRect().height:0;const scene=document.getElementById(target.id)!;scrollTo({top:scrollY+scene.getBoundingClientRect().top-nav-toolbar-16,behavior:'instant'})};position();requestAnimationFrame(()=>requestAnimationFrame(()=>{if(active===path){position();setCurrent(target)}suppressURL=false}));if(push){const heading=document.getElementById(target.id)!.querySelector<HTMLElement>('h2')!;heading.tabIndex=-1;heading.focus({preventScroll:true})}if(!reduced.matches)root.querySelector('[data-history-scenes]')!.animate([{opacity:.7,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'})}
    root.querySelector('[data-history-announcement]')!.textContent=`${label(path)} · ${target.date}`;
  }
  root.querySelectorAll<HTMLAnchorElement>('[data-history-path]').forEach(a=>a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();const path=a.dataset.historyPath as HistoryPath;select(path,a.dataset.targetEvent||(a.hasAttribute('data-keep-period')?nearest(path).id:undefined))}));
  document.addEventListener('watch:history-select',event=>{const path=(event as CustomEvent<{path:HistoryPath}>).detail.path;if(data.paths.some(p=>p.id===path))select(path,nearest(path).id)});
  document.addEventListener('watch:history-map-toggle',event=>{const open=(event as CustomEvent<{open:boolean}>).detail.open,selected=current;suppressURL=true;reader.dataset.mapOpen=String(open);map.dispatchEvent(new CustomEvent('watch:history-context'));syncHeight();emitState();if(mobile.matches){requestAnimationFrame(()=>requestAnimationFrame(()=>select(active,selected.id,false)))}else suppressURL=false});
  function syncHeight(){root.style.setProperty('--reader-control-height',`${Math.ceil(root.querySelector('.prototype-margin')!.getBoundingClientRect().height)}px`);lineGeometry()}
  new ResizeObserver(syncHeight).observe(root.querySelector('.prototype-margin')!);
  function fromURL(){const url=new URL(location.href),wanted=url.searchParams.get('path') as HistoryPath;const path=data.paths.some(p=>p.id===wanted)?wanted:'all';const id=decodeURIComponent(url.hash.slice(1));select(path,id,false,Boolean(id))}
  controls.hidden=false;root.dataset.enhanced='true';const initialHref=location.href;fromURL();document.fonts.ready.then(()=>{if(location.href===initialHref)fromURL();starting=false});
  addEventListener('popstate',fromURL);
  addEventListener('resize',syncHeight,{passive:true});
  addEventListener('scroll',()=>{if(frame||starting||suppressURL)return;frame=requestAnimationFrame(()=>{frame=0;const top=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--compact-nav-actual-height'))||100;const anchor=top+(mobile.matches?root.querySelector('.prototype-margin')!.getBoundingClientRect().height:40)+25;const visible=scenes.filter(s=>!s.hidden);const selected=visible.find(s=>{const r=s.getBoundingClientRect();return r.top<=anchor&&r.bottom>anchor});if(selected&&selected.id!==current.id)setCurrent(data.records.find(r=>r.id===selected.id)!,true)})},{passive:true});
  root.querySelectorAll<HTMLAnchorElement>('[data-history-date]').forEach(a=>a.addEventListener('click',()=>{const record=data.records.find(r=>r.id===a.dataset.historyDate);if(record)setCurrent(record,true)}));
}
