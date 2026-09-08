import {renderAnswer} from './markdown';
type Source={title:string;url:string;publisher:string};
type Message={role:'user'|'assistant';content:string;sources?:Source[]};
const safeURL=(value:unknown)=>{if(typeof value!=='string'||!value)return '';try{const u=new URL(value,location.origin);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};
export function initAsk(){
 const dialog=document.querySelector<HTMLDialogElement>('[data-ask-dialog]');if(!dialog||dialog.dataset.ready)return;dialog.dataset.ready='true';
 const q=<T extends HTMLElement=HTMLElement>(s:string)=>dialog.querySelector<T>(s)!;
 const input=q<HTMLTextAreaElement>('[data-ask-input]'),thread=q('[data-ask-thread]'),status=q('[data-ask-status]'),send=q<HTMLButtonElement>('[data-ask-submit]'),stop=q<HTMLButtonElement>('[data-ask-stop]'),scroll=q('[data-ask-scroll]'),search=q<HTMLDetailsElement>('[data-ask-search]'),results=q('[data-ask-results]');
 const en=dialog.dataset.locale!=='pmy',key='watch-chat-v1';let messages:Message[]=[],controller:AbortController|null=null,opener:HTMLElement|null=null,sequence=0,timer=0,corpus:any[]=[];
 const say=(a:string,b:string)=>en?a:b;
 try{const saved=JSON.parse(sessionStorage.getItem(key)||'[]');if(Array.isArray(saved))messages=saved.slice(-24).filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,8000),sources:Array.isArray(m.sources)?m.sources.slice(0,12):[]}))}catch{}
 const persist=()=>{try{sessionStorage.setItem(key,JSON.stringify(messages.slice(-24)))}catch{q('[data-ask-memory]').textContent=say('Memory is available while this page remains open.','Konteks tersedia selama halaman ini terbuka.')}};
 function render(){thread.replaceChildren();q('[data-ask-prompts]').hidden=messages.length>0;messages.forEach((m,i)=>{
  const article=document.createElement('article');article.className=`ask-message ask-message-${m.role}`;const label=document.createElement('small');label.textContent=m.role==='user'?say('You','Anda'):'Watch';article.append(label);
  const text=document.createElement('div');text.className='ask-message-text';
  const citation=(part:string):Node=>{const n=Number(part.match(/^\[S(\d+)\]$/)?.[1]);const source=m.sources?.[n-1];if(!source||!safeURL(source.url))return document.createTextNode(part);const a=document.createElement('a');a.href=`#ask-source-${i}-${n}`;a.textContent=part;a.setAttribute('aria-label',`${say('Source','Sumber')} ${n}: ${source.title}`);a.onclick=e=>{e.preventDefault();const target=document.getElementById(`ask-source-${i}-${n}`);const detail=target?.closest('details');if(detail)detail.open=true;target?.scrollIntoView({block:'nearest'});target?.focus()};return a};
  if(m.role==='assistant')text.append(renderAnswer(m.content,citation));else text.textContent=m.content;article.append(text);
  if(m.sources?.length){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=`${m.sources.length} ${say('sources','sumber')}`;details.append(summary);m.sources.forEach((s,n)=>{const href=safeURL(s.url);if(!href)return;const a=document.createElement('a');a.id=`ask-source-${i}-${n+1}`;a.href=href;a.target='_blank';a.rel='noreferrer';a.className='ask-source';a.textContent=`[S${n+1}] ${String(s.publisher||'')} · ${String(s.title||'')}`;details.append(a)});article.append(details)}thread.append(article)
 });scroll.scrollTop=scroll.scrollHeight;}
 function busy(value:boolean){send.disabled=value;input.readOnly=value;stop.hidden=!value;thread.setAttribute('aria-busy',String(value))}
 function open(button?:HTMLElement){opener=button||document.activeElement as HTMLElement;if(!dialog.open)dialog.showModal();input.focus()}
 document.querySelectorAll<HTMLElement>('[data-ask-open]').forEach(b=>b.addEventListener('click',()=>open(b)));
 q('[data-ask-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>opener?.focus());
 document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open()}});
 async function lookup(value:string){const ticket=++sequence;results.replaceChildren();search.hidden=value.trim().length<2;if(search.hidden)return;
  if(!corpus.length)try{const r=await fetch('/search.json');if(r.ok)corpus=await r.json()}catch{}
  const words=value.toLowerCase().split(/\s+/).filter(Boolean);const local=corpus.map(x=>({x,score:words.reduce((n,w)=>n+(JSON.stringify([x.title,x.text,x.tags]).toLowerCase().includes(w)?1:0),0)})).filter(x=>x.score).sort((a,b)=>b.score-a.score).slice(0,4).map(x=>x.x);let live=true;
  try{const r=await fetch(`/api/search?q=${encodeURIComponent(value)}`,{signal:AbortSignal.timeout(7000)});if(r.ok)local.unshift(...((await r.json()).items||[]).slice(0,4));else live=false}catch{live=false}if(ticket!==sequence)return;
  q('[data-search-status]').textContent=!live?say('Showing the site collection; news search is temporarily unavailable.','Koleksi situs tersedia; pencarian berita sementara tidak tersedia.'):local.length?'':say('No matching pages yet.','Belum ada halaman yang cocok.');
  for(const item of local){let href=item.href;if(!en&&typeof href==='string'&&href.startsWith('/')&&!href.startsWith('/pmy/'))href='/pmy'+href;href=safeURL(href);if(!href)continue;const a=document.createElement('a');a.className='ask-result';a.href=href;a.textContent=(en?item.title?.en:item.title?.pmy)||item.title?.en||String(item.title);results.append(a)}
 }
 input.addEventListener('input',()=>{clearTimeout(timer);sequence++;timer=window.setTimeout(()=>void lookup(input.value),300)});
 dialog.querySelectorAll<HTMLElement>('[data-prompt]').forEach(b=>b.onclick=()=>{input.value=b.dataset.prompt||'';input.focus();void lookup(input.value)});
 async function ask(){const query=input.value.trim();if(controller||query.length<2)return;
  const history=messages.slice(-12).map(({role,content})=>({role,content:content.slice(0,role==='user'?500:1200)}));messages.push({role:'user',content:query});render();persist();input.value='';search.hidden=true;sequence++;busy(true);status.textContent=say('Checking Watch sources…','Memeriksa sumber Watch…');
  const current=new AbortController();controller=current;const timeout=window.setTimeout(()=>current.abort('timeout'),95000);
  try{const pageTitle=document.querySelector('main h1')?.textContent?.trim().slice(0,180)||'';const response=await fetch('/api/ask',{method:'POST',headers:{'content-type':'application/json'},signal:current.signal,body:JSON.stringify({query,history,locale:en?'en':'pmy',pageTitle})});const data=await response.json();if(!response.ok)throw new Error(response.status===429?say('Too many requests. Please try again in a minute.','Terlalu banyak permintaan. Coba lagi dalam satu menit.'):say('Ask is temporarily unavailable. Your question is ready to retry.','Tanya sementara tidak tersedia. Pertanyaan siap dicoba lagi.'));if(typeof data.answer!=='string'||!data.answer.trim())throw new Error(say('No answer returned. Please retry.','Jawaban kosong. Silakan coba lagi.'));if(controller!==current)return;messages.push({role:'assistant',content:data.answer,sources:Array.isArray(data.sources)?data.sources:[]});status.textContent='';render();persist()
  }catch(error){if(controller!==current)return;messages.pop();input.value=query;status.textContent=current.signal.aborted?say('Stopped. You can edit and send again.','Dihentikan. Anda dapat mengedit dan mengirim lagi.'):(error as Error).message;render();persist()}
  finally{clearTimeout(timeout);if(controller===current){controller=null;busy(false);input.focus()}}
 }
 q<HTMLFormElement>('[data-ask-form]').onsubmit=e=>{e.preventDefault();void ask()};input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();void ask()}});
 stop.onclick=()=>controller?.abort();q('[data-ask-reset]').onclick=()=>{controller?.abort();controller=null;messages=[];input.value='';status.textContent='';busy(false);sequence++;search.hidden=true;render();persist();input.focus()};render();
}
