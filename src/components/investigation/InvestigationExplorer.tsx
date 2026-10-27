import Arrow from './Arrow';
import {useEffect,useRef,useState} from 'react';
import {Tabs} from '@base-ui/react/tabs';
import {Dialog} from '@base-ui/react/dialog';
import type {EvidenceRecord,InvestigationNode,InvestigationEdge} from '../../data/investigations';
import type {Localized} from '../../data/types';
import '../../styles/investigation.css';

type View='connections'|'timeline'|'map'|'records';
type Selection={view:View;record:string;node:string;source:boolean};
type Props={locale:'en'|'pmy';records:EvidenceRecord[];nodes:InvestigationNode[];edges:InvestigationEdge[]};
const views:View[]=['connections','timeline','map','records'];
const defaultRecord='merauke-2023-11-10-1';

export default function InvestigationExplorer({locale,records,nodes,edges}:Props){
 const en=locale==='en',pick=(value:Localized)=>value[locale]||value.en,l=(a:string,b:string)=>en?a:b;
 const [selection,setSelection]=useState<Selection>({view:'connections',record:defaultRecord,node:'',source:false});
 const [zoom,setZoom]=useState(1),[pan,setPan]=useState({x:0,y:0}),[ready,setReady]=useState(false);
 const drag=useRef<{x:number;y:number;startX:number;startY:number;pointer:number}|null>(null),scroller=useRef<HTMLDivElement>(null),mapSlot=useRef<HTMLDivElement>(null);
 const record=records.find(r=>r.id===selection.record)||records[0],node=nodes.find(n=>n.id===selection.node);
 const labels={connections:l('Connections','Keterkaitan'),timeline:l('Timeline','Linimasa'),map:l('Map','Peta'),records:l('Records','Catatan')};
 const nodeLines=(text:string)=>{if(text.length<24)return[text];const words=text.split(' ');let first='';while(words.length&&(!first||first.length+words[0].length+1<25))first+=(first?' ':'')+words.shift();return[first,words.join(' ')]};
 const date=(r:EvidenceRecord)=>new Intl.DateTimeFormat(en?'en-GB':'id-ID',{...(r.date.length>7?{day:'numeric' as const}:{}),...(r.date.length>4?{month:'short' as const}:{}),year:'numeric',timeZone:'UTC'}).format(new Date(r.date.length===4?r.date+'-01-01T00:00:00Z':r.date.length===7?r.date+'-01T00:00:00Z':r.date+'T00:00:00Z'));
 function readURL():Selection{
  const q=new URLSearchParams(location.search),view=(q.get('exploreView')||(matchMedia('(max-width:650px)').matches?'timeline':'connections')) as View,requested=q.get('record')||defaultRecord,n=q.get('entity')||'';
  return {view:views.includes(view)?view:'connections',record:records.some(r=>r.id===requested)?requested:defaultRecord,node:nodes.some(x=>x.id===n)?n:'',source:q.get('evidence')==='open'};
 }
 useEffect(()=>{setSelection(readURL());setReady(true);const restore=()=>setSelection(readURL());addEventListener('popstate',restore);return()=>removeEventListener('popstate',restore)},[]);
 useEffect(()=>{
  if(selection.view!=='map'||!mapSlot.current)return;
  const map=document.querySelector<HTMLElement>('[data-watch-map][data-context="issue"][data-context-value="south-papua-food-energy-estate"]');
  if(!map)return;const parent=map.parentElement!,next=map.nextSibling;
  mapSlot.current.append(map);map.classList.add('investigation-shared-atlas');if(map.dataset.mapInitialized!=='true')map.dispatchEvent(new CustomEvent('watch:map-activate'));
  requestAnimationFrame(()=>dispatchEvent(new Event('resize')));
  return()=>{map.classList.remove('investigation-shared-atlas');parent.insertBefore(map,next?.parentNode===parent?next:null);requestAnimationFrame(()=>dispatchEvent(new Event('resize')))};
 },[selection.view]);
 function select(update:Partial<Selection>,push=true){
  const next={...selection,...update};setSelection(next);
  const url=new URL(location.href);url.searchParams.set('exploreView',next.view);url.searchParams.set('record',next.record);
  if(next.node)url.searchParams.set('entity',next.node);else url.searchParams.delete('entity');
  if(next.source)url.searchParams.set('evidence','open');else url.searchParams.delete('evidence');
  if(push)history.pushState(null,'',url);else history.replaceState(null,'',url);
 }
 function showRecord(id:string){select({record:id,node:'',source:false})}
 function openAtlas(){
  const map=document.querySelector<HTMLElement>('[data-watch-map][data-context="issue"][data-context-value="south-papua-food-energy-estate"]');
  if(map){map.dispatchEvent(new CustomEvent('watch:map-expand'));map.querySelector<HTMLButtonElement>('[data-map-expand]')?.focus()}
 }
 const sources=record.sources||[{url:record.source,publisher:record.publisher}];
 return <section className="investigation" id="explore" data-investigation data-ready={ready} aria-label={l('Explore the Merauke record','Telusuri catatan Merauke')}>
  <header className="investigation-heading"><div><small>{l('Merauke · 2010–2026','Merauke · 2010–2026')}</small><h2>{l('Explore.','Telusuri.')}</h2></div><a href="#timeline">{l('Full chronology','Linimasa lengkap')} <span aria-hidden="true"><Arrow/></span></a></header>
  <Tabs.Root value={selection.view} onValueChange={value=>select({view:value as View})} className="investigation-workspace">
   <Tabs.List className="investigation-views" aria-label={l('Investigation views','Tampilan penelusuran')}>
    {views.map(view=><Tabs.Tab value={view} key={view} data-explorer-view={view}>{labels[view]}</Tabs.Tab>)}
   </Tabs.List>
   <div className="investigation-stage">
    <div className="investigation-scene">
     <Tabs.Panel value="connections" className="investigation-graph-panel">
      <div className="investigation-scene-note"><span>{l('Institutions, decisions and land','Lembaga, keputusan, dan tanah')}</span><span>{edges.length} {l('sourced relationships','keterkaitan bersumber')}</span></div>
      <div className="investigation-graph" ref={scroller}>
       <svg viewBox="0 0 980 870" role="img" aria-labelledby="connections-title" onPointerDown={event=>{if((event.target as Element).closest('[data-graph-select]'))return;drag.current={x:event.clientX,y:event.clientY,startX:pan.x,startY:pan.y,pointer:event.pointerId};event.currentTarget.setPointerCapture(event.pointerId)}} onPointerMove={event=>{if(!drag.current)return;const box=event.currentTarget.getBoundingClientRect(),scale=980/box.width;setPan({x:Math.max(-500,Math.min(500,drag.current.startX+(event.clientX-drag.current.x)*scale)),y:Math.max(-500,Math.min(500,drag.current.startY+(event.clientY-drag.current.y)*scale))})}} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}}>
        <title id="connections-title">{l('Selected documented relationships in the Merauke projects. Each relationship opens a dated source record.','Keterkaitan terdokumentasi dalam proyek Merauke. Setiap hubungan membuka catatan sumber bertanggal.')}</title>
        <defs><pattern id="investigation-grid" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="currentColor" opacity=".14"/></pattern></defs><rect width="980" height="870" fill="url(#investigation-grid)"/>
        <g transform={`translate(${pan.x} ${pan.y}) translate(490 435) scale(${zoom}) translate(-490 -435)`}>
         {edges.map(edge=>{const a=nodes.find(n=>n.id===edge.from)!,b=nodes.find(n=>n.id===edge.to)!,selected=selection.record===edge.recordId,dim=!!node&&!node.recordIds.includes(edge.recordId),cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,horizontal=Math.abs(b.x-a.x)>Math.abs(b.y-a.y),sign=Math.sign(horizontal?b.x-a.x:b.y-a.y),ax=a.x+(horizontal?106*sign:0),ay=a.y+(horizontal?0:36*sign),bx=b.x-(horizontal?106*sign:0),by=b.y-(horizontal?0:36*sign),curve=`M${ax},${ay} Q${cx+(horizontal?0:32)},${cy-(horizontal?32:0)} ${bx},${by}`;return <g key={edge.id} className={`investigation-edge${selected?' is-selected':''}${dim?' is-dim':''}`} data-graph-select="edge" role="button" tabIndex={0} aria-label={`${pick(a.label)}: ${pick(edge.label)}: ${pick(b.label)}`} onClick={()=>showRecord(edge.recordId)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showRecord(edge.recordId)}}}>
          <path className="edge-hit" d={curve}/><path className="edge-line" d={curve}/><rect x={cx-96} y={cy-45} width="192" height="38" rx="5"/><text x={cx} y={cy-22} textAnchor="middle">{pick(edge.label).length>34?pick(edge.label).slice(0,31)+'…':pick(edge.label)}</text>
         </g>})}
         {nodes.map(n=><g key={n.id} transform={`translate(${n.x} ${n.y})`} className={`investigation-node${n.id===selection.node?' is-selected':''}${n.recordIds.includes(record.id)?' is-related':''}`} data-graph-select="node" role="button" tabIndex={0} aria-label={pick(n.label)} onClick={()=>select({node:n.id,record:n.recordIds[0],source:false})} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select({node:n.id,record:n.recordIds[0],source:false})}}}>
          <rect x="-105" y="-35" width="210" height="78" rx="9"/><circle cx="-85" cy="-13" r="3"/><text x="-73" y="-10" className="node-kind">{pick(n.kind)}</text><text x="-85" y="12">{nodeLines(pick(n.label)).map((line,index)=><tspan x="-85" dy={index?18:0} key={index}>{line}</tspan>)}</text>
         </g>)}
        </g>
       </svg>
       <div className="investigation-zoom" aria-label={l('Connection diagram zoom','Zoom diagram keterkaitan')}><button type="button" aria-label={l('Zoom in','Perbesar')} onClick={()=>setZoom(z=>Math.min(2,z+.2))}>+</button><button type="button" aria-label={l('Reset diagram','Atur ulang diagram')} onClick={()=>{setZoom(1);setPan({x:0,y:0})}}><Arrow direction="reset"/></button><button type="button" aria-label={l('Zoom out','Perkecil')} onClick={()=>setZoom(z=>Math.max(.6,z-.2))}>−</button></div>
      </div>
      <details className="investigation-relationship-list"><summary>{l('Read the relationships','Baca keterkaitan')}</summary>{edges.map(edge=><button type="button" key={edge.id} onClick={()=>showRecord(edge.recordId)}>{pick(nodes.find(n=>n.id===edge.from)!.label)} <span>→ {pick(edge.label)} →</span> {pick(nodes.find(n=>n.id===edge.to)!.label)}</button>)}</details>
     </Tabs.Panel>
     <Tabs.Panel value="timeline" className="investigation-timeline-panel"><div className="investigation-scene-note"><span>{l('From MIFEE to the road-permit case','Dari MIFEE hingga perkara izin jalan')}</span><span>{records.length} {l('records','catatan')}</span></div><div className="investigation-record-scroll">{records.map(r=><button type="button" key={r.id} className={`investigation-milestone${r.id===record.id?' is-selected':''}`} onClick={()=>showRecord(r.id)} data-explorer-record={r.id}><time dateTime={r.date}>{date(r)}</time><strong>{pick(r.title)}</strong><span aria-hidden="true"><Arrow/></span></button>)}</div></Tabs.Panel>
     <Tabs.Panel value="map" className="investigation-map-panel"><div className="investigation-scene-note"><span>{l('South Papua','Papua Selatan')}</span><span>{l('Regional reference','Referensi wilayah')}</span></div><div ref={mapSlot} className="investigation-atlas-slot" data-explorer-atlas-slot/><div className="investigation-context-map investigation-map-reference"><img src="/images/history/prototype/geography.svg" width="600" height="380" alt={l('New Guinea with Merauke marked on the southern coast','Nugini dengan Merauke ditandai di pesisir selatan')}/><button type="button" className="investigation-map-pin" onClick={()=>select({source:true})}><i/><span>Merauke</span></button></div><div className="investigation-map-caption"><p>{l('The atlas provides regional context. Its layers do not establish the location or boundary of a selected timeline event.','Atlas memberi konteks wilayah. Lapisannya tidak menentukan lokasi atau batas suatu peristiwa dalam linimasa.')}</p><button type="button" onClick={openAtlas}>{l('Expand Atlas','Perluas Atlas')} <span aria-hidden="true"><Arrow/></span></button></div></Tabs.Panel>
     <Tabs.Panel value="records" className="investigation-records-panel"><div className="investigation-scene-note"><span>{l('Decisions, reporting and community responses','Keputusan, laporan, dan tanggapan masyarakat')}</span><span>{records.length}</span></div><div className="investigation-record-scroll investigation-document-grid">{records.map(r=><button type="button" key={r.id} className={`investigation-document${r.id===record.id?' is-selected':''}`} onClick={()=>showRecord(r.id)}>{r.image?<img src={r.image} alt="" loading="lazy"/>:<div className="investigation-document-type"><span>{r.date.slice(0,4)}</span><i aria-hidden="true"><Arrow/></i></div>}<small>{r.publisher}</small><strong>{pick(r.title)}</strong><time dateTime={r.date}>{date(r)}</time></button>)}</div></Tabs.Panel>
    </div>
    <aside className="investigation-selection" aria-live="polite" aria-atomic="false">
     {node&&<div className="investigation-entity-selection"><small>{pick(node.kind)}</small><strong>{pick(node.label)}</strong><nav aria-label={l('Related records','Catatan terkait')}>{node.recordIds.map(id=><button type="button" key={id} className={id===record.id?'is-selected':''} onClick={()=>select({record:id})}>{pick(records.find(r=>r.id===id)!.title)}</button>)}</nav></div>}
     <time dateTime={record.date}>{date(record)}</time><h3 data-explorer-selection-title>{pick(record.title)}</h3>
     {record.image&&<figure><img src={record.image} width="600" height="420" loading="lazy" alt={record.imageCaption?pick(record.imageCaption):''}/>{record.imageCaption&&<figcaption>{pick(record.imageCaption)}</figcaption>}</figure>}
     <p>{pick(record.text)}</p>
     <Dialog.Root open={selection.source} onOpenChange={open=>select({source:open})}>
      <Dialog.Trigger className="investigation-evidence-button" data-explorer-evidence>{l('Sources','Sumber')} <span>{sources.length}</span><span aria-hidden="true"><Arrow/></span></Dialog.Trigger>
      <Dialog.Portal><Dialog.Backdrop className="investigation-evidence-backdrop"/><Dialog.Popup className="investigation-evidence-sheet">
       <header><span>{l('Source record','Catatan sumber')}</span><Dialog.Close aria-label={l('Close sources','Tutup sumber')}>×</Dialog.Close></header>
       <Dialog.Title>{pick(record.title)}</Dialog.Title><Dialog.Description className="sr-only">{l('The source and its date reference are kept separate from Watch’s editorial summary.','Sumber dan rujukan waktunya ditampilkan terpisah dari ringkasan editorial Watch.')}</Dialog.Description>
       {record.excerpt&&<section className="investigation-excerpt"><small>{record.publisher} · {record.locator} · English</small><blockquote>{record.excerpt}</blockquote><p>{l('Excerpt from the source.','Kutipan dari sumber.')}</p></section>}
       <section><small>{l('Watch summary','Ringkasan Watch')}</small><p>{pick(record.text)}</p></section>
       <nav aria-label={l('Original sources','Sumber asli')}>{sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span><strong>{source.publisher}</strong><small>{record.sourceDateLabel||record.locator||date(record)}</small></span><span aria-hidden="true"><Arrow/></span></a>)}</nav>
       <a className="investigation-library-link" href={`${en?'':'/id'}/resources/?q=${encodeURIComponent(record.publisher.split(' · ')[0])}`}>{l('Find related material in the Library','Cari materi terkait di Pustaka')} <Arrow/></a>
      </Dialog.Popup></Dialog.Portal>
     </Dialog.Root>
     <a className="investigation-original" href={record.source} target="_blank" rel="noreferrer">{record.publisher} <Arrow/></a>
    </aside>
   </div>
  </Tabs.Root>
  <footer className="investigation-footer"><span>{l('Editorial selection','Pilihan editorial')}</span><a href={`${en?'':'/id'}/history/?path=land#history-mifee`}>{l('Historical background','Latar sejarah')} <Arrow/></a></footer>
 </section>;
}
