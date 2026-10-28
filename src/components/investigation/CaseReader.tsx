import type {InvestigativeRecord,RecordClaim} from '../../data/investigative-record';
import type {DeskSelection} from '../../lib/investigations';
import type {Locale} from '../../data/types';
import {WorkIcon} from './WorkIcon';

const kindNames:Record<string,[string,string]>={person:['Person','Tokoh'],office:['Public office','Jabatan negara'],institution:['Institution','Lembaga'],company:['Company','Perusahaan'],'business-group':['Business group','Grup usaha'],community:['Community','Masyarakat'],'claimant-group':['Landholder plaintiffs','Penggugat adat'],organisation:['Organisation','Organisasi'],project:['Project','Proyek'],decision:['Decision','Keputusan'],place:['Place','Tempat'],document:['Research','Riset'],event:['Event','Peristiwa'],mechanism:['Arrangement','Pengaturan'],financial:['Financial record','Catatan keuangan']};
export const recordDate=(s:string,locale:Locale)=>s.length===4?s:new Date(s+(s.length===7?'-01':'')+'T00:00:00Z').toLocaleDateString(locale==='en'?'en-GB':'id-ID',{year:'numeric',month:'short',...(s.length===10?{day:'numeric'}:{}),timeZone:'UTC'});
type Props={data:InvestigativeRecord;claims:RecordClaim[];selection:DeskSelection;locale:Locale;routes:Record<string,string>;chooseClaim:(id:string)=>void;chooseEntity:(id:string)=>void;chooseSource:(id:string)=>void;openEvidence:()=>void};
export default function CaseReader({data,claims,selection,locale,routes,chooseClaim,chooseEntity,chooseSource,openEvidence}:Props){
 const en=locale==='en',l=(a:string,b:string)=>en?a:b,pk=(v:{en:string;pmy:string})=>v[locale];
 const source=data.sources.find(s=>s.id===selection.source),entity=data.entities.find(e=>e.id===selection.entity),claim=claims.find(c=>c.id===selection.claim)||claims[0];
 const linked=entity?claims.filter(c=>c.subject===entity.id||c.object===entity.id):source?claims.filter(c=>c.evidence.some(e=>e.source===source.id)):claim?[claim]:[];
 const profileClaims=entity?.profile?.claimIds.map(id=>data.claims.find(c=>c.id===id)!).filter(Boolean)||[];
 const profile=entity?.profile,otherCases=data.cases.filter(c=>c.id!==selection.caseId&&(entity?c.claimIds.some(id=>data.claims.some(k=>k.id===id&&(k.subject===entity.id||k.object===entity.id))):source?c.reading.includes(source.id)||c.claimIds.some(id=>data.claims.some(k=>k.id===id&&k.evidence.some(e=>e.source===source.id))):c.claimIds.includes(claim?.id)));
 const sourceIds=[...new Set((entity?profileClaims.length?profileClaims:linked:source?[]:[claim]).flatMap(c=>c.evidence.map(e=>e.source)))];
 const label=source?source.title:entity?pk(entity.name):pk(claim.title);
 function href(c:RecordClaim){return (en?'':'/id')+routes[c.cases.includes(selection.caseId)?selection.caseId:c.cases[0]]+'?claim='+encodeURIComponent(c.id)+'#explore'}
 function recordLink(c:RecordClaim){const content=<><time dateTime={c.date}>{recordDate(c.date,locale)}</time><strong>{pk(c.title)}</strong><WorkIcon/></>;return claims.some(k=>k.id===c.id)?<button type="button" key={c.id} onClick={()=>chooseClaim(c.id)}>{content}</button>:<a key={c.id} href={href(c)}>{content}</a>}
 return <div className="case-reader-content" data-case-reader>
  <div className="case-evidence-top"><span>{source?l('Source document','Dokumen sumber'):entity?(kindNames[entity.kind]||['Participant','Pihak'])[en?0:1]:l('Documented connection','Keterkaitan bersumber')}</span>{!entity&&!source&&<time dateTime={claim.date}>{recordDate(claim.date,locale)}</time>}</div>
  <h3 data-case-reading-title tabIndex={-1}>{label}</h3><div className="sr-only" role="status" aria-live="polite">{label}</div>
  {source?<div className="case-source-profile">
   {source.preview&&<figure className={'reader-source-preview'+(source.preview.kind==='photo'?' is-photo':'')}><a href={source.url} target="_blank" rel="noreferrer"><img src={source.preview.src} width={source.preview.width} height={source.preview.height} alt={source.preview.caption?pk(source.preview.caption):source.title}/></a>{source.preview.caption&&<figcaption>{pk(source.preview.caption)} {source.preview.credit}</figcaption>}</figure>}
   <p className="case-reader-summary" lang="en">{source.scope}</p><span className="source-period">{source.period}</span>
   <a className="case-source-original case-source-link" href={source.url} target="_blank" rel="noreferrer">{l('Open original source','Buka sumber asli')}<WorkIcon/></a>
   <h4>{l('What this source supports','Catatan yang didukung sumber ini')}</h4><div className="case-entity-connections">{linked.map(recordLink)}</div>
   {source.limitations&&<details className="case-response"><summary>{l('Reading scope','Cakupan pembacaan')}</summary><p lang="en">{source.limitations}</p></details>}
  </div>:entity?<div className="case-entity-profile">
   <p className="case-reader-summary">{profile?pk(profile.text):linked.length?pk(linked[0].text):''}</p>
   {!!sourceIds.length&&<div className="case-profile-citations"><span>{l('From the record','Dari catatan')}</span>{sourceIds.map(id=><button type="button" key={id} onClick={()=>chooseSource(id)}>{data.sources.find(s=>s.id===id)!.title}<WorkIcon name="document"/></button>)}</div>}
   <h4>{l('Roles, actions & connections','Peran, tindakan & keterkaitan')}</h4><div className="case-entity-connections">{linked.toSorted((a,b)=>a.date.localeCompare(b.date)).map(recordLink)}</div>
  </div>:<>
   <div className="case-reader-predicate"><button type="button" onClick={()=>chooseEntity(claim.subject)}>{pk(data.entities.find(e=>e.id===claim.subject)!.name)}</button><span>{pk(claim.predicate)}</span><button type="button" onClick={()=>chooseEntity(claim.object)}>{pk(data.entities.find(e=>e.id===claim.object)!.name)}</button></div>
   <p className="case-reader-summary">{pk(claim.text)}</p>
   {claim.amount&&<div className="case-reader-amount"><strong>{claim.amount.currency?new Intl.NumberFormat(en?'en-US':'id-ID',{style:'currency',currency:claim.amount.currency,maximumFractionDigits:0}).format(claim.amount.value):new Intl.NumberFormat(en?'en-US':'id-ID').format(claim.amount.value)}</strong><span>{pk(claim.amount.label)} · {claim.amount.period}</span><small>{claim.amount.currency?l('As reported in the cited record','Menurut pengungkapan dalam sumber'):l('Quantity ordered; no verified price','Jumlah dipesan; harga belum terverifikasi')}</small></div>}
   {claim.quote&&<blockquote className="case-reader-quote" lang={claim.quote.language}><small>{l('Statement in the cited account','Pernyataan dalam sumber')}</small><p>“{claim.quote.original}”</p></blockquote>}
   {claim.evidence.filter(e=>e.excerpt).map((e,i)=><blockquote className="case-original-passage" key={e.source+i} lang={e.excerpt!.language}><small>{l('Original passage','Kutipan asli')} · {pk(e.locator)}</small><p>{e.excerpt!.text}</p></blockquote>)}
   {claim.response&&<div className="case-reader-response"><h4>{l('Response & outcome','Tanggapan & hasil')}</h4><p>{pk(claim.response)}</p></div>}
   <div className="case-reader-sources">{claim.evidence.map((e,i)=>{const s=data.sources.find(s=>s.id===e.source)!;return <button type="button" className="case-source-link" key={e.source+i} onClick={()=>chooseSource(s.id)}><WorkIcon name="document"/><span><strong>{s.title}</strong><small>{pk(e.locator)}</small></span><WorkIcon/></button>})}</div>
   <button type="button" className="case-evidence-detail" data-case-evidence onClick={openEvidence}>{l('Inspect the evidence','Periksa sumber')}<WorkIcon name="document"/></button>
  </>}
  {!!otherCases.length&&<nav className="case-related-records" aria-label={l('Related investigations','Penelusuran terkait')}><h4>{l('Follow into another investigation','Lanjut ke penelusuran lain')}</h4>{otherCases.map(c=><a key={c.id} href={(en?'':'/id')+routes[c.id]+'?'+(entity?'entity='+entity.id:source?'source='+source.id:'claim='+claim.id)+'#explore'}>{pk(c.title)}<WorkIcon/></a>)}</nav>}
 </div>;
}
