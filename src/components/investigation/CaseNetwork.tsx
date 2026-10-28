import {memo,useEffect,useId,useMemo,useRef,useState} from 'react';
import type {InvestigativeRecord,RecordCase,RecordClaim,RelationCategory} from '../../data/investigative-record';
import type {Locale} from '../../data/types';
import {networkModel,networkFamily,networkLines,edgePath} from '../../lib/investigation-network';
import type {NetworkNode} from '../../lib/investigation-network';
import {WorkIcon} from './WorkIcon';

type Props={data:InvestigativeRecord;dossier:RecordCase;claims:RecordClaim[];locale:Locale;claimId:string;entityId:string;sourceId?:string;lens?:RelationCategory;scope?:string;selectClaim:(id:string)=>void;selectEntity:(id:string)=>void;selectDocument:(id:string)=>void;expanded?:boolean;suspended?:boolean};
export default memo(function CaseNetwork({data,dossier,claims,locale,claimId,entityId,sourceId,lens,scope,selectClaim,selectEntity,selectDocument,expanded=false,suspended=false}:Props){
 const en=locale==='en',l=(a:string,b:string)=>en?a:b,root=useRef<HTMLDivElement>(null),svg=useRef<SVGSVGElement>(null),layer=useRef<SVGGElement>(null),uid=useId().replace(/:/g,'');
 const [size,setSize]=useState({width:1000,height:650}),[hover,setHover]=useState(''),[names,setNames]=useState(false),[zoom,setZoom]=useState(1);
 const model=useMemo(()=>networkModel(data,dossier,claims,size.width,size.height,{settle:false,positions:data.networkLayouts?.[scope==='all'?'all':dossier.id+(scope==='related'?':related':'')]?.[size.width<650?'phone':'desktop']}),[data,dossier,claims,size.width,size.height,scope]);
 const positions=useMemo(()=>new Map(model.nodes.map(n=>[n.id,n])),[model]),entities=useMemo(()=>new Map(data.entities.map(e=>[e.id,e])),[data.entities]);
 const pan=useRef({x:0,y:0}),zoomRef=useRef(1),drag=useRef<{id:string;claim?:string;x:number;y:number;px:number;py:number}|null>(null),moved=useRef(false),pointers=useRef(new Map<number,{x:number;y:number}>()),pinch=useRef<{distance:number;zoom:number}|null>(null),drawRef=useRef(()=>{}),runRef=useRef(()=>{}),reduced=useRef(false),inactive=useRef(suspended);
 inactive.current=suspended;
 const selected=claims.find(c=>c.id===claimId),active=hover||entityId,neighbours=new Set(active?claims.filter(c=>c.subject===active||c.object===active).flatMap(c=>[c.subject,c.object]):[]);
 const keyIds=useMemo(()=>new Set([...model.nodes].sort((a,b)=>b.degree-a.degree||a.id.localeCompare(b.id)).slice(0,size.width<650?5:12).map(n=>n.id)),[model,size.width]);
 const pairs=useMemo(()=>new Map(claims.map(c=>{const same=claims.filter(k=>(k.subject===c.subject&&k.object===c.object)||(k.subject===c.object&&k.object===c.subject));return[c.id,(same.indexOf(c)-(same.length-1)/2)*1.1]})),[claims]);
 const docs=useMemo(()=>{const current=sourceId?[sourceId]:(selected?[selected]:entityId?claims.filter(c=>c.subject===entityId||c.object===entityId):claims).flatMap(c=>c.evidence.map(e=>e.source));const contextual=[...new Set(claims.flatMap(c=>c.evidence.map(e=>e.source)))].sort((a,b)=>Number(!!data.sources.find(s=>s.id===b)?.preview)-Number(!!data.sources.find(s=>s.id===a)?.preview));return [...new Set([...current,...contextual])].slice(0,3).map(id=>data.sources.find(s=>s.id===id)!)},[data.sources,claims,selected,entityId,sourceId]);
 const transform=()=> 'translate('+pan.current.x+' '+pan.current.y+') translate('+size.width/2+' '+size.height/2+') scale('+zoomRef.current+') translate('+-size.width/2+' '+-size.height/2+')';
 function zoomTo(value:number){zoomRef.current=Math.max(.65,Math.min(3.5,value));setZoom(zoomRef.current);layer.current?.setAttribute('transform',transform())}
 useEffect(()=>{
  const el=svg.current;if(!el)return;
  const observer=new ResizeObserver(()=>{const rect=el.getBoundingClientRect();setSize(old=>Math.abs(rect.width-old.width)>1||Math.abs(rect.height-old.height)>1?{width:Math.round(rect.width),height:Math.round(rect.height)}:old)});
  observer.observe(el);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  const el=root.current!;const sim=model.simulation,q=matchMedia('(prefers-reduced-motion:reduce)');
  let timer:ReturnType<typeof setTimeout>|undefined,raf=0,visible=false,entered=false,disposed=false,lastDraw=0,measurements=new WeakMap<SVGTextElement,DOMRect>();
  const nodes=[...el.querySelectorAll<SVGGElement>('[data-network-node]')],claimMap=new Map(claims.map(c=>[c.id,c])),edges=[...el.querySelectorAll<SVGPathElement>('[data-edge-path]')].map(path=>({path,claim:claimMap.get(path.dataset.edgePath!)!}));
  function draw(){
   raf=0;lastDraw=performance.now();for(const g of nodes){const n=positions.get(g.dataset.networkNode!)!;g.setAttribute('transform','translate('+n.x+' '+n.y+')')}
   for(const {path,claim:c} of edges)path.setAttribute('d',edgePath(positions.get(c.subject)!,positions.get(c.object)!,pairs.get(c.id)));
   // Place actual text bounds, not just node circles, without covering other names.
   const occupied:{x:number;y:number;w:number;h:number}[]=[];
   const labels=nodes.flatMap(g=>{const text=g.querySelector<SVGTextElement>('.network-node-name');if(text&&!measurements.has(text))measurements.set(text,text.getBBox());return text?[{g,text,n:positions.get(g.dataset.networkNode!)!}]:[]}).sort((a,b)=>Number(b.g.classList.contains('is-selected'))-Number(a.g.classList.contains('is-selected'))||b.n.degree-a.n.degree);
   for(const {text,n,g} of labels){
    const b=measurements.get(text)!,w=b.width,h=b.height,x=n.x!,y=n.y!;
    const options=[[x-w/2,y+14],[x-w/2,y-h-14],[x+14,y-h/2],[x-w-14,y-h/2],[x-w*.15,y+14],[x-w*.85,y+14]];
    let placed=false;for(const [a,c] of options){const r={x:Math.max(7,Math.min(size.width-w-7,a)),y:Math.max(7,Math.min(size.height-h-7,c)),w,h};if(occupied.some(p=>r.x<p.x+p.w+5&&r.x+r.w+5>p.x&&r.y<p.y+p.h+4&&r.y+r.h+4>p.y))continue;
     text.setAttribute('transform','translate('+(r.x-x-b.x)+' '+(r.y-y-b.y)+')');text.style.visibility='visible';occupied.push(r);placed=true;break;
    }
    if(!placed)text.style.visibility=g.classList.contains('is-selected')?'visible':'hidden';
   }
  }
  const stop=()=>{sim.stop();clearTimeout(timer);cancelAnimationFrame(raf);raf=0;el.dataset.networkMotion='idle';draw()};
  const run=()=>{if(reduced.current||inactive.current||!visible||document.hidden)return;clearTimeout(timer);el.dataset.networkMotion='settling';sim.alpha(.32).alphaTarget(0).restart();timer=setTimeout(stop,1400)};
  sim.on('tick',()=>{if(!raf&&performance.now()-lastDraw>(nodes.length>65?48:30))raf=requestAnimationFrame(draw)}).on('end',()=>{el.dataset.networkMotion='idle'});
  reduced.current=q.matches;const motion=()=>{reduced.current=q.matches;if(q.matches)stop()};q.addEventListener('change',motion);
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(!visible)stop();else if(!entered){entered=true;if(!data.networkLayouts)run()}},{threshold:.05});io.observe(el);
  document.fonts.ready.then(()=>{if(!disposed){measurements=new WeakMap();draw()}});
  const visibility=()=>{if(document.hidden)stop()};document.addEventListener('visibilitychange',visibility);
  drawRef.current=draw;runRef.current=run;
  pan.current={x:0,y:0};zoomRef.current=1;setZoom(1);layer.current?.setAttribute('transform',transform());draw();
  return()=>{disposed=true;stop();sim.on('tick',null).on('end',null);io.disconnect();q.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility)};
 },[model,positions,claims,pairs]);
 useEffect(()=>{if(suspended){model.simulation.stop();if(root.current)root.current.dataset.networkMotion='idle'}},[suspended,model]);
 useEffect(()=>{
  if(!expanded||!svg.current)return;
  const wheel=(event:WheelEvent)=>{event.preventDefault();const p=point(event),before=world(p),z=Math.max(.65,Math.min(3.5,zoomRef.current*Math.exp(-event.deltaY*.0015)));pan.current={x:p.x-size.width/2-z*(before.x-size.width/2),y:p.y-size.height/2-z*(before.y-size.height/2)};zoomTo(z)};
  const el=svg.current;el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);
 },[expanded,size.width,size.height]);
 function point(e:{clientX:number;clientY:number}){const box=svg.current!.getBoundingClientRect();return{x:(e.clientX-box.left)*size.width/box.width,y:(e.clientY-box.top)*size.height/box.height}}
 function world(p:{x:number;y:number}){return{x:(p.x-pan.current.x-size.width/2)/zoomRef.current+size.width/2,y:(p.y-pan.current.y-size.height/2)/zoomRef.current+size.height/2}}
 useEffect(()=>{const frame=requestAnimationFrame(()=>drawRef.current());return()=>cancelAnimationFrame(frame)},[claimId,entityId,hover,names,zoom]);
 function end(e:React.PointerEvent){pointers.current.delete(e.pointerId);pinch.current=null;const d=drag.current,wasDragged=moved.current;drag.current=null;if(d?.id){const n=positions.get(d.id);if(n){n.fx=null;n.fy=null}if(!moved.current&&e.type==='pointerup'){selectEntity(d.id);moved.current=true}if(wasDragged)runRef.current()}else if(d?.claim&&!moved.current&&e.type==='pointerup'){selectClaim(d.claim);moved.current=true}}
 function key(e:React.KeyboardEvent,fn:()=>void){if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}}
 return <div ref={root} className="case-network living-network" data-case-network data-network-motion="idle">
  <button type="button" className="network-skip" onClick={()=>{const reader=root.current?.closest('.case-investigation-grid')?.querySelector<HTMLElement>('[data-case-reader] h3');if(reader?.getClientRects().length)reader.focus();else if(sourceId)selectDocument(sourceId);else if(entityId)selectEntity(entityId);else selectClaim(claimId||claims[0].id)}}>{l('Skip network, read selected record','Lewati jaringan, baca catatan terpilih')}</button>
  <div className="case-network-legend"><span><i className="is-community"/>{l('Communities & organising','Masyarakat & pengorganisasian')}</span><span><i className="is-business"/>{l('Business & material','Usaha & barang')}</span><span><i/>{l('Authority & decisions','Kewenangan & keputusan')}</span></div>
  <svg ref={svg} className="case-network-svg" viewBox={'0 0 '+size.width+' '+size.height} role="group" aria-label={l('Investigative network. Select a person, institution or relationship.','Jaringan penelusuran. Pilih orang, lembaga, atau keterkaitan.')}
   onPointerDown={e=>{
    if(e.button!==0||(e.pointerType==='touch'&&!expanded))return;
    const targetElement=e.target as Element,edge=targetElement.closest<SVGGElement>('[data-network-claim]');if(edge&&e.pointerType!=='touch')return;
    const p=point(e);pointers.current.set(e.pointerId,p);moved.current=false;e.currentTarget.setPointerCapture(e.pointerId);
    if(pointers.current.size===2){moved.current=true;model.nodes.forEach(n=>{n.fx=null;n.fy=null});const [a,b]=[...pointers.current.values()];pinch.current={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:zoomRef.current};drag.current=null;return}
    const target=(e.target as Element).closest<SVGGElement>('[data-network-node]'),id=target?.dataset.networkNode||'',w=world(p),node=positions.get(id);
    drag.current={id,claim:edge?.dataset.networkClaim,x:p.x,y:p.y,px:pan.current.x,py:pan.current.y};if(node){node.fx=node.x;node.fy=node.y}
   }}
   onPointerMove={e=>{
    if(!pointers.current.has(e.pointerId))return;const p=point(e);pointers.current.set(e.pointerId,p);
    if(pinch.current&&pointers.current.size===2){const [a,b]=[...pointers.current.values()];moved.current=true;zoomTo(pinch.current.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.current.distance));return}
    const d=drag.current;if(!d)return;if(Math.hypot(p.x-d.x,p.y-d.y)>4)moved.current=true;
    if(d.id&&moved.current){const n=positions.get(d.id)!,w=world(p);n.fx=n.x=Math.max(15,Math.min(size.width-15,w.x));n.fy=n.y=Math.max(15,Math.min(size.height-15,w.y));drawRef.current();runRef.current()}
    else{pan.current={x:Math.max(-size.width,Math.min(size.width,d.px+p.x-d.x)),y:Math.max(-size.height,Math.min(size.height,d.py+p.y-d.y))};layer.current?.setAttribute('transform',transform())}
   }} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
   onClickCapture={e=>{if(moved.current){e.preventDefault();e.stopPropagation();moved.current=false}}}>
   <defs><marker id={uid+'arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1 9 5 1 9" fill="none" stroke="context-stroke" strokeWidth="1.4"/></marker></defs>
   <g ref={layer} transform={transform()}>
    <g className="network-clusters" aria-hidden="true">{model.titles.map((title,i)=><g key={i}><ellipse cx={model.anchors[i][0]} cy={model.anchors[i][1]} rx={size.width*.22} ry={size.height*.2} className={'network-cluster-field cluster-'+i}/><text x={model.anchors[i][0]-size.width*.18} y={model.anchors[i][1]-size.height*.20}>{title[locale]}</text></g>)}</g>
    {claims.map(c=>{const a=positions.get(c.subject)!,b=positions.get(c.object)!,chosen=c.id===claimId||!!sourceId&&c.evidence.some(e=>e.source===sourceId),related=active&&(c.subject===active||c.object===active),dim=(active&&!related)||(lens&&c.category!==lens);const path=edgePath(a,b,pairs.get(c.id));return <g key={c.id} className={'case-network-edge'+(chosen?' is-selected':'')+(related?' is-related':'')+(dim?' is-dim':'')} data-network-claim={c.id} role="button" tabIndex={0} aria-label={c.title[locale]} aria-pressed={chosen} onClick={()=>selectClaim(c.id)} onKeyDown={e=>key(e,()=>selectClaim(c.id))}>
     <title>{c.predicate[locale]+' · '+c.date}</title><path className="case-edge-hit" data-edge-path={c.id} d={path}/><path className={'case-edge-line relation-'+c.category} data-edge-path={c.id} markerEnd={'url(#'+uid+'arrow)'} d={path}/>
    </g>})}
    {model.nodes.map(n=>{const entity=entities.get(n.id)!,chosen=entityId===n.id||selected?.subject===n.id||selected?.object===n.id;const dim=(active&&!neighbours.has(n.id))||(lens&&!claims.some(c=>c.category===lens&&(c.subject===n.id||c.object===n.id)));const label=names||chosen||(!model.dense&&model.nodes.length<45)||keyIds.has(n.id)||hover===n.id||zoom>1.65;const family=networkFamily(entity.kind);return <g key={n.id} transform={'translate('+n.x+' '+n.y+')'} className={'case-network-node is-'+family+(chosen?' is-selected':'')+(dim?' is-dim':'')} role="button" tabIndex={0} aria-label={entity.name[locale]} aria-pressed={entityId===n.id} data-network-node={n.id} onClick={()=>selectEntity(n.id)} onKeyDown={e=>key(e,()=>selectEntity(n.id))} onMouseEnter={()=>setHover(n.id)} onMouseLeave={()=>setHover('')}>
     <title>{entity.name[locale]}</title><circle className="network-node-halo" r={chosen?15:Math.min(11,5+n.degree*.7)}/><circle className="case-node-hit" r={model.dense?16:23}/>
     {family==='business'?<rect className="case-node-mark" x="-4.5" y="-4.5" width="9" height="9" rx="1"/>:entity.kind==='person'?<circle className="case-node-mark" r="5"/>:<path className="case-node-mark" d="m0-6 6 6-6 6-6-6Z"/>}
     {label&&<text textAnchor="middle" y="22" className="network-node-name">{networkLines(entity.name[locale],model.dense?15:19).map((line,i)=><tspan key={i} x="0" dy={i?15:0}>{line}</tspan>)}</text>}
    </g>})}
   </g>
  </svg>
  <div className="case-network-tools"><span>{model.nodes.length} {l('participants','pihak')} · {claims.length} {l('connections','keterkaitan')}</span><div><button type="button" className="network-names" aria-pressed={names} onClick={()=>setNames(v=>!v)}>{l('Names','Nama')}</button><button type="button" aria-label={l('Zoom out','Perkecil')} onClick={()=>zoomTo(zoom-.3)}><WorkIcon name="minus"/></button><button type="button" aria-label={l('Zoom in','Perbesar')} onClick={()=>zoomTo(zoom+.3)}><WorkIcon name="plus"/></button><button type="button" aria-label={l('Reset network','Atur ulang jaringan')} onClick={()=>{pan.current={x:0,y:0};zoomTo(1);model.nodes.forEach(n=>{n.fx=null;n.fy=null;n.x=model.initial.get(n.id)!.x;n.y=model.initial.get(n.id)!.y});drawRef.current()}}><WorkIcon name="reset"/></button></div></div>
  <div className="network-document-tray" aria-label={l('Sources for this selection','Sumber pilihan ini')}>{docs.map(source=><button type="button" key={source.id} data-network-document={source.id} onClick={()=>selectDocument(source.id)}>{source.preview?<img src={source.preview.src} alt="" width="36" height="48" loading="lazy"/>:<WorkIcon name="document"/>}<span><small>{source.period}</small><strong>{source.title}</strong></span><WorkIcon/></button>)}</div>
 </div>;
});
