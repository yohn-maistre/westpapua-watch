import type {HistoryPath} from '../data/history-prototype';
import {projectHistoryPoint} from './map/history-projection';
type Place={label:string;longitude:number;latitude:number;note:string;source:string};
type Panel={id:string;label:string;paths:HistoryPath[];recordIds:string[];places:Place[]};
type Chapter={id:string;era:string;date:string;main:boolean;kind:string;panels:Panel[]};
type ReaderData={chapters:Chapter[];paths:{id:HistoryPath;label:string}[];eras:{id:string;label:string}[]};

export function initHistoryPrototype(){
 const root=document.querySelector<HTMLElement>('[data-history-prototype]');if(!root)return;
 document.documentElement.classList.add('history-reading-page');
 const data=JSON.parse(root.querySelector('[data-history-prototype-data]')!.textContent!) as ReaderData;
 const reader=root.querySelector<HTMLElement>('[data-history-reader]')!;
 const margin=root.querySelector<HTMLElement>('.prototype-margin')!;
 const map=root.querySelector<HTMLElement>('[data-context=history]')!;
 const live=root.querySelector<HTMLElement>('[data-history-live-map]')!;
 const stage=root.querySelector<HTMLElement>('[data-history-visual-stage]')!;
 const mobile=matchMedia('(max-width:760px)');
 const chapterById=new Map(data.chapters.map(c=>[c.id,c]));
 const sceneById=new Map([...root.querySelectorAll<HTMLElement>('[data-history-scene]')].map(s=>[s.id,s]));
 const panelsById=new Map([...root.querySelectorAll<HTMLElement>('[data-history-panel]')].map(s=>[s.dataset.historyPanel!,s]));
 const visualByPanel=new Map([...panelsById].map(([id,node])=>[id,node.querySelector<HTMLElement>('[data-history-visuals]')]));
 let stagedPanel:string|null=null,renderedPlaces:string|null=null,observedGeometry='',urlTimer:ReturnType<typeof setTimeout>|undefined;
 const accountLocation=new Map<string,{chapter:Chapter;panel:Panel}>();
 data.chapters.forEach(c=>c.panels.forEach(p=>{
  p.recordIds.forEach(id=>accountLocation.set(id,{chapter:c,panel:p}));
  // A reference opened in a new tab must reveal its owning perspective too.
  panelsById.get(p.id)!.querySelectorAll<HTMLElement>('.history-source-entry[id]').forEach(row=>accountLocation.set(row.id,{chapter:c,panel:p}));
 }));
 const dateLinks=[...root.querySelectorAll<HTMLElement>('[data-history-date]')];
 const selectedPanels=new Map<string,string>();
 let active:HistoryPath='all',current=data.chapters[0],currentPanel=current.panels[0];
 let visible=data.chapters.filter(c=>c.main),observer:IntersectionObserver|null=null,suppress=false,initializing=true,readingMoved=false,preserveHash=false,geometryFrame=0;
 const recordsFor=(path:HistoryPath)=>data.chapters.filter(c=>path==='all'?c.main:c.panels.some(p=>p.paths.includes(path)));
 const emitState=()=>document.dispatchEvent(new CustomEvent('watch:history-state',{detail:{path:active,mapOpen:reader.dataset.mapOpen==='true'}}));
 document.addEventListener('watch:history-state-request',emitState);
 function write(push=false,hash=current.id){
  if(preserveHash&&!push)return;
  clearTimeout(urlTimer);
  const url=new URL(location.href);url.searchParams.set('path',active);
  if(currentPanel.id===current.panels[0].id)url.searchParams.delete('view');else url.searchParams.set('view',currentPanel.id);
  url.hash=hash;history[push?'pushState':'replaceState']({path:active,chapter:current.id,panel:currentPanel.id},'',url);
 }
 function chosen(c:Chapter){const remembered=c.panels.find(p=>p.id===selectedPanels.get(c.id));return remembered||(active==='all'?c.panels[0]:c.panels.find(p=>p.paths.includes(active)))||c.panels[0]}
 function showPanel(c:Chapter,p:Panel){
  selectedPanels.set(c.id,p.id);c.panels.forEach(other=>panelsById.get(other.id)!.hidden=other.id!==p.id);
  const scene=sceneById.get(c.id)!,i=c.panels.indexOf(p),previous=c.panels[(i-1+c.panels.length)%c.panels.length],next=c.panels[(i+1)%c.panels.length];
  const update=(selector:string,text:string)=>{const n=scene.querySelector(selector);if(n)n.textContent=text};
  update('[data-history-local-label]',p.label);update('[data-history-previous-label]',previous.label);update('[data-history-next-label]',next.label);
  scene.querySelector('[data-history-local-previous]')?.setAttribute('aria-label',`${root.dataset.locale==='pmy'?'Lihat':'View'} ${previous.label}`);
  scene.querySelector('[data-history-local-next]')?.setAttribute('aria-label',`${root.dataset.locale==='pmy'?'Lihat':'View'} ${next.label}`);
 }
 function updatePlaces(panel:Panel){
  if(mobile.matches&&reader.dataset.mapOpen!=='true'&&!map.classList.contains('map-expanded'))return;
  const key=current.id+':'+panel.id;if(renderedPlaces===key)return;renderedPlaces=key;
  root.querySelector('[data-history-map-date]')!.textContent=current.date;
  root.querySelector('[data-history-map-places]')!.textContent=panel.places.map(p=>p.label).join(' · ');
  const points=root.querySelector<HTMLElement>('[data-history-atlas-points]')!;points.replaceChildren();
  root.querySelector<HTMLElement>('[data-history-atlas-note]')!.hidden=true;
  for(const place of panel.places){
   const {x,y}=projectHistoryPoint(place.longitude,place.latitude);if(x<0||x>100||y<0||y>100)continue;
   const button=document.createElement('button');button.type='button';button.className='history-atlas-point';button.style.left=`${x}%`;button.style.top=`${y}%`;button.setAttribute('aria-label',place.label);button.setAttribute('aria-expanded','false');
   button.addEventListener('click',()=>{const note=root.querySelector<HTMLElement>('[data-history-atlas-note]')!;const wasOpen=!note.hidden&&button.getAttribute('aria-expanded')==='true';points.querySelectorAll('button').forEach(b=>b.setAttribute('aria-expanded','false'));note.hidden=wasOpen;if(wasOpen)return;button.setAttribute('aria-expanded','true');note.querySelector('[data-history-place-name]')!.textContent=place.label;note.querySelector('[data-history-place-note]')!.textContent=place.note;const source=note.querySelector<HTMLAnchorElement>('[data-history-place-source]')!;source.href=place.source;source.hidden=!place.source;});
   points.append(button);
  }
  map.dataset.historyFeatures=JSON.stringify({type:'FeatureCollection',features:panel.places.map(p=>({type:'Feature',geometry:{type:'Point',coordinates:[p.longitude,p.latitude]},properties:{name:p.label,note:p.note,source:p.source}}))});
  map.dataset.historyPeriod=current.date;
  // A hidden atlas never receives renderer work; activation reads the latest context.
  if(map.classList.contains('map-expanded'))map.dispatchEvent(new CustomEvent('watch:history-context'));
 }
 function setCurrent(c:Chapter,p=chosen(c),writeURL=false,force=false){
  if(!force&&current.id===c.id&&currentPanel.id===p.id)return;
  current=c;currentPanel=p;
  root.querySelector('[data-active-era]')!.textContent=data.eras.find(e=>e.id===c.era)!.label;
  dateLinks.forEach(a=>{const record=chapterById.get(a.dataset.historyDate!)!;a.hidden=!visible.includes(record)||record.era!==c.era;a.setAttribute('aria-current',String(record.id===c.id))});
  if(stagedPanel&&(mobile.matches||stagedPanel!==p.id)){
   const previous=visualByPanel.get(stagedPanel);const host=panelsById.get(stagedPanel)!;
   if(previous)host.insertBefore(previous,host.querySelector('.history-account-part'));stagedPanel=null;
  }
  if(!mobile.matches&&stagedPanel!==p.id){const visual=visualByPanel.get(p.id);if(visual){stage.append(visual);stagedPanel=p.id}}
  updatePlaces(p);if(writeURL){clearTimeout(urlTimer);urlTimer=setTimeout(()=>write(),500)}
 }
 function observe(){
  const nav=document.querySelector<HTMLElement>('[data-compact-nav]')!.getBoundingClientRect().height;
  const anchor=Math.min(innerHeight-2,nav+(mobile.matches?margin.getBoundingClientRect().height:40)+24);
  const key=`${anchor}:${innerHeight}:${visible.map(c=>c.id).join(',')}`;if(key===observedGeometry)return;observedGeometry=key;
  observer?.disconnect();
  observer=new IntersectionObserver(entries=>{if(suppress||initializing||!readingMoved)return;const selected=entries.find(e=>e.isIntersecting);if(!selected)return;const c=chapterById.get(selected.target.id)!;if(visible.includes(c))setCurrent(c,chosen(c),true)}, {rootMargin:`-${anchor}px 0px -${Math.max(0,innerHeight-anchor-2)}px 0px`,threshold:0});
  visible.forEach(c=>observer!.observe(sceneById.get(c.id)!));
 }
 function geometry(){if(geometryFrame)return;geometryFrame=requestAnimationFrame(()=>{geometryFrame=0;const height=margin.getBoundingClientRect().height;if(root.style.getPropertyValue('--reader-control-height')!==`${height}px`)root.style.setProperty('--reader-control-height',`${height}px`);observe()})}
 function nearest(path:HistoryPath){const options=recordsFor(path),same=options.filter(c=>c.era===current.era);const candidates=same.length?same:options;return [...candidates].sort((a,b)=>Math.abs(data.chapters.indexOf(a)-data.chapters.indexOf(current))-Math.abs(data.chapters.indexOf(b)-data.chapters.indexOf(current)))[0]}
 function select(path:HistoryPath,targetId?:string,options:{push?:boolean;scroll?:boolean;panelId?:string}={}){
  clearTimeout(urlTimer);
  const located=targetId?accountLocation.get(targetId):undefined;
  let target=targetId?chapterById.get(targetId)||located?.chapter:undefined;
  if(target&&path==='all'&&!target.main){const paths=located?.panel.paths||target.panels[0].paths;path=paths.includes('archaeology')?'archaeology':paths[0]}
  visible=recordsFor(path);if(!target||!visible.includes(target))target=visible[0];
  active=path;suppress=true;readingMoved=false;
  const chosenPanel=target.panels.find(p=>p.id===options.panelId)||(located?.chapter===target?located.panel:undefined)||(path==='all'?target.panels[0]:target.panels.find(p=>p.paths.includes(path)))||target.panels[0];
  selectedPanels.clear();visible.forEach(c=>showPanel(c,c===target?chosenPanel:chosen(c)));
  const dated=visible.filter(c=>!['context','orientation','living','undated'].includes(c.kind));
  sceneById.forEach((s,id)=>{const c=chapterById.get(id)!;s.hidden=!visible.includes(c);s.dataset.first=String(c===dated[0]);s.dataset.last=String(c===dated.at(-1))});
  root.querySelectorAll<HTMLElement>('[data-history-path]').forEach(a=>a.setAttribute('aria-current',String(a.dataset.historyPath===active)));
  setCurrent(target,chosenPanel,false,true);emitState();
  if(options.push){preserveHash=false;write(true,targetId||target.id)}
  if(options.scroll){const node=(targetId?document.getElementById(targetId):null)||sceneById.get(target.id)!;const nav=document.querySelector<HTMLElement>('[data-compact-nav]')!.getBoundingClientRect().height;scrollTo({top:scrollY+node.getBoundingClientRect().top-nav-(mobile.matches?margin.getBoundingClientRect().height:0)-16,behavior:'instant'});if(options.push){const heading=panelsById.get(chosenPanel.id)!.querySelector<HTMLElement>('h2')!;heading.tabIndex=-1;heading.focus({preventScroll:true})}}
  root.querySelector('[data-history-announcement]')!.textContent=`${data.paths.find(p=>p.id===active)!.label} · ${target.date}`;
  requestAnimationFrame(()=>{suppress=false;geometry()});
 }
 root.addEventListener('click',event=>{
  const e=event as MouseEvent;const node=e.target instanceof Element?e.target:null;if(!node)return;
  const link=node.closest<HTMLAnchorElement>('[data-history-path]');if(link&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();select(link.dataset.historyPath as HistoryPath,link.dataset.targetEvent,{push:true,scroll:true});return}
  const local=node.closest<HTMLElement>('[data-history-local-previous],[data-history-local-next]');if(local){const c=chapterById.get(local.closest('[data-history-scene]')!.id)!,p=chosen(c),index=c.panels.indexOf(p);const next=c.panels[(index+(local.hasAttribute('data-history-local-previous')?-1:1)+c.panels.length)%c.panels.length];showPanel(c,next);setCurrent(c,next,false,true);const scene=sceneById.get(c.id)!,nav=document.querySelector<HTMLElement>('[data-compact-nav]')!.getBoundingClientRect().height;scrollTo({top:scrollY+scene.getBoundingClientRect().top-nav-(mobile.matches?margin.getBoundingClientRect().height:0)-16,behavior:'instant'});preserveHash=false;write(true);root.querySelector('[data-history-announcement]')!.textContent=`${c.date} · ${next.label}`;geometry();return}
  const citation=node.closest<HTMLAnchorElement>('[data-history-citation]');if(citation&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();const target=document.getElementById(citation.hash.slice(1))!;target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'nearest'});return}
  const date=node.closest<HTMLElement>('[data-history-date]');if(date){e.preventDefault();select(active,date.dataset.historyDate,{push:true,scroll:true});}
 });
 root.querySelectorAll('[data-history-local-topics]').forEach(control=>control.addEventListener('keydown',event=>{const e=event as KeyboardEvent;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();control.querySelector<HTMLButtonElement>(e.key==='ArrowLeft'?'[data-history-local-previous]':'[data-history-local-next]')!.click()}}));
 document.addEventListener('watch:history-select',event=>{const path=(event as CustomEvent<{path:HistoryPath}>).detail.path;select(path,nearest(path).id,{push:true,scroll:true})});
 document.addEventListener('watch:history-map-toggle',event=>{reader.dataset.mapOpen=String((event as CustomEvent<{open:boolean}>).detail.open);updatePlaces(currentPanel);emitState();geometry()});
 root.querySelector('[data-history-place-close]')!.addEventListener('click',()=>{root.querySelector<HTMLElement>('[data-history-atlas-note]')!.hidden=true;root.querySelectorAll('[data-history-atlas-points] button').forEach(b=>b.setAttribute('aria-expanded','false'))});
 root.querySelector('[data-history-atlas-expand]')!.addEventListener('click',()=>{live.hidden=false;renderedPlaces=null;map.dataset.mapStartExpanded='true';map.dataset.historyFeatures=JSON.stringify({type:'FeatureCollection',features:currentPanel.places.map(p=>({type:'Feature',geometry:{type:'Point',coordinates:[p.longitude,p.latitude]},properties:{name:p.label,note:p.note,source:p.source}}))});map.dataset.historyPeriod=current.date;map.dispatchEvent(new CustomEvent('watch:map-activate'));});
 map.addEventListener('watch:map-collapsed',()=>{live.hidden=true;root.querySelector<HTMLButtonElement>('[data-history-atlas-expand]')!.focus({preventScroll:true})});
 function fromURL(){const url=new URL(location.href);const path=data.paths.some(p=>p.id===url.searchParams.get('path'))?url.searchParams.get('path') as HistoryPath:'all';let hash='';try{hash=decodeURIComponent(url.hash.slice(1))}catch{}const known=chapterById.has(hash)||accountLocation.has(hash);preserveHash=!!hash&&!known;select(path,known?hash:undefined,{scroll:known,panelId:url.searchParams.get('view')||undefined});}
 root.dataset.enhanced='true';fromURL();
 const loaded=document.readyState==='complete'?Promise.resolve():new Promise<void>(resolve=>addEventListener('load',()=>resolve(),{once:true}));
 const island=root.querySelector('[data-history-controls]')?.closest('astro-island');
 const controlsReady=!island?.hasAttribute('ssr')?Promise.resolve():new Promise<void>(resolve=>island.addEventListener('astro:hydrate',()=>resolve(),{once:true}));
 Promise.all([loaded.then(()=>document.fonts.ready),controlsReady]).then(()=>requestAnimationFrame(()=>{fromURL();requestAnimationFrame(()=>{initializing=false;geometry()})}));
 new ResizeObserver(geometry).observe(margin);new ResizeObserver(geometry).observe(document.querySelector('[data-compact-nav]')!);
 mobile.addEventListener('change',()=>{setCurrent(current,currentPanel,false,true);geometry()});
 addEventListener('resize',geometry,{passive:true});addEventListener('popstate',fromURL);
 // Layout and native hash restoration do not represent a new reading choice.
 // Start scroll tracking when the reader actually scrolls, using touch, wheel,
 // keyboard or a scrollbar. Explicit navigation already sets its own chapter.
 const intent=()=>{preserveHash=false;readingMoved=true};
 for(const type of ['wheel','touchmove'])addEventListener(type,intent,{passive:true});
 addEventListener('keydown',e=>{if(['PageDown','PageUp','Home','End',' '].includes(e.key)&&!(e.target instanceof Element&&e.target.closest('input,textarea,[contenteditable=true]')))intent()});
 addEventListener('pointerdown',e=>{if(e.clientX>=innerWidth-16)intent()},{passive:true});
}
