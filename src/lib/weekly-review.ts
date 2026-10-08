import {fetchJSON} from './http';
import type {WeeklyEdition,ReviewParagraph} from '../../shared/analysis';
export function initWeeklyReviews(){
 for(const root of document.querySelectorAll<HTMLElement>('[data-weekly-review]')){
  const en=root.dataset.locale!=='pmy',compact=root.dataset.compact==='true',topic=root.dataset.topic||'',pick=(value:any)=>en?value?.en:value?.pmy;
  const fmt=(date:string)=>new Date(date).toLocaleDateString(en?'en-GB':'id-ID',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Jayapura'});
  const dialog=root.querySelector<HTMLDialogElement>('[data-weekly-dialog]');
  const openReview=()=>{if(dialog&&!dialog.open)dialog.showModal()};
  const scrollLinkedThread=()=>{if(!dialog?.open||!location.hash.startsWith('#review-'))return;const target=Array.from(dialog.querySelectorAll<HTMLElement>('[id]')).find(element=>'#'+element.id===location.hash);target?.scrollIntoView({block:'start',behavior:'instant'})};
  const openLinkedReview=()=>{if(location.hash==='#weekly-review'||location.hash.startsWith('#review-')||new URL(location.href).searchParams.has('review')){openReview();scrollLinkedThread()}};
  root.querySelector('[data-weekly-open]')?.addEventListener('click',openReview);root.querySelector('[data-weekly-close]')?.addEventListener('click',()=>dialog?.close());dialog?.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close()}});
  openLinkedReview();addEventListener('hashchange',openLinkedReview);addEventListener('popstate',openLinkedReview);
  let editions:any[]=[],active='';
  const el=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string)=>{const element=document.createElement(tag);if(text)element.textContent=text;return element};
  const render=(edition:WeeklyEdition)=>{
   if(!edition?.title?.en||!edition?.title?.pmy||!Array.isArray(edition.threads)||!Array.isArray(edition.evidence))return;
   const threads=topic?edition.threads.filter(t=>t.topics.includes(topic)):edition.threads;
   root.hidden=!!topic&&!threads.length;active=edition.id;const status=root.querySelector('[data-weekly-status]');if(status)status.textContent='';
   root.querySelector('[data-weekly-title]')!.textContent=topic&&threads[0]?pick(threads[0].title):pick(edition.title);
   root.querySelector('[data-weekly-date]')!.textContent=edition.kind==='initial'?`${en?'Current picture':'Gambaran terkini'} · ${fmt(edition.to)}`:`${fmt(edition.from)} – ${fmt(new Date(Date.parse(edition.to)-1).toISOString())}`;
   const intro=root.querySelector('[data-weekly-intro]')!;intro.replaceChildren(...(topic&&threads[0]?threads[0].paragraphs.slice(0,1):edition.intro).map(p=>el('p',pick(p.text))));
   const target=root.querySelector('[data-weekly-threads]');
   if(target&&!compact){target.replaceChildren(...threads.map((thread,index)=>{const article=el('article');article.id='review-'+thread.id;article.append(el('small',String(index+1).padStart(2,'0')),el('h4',pick(thread.title)));for(const p of thread.paragraphs){const div=el('div');div.className='weekly-paragraph';const details=el('details');details.append(el('summary',`${en?'Sources':'Sumber'} ${p.sourceIds.length}`));for(const id of p.sourceIds){const source=edition.evidence.find(e=>e.id===id);if(!source||!/^https?:\/\//.test(source.url))continue;const a=el('a');a.href=source.url;a.target='_blank';a.rel='noreferrer';a.append(el('strong',source.title),el('small',source.publisher));details.append(a)}div.append(el('p',pick(p.text)),details);article.append(div)}const question=el('p',pick(thread.question));question.className='weekly-question';article.append(question);return article}))}
   const navigation=root.querySelector<HTMLElement>('[data-weekly-editions]');if(navigation){navigation.hidden=editions.length<2;const index=editions.findIndex(e=>e.id===active);root.querySelector<HTMLButtonElement>('[data-weekly-prev]')!.disabled=index<0||index>=editions.length-1;root.querySelector<HTMLButtonElement>('[data-weekly-next]')!.disabled=index<=0;root.querySelector('[data-weekly-edition-label]')!.textContent=fmt(edition.to)}
   scrollLinkedThread();
  };
  async function load(id?:string){const data=await fetchJSON('/api/weekly'+(id?'?id='+encodeURIComponent(id):''));if(!data.edition)throw new Error('Edition unavailable');editions=data.editions||[];render(data.edition)}
  const selected=new URL(location.href).searchParams.get('review');load(selected||undefined).catch(()=>{});
  for(const [selector,direction] of [['[data-weekly-prev]',1],['[data-weekly-next]',-1]] as const){root.querySelector<HTMLButtonElement>(selector)?.addEventListener('click',async event=>{const index=editions.findIndex(e=>e.id===active),target=editions[index+direction];if(!target)return;const button=event.currentTarget as HTMLButtonElement;button.disabled=true;try{await load(target.id);const url=new URL(location.href);url.searchParams.set('review',target.id);history.pushState(null,'',url)}catch{button.disabled=false;const status=root.querySelector('[data-weekly-status]');if(status)status.textContent=en?'Could not load this edition. Try again.':'Edisi belum bisa dimuat. Coba lagi.'}})}
  addEventListener('popstate',()=>load(new URL(location.href).searchParams.get('review')||undefined).catch(()=>{}));
 }
}
