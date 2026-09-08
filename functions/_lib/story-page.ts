type Env = { WATCH_ENGINE?: Fetcher };
const escape = (v:unknown) => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const url = (v:unknown) => {if(typeof v!=='string'||!v.trim())return '';try{const u=new URL(String(v),'https://westpapua.watch');return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
const array=(v:any):any[]=>{if(Array.isArray(v))return v;try{const a=JSON.parse(v||'[]');return Array.isArray(a)?a:[]}catch{return []}};
const date=(v:string,local:boolean)=>v&&Number.isFinite(Date.parse(v))?new Date(v).toLocaleDateString(local?'id-ID':'en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):'';

// Render the existing static story shell at the edge: readable without JS,
// with article-specific metadata for crawlers and language/share links.
export const storyPage:PagesFunction<Env> = async context => {
 const requestUrl=new URL(context.request.url),id=requestUrl.searchParams.get('id'),local=requestUrl.pathname.startsWith('/pmy/');
 const shell=await context.next();if(!shell.headers.get('content-type')?.includes('text/html'))return shell;
 let data:any=null,status=200;
 if(!id||!/^\d{1,12}$/.test(id))status=404;
 else if(!context.env.WATCH_ENGINE)status=503;
 else try{const response=await context.env.WATCH_ENGINE.fetch(new Request(`https://watch.internal/development/${id}`,{signal:AbortSignal.timeout(10000)}));status=response.status;if(response.ok)data=await response.json()}catch{status=503}
 if(data?.redirect_id&&/^\d+$/.test(String(data.redirect_id))){const target=new URL(requestUrl);target.searchParams.set('id',String(data.redirect_id));return Response.redirect(target.href,302)}
 const rw=new HTMLRewriter().on('[data-story-page]',{element(e){e.setAttribute('data-story-server','true')}}).on('[data-story-loading]',{element(e){e.remove()}});
 if(!data?.development){
  const message=status===404?(local?'Berita tidak ditemukan.':'Story not found.'):(local?'Berita sementara tidak tersedia. Coba lagi nanti.':'This story is temporarily unavailable. Please try again.');
  rw.on('[data-story-error]',{element(e){e.removeAttribute('hidden');e.setInnerContent(message)}}).on('head',{element(e){e.append('<meta name="robots" content="noindex">',{html:true})}});
  return rw.transform(new Response(shell.body,{status:status===404?404:503,headers:{...Object.fromEntries(shell.headers),'cache-control':'no-store'}}));
 }
 const d=data.development,s=data.synthesis||{},articles=data.articles||[],issues=data.issues||[],places=data.places||[];
 const title=(local?d.title_id:d.title_en)||d.title_en,summary=(local?d.summary_id:d.summary_en)||d.summary_en;
 const canonical=new URL(requestUrl.pathname,requestUrl.origin);canonical.searchParams.set('id',id!);
 const publishers=new Set(articles.filter((a:any)=>!a.syndicated_from_article_id).map((a:any)=>a.publisher_id||a.publisher));
 const latest=articles.map((a:any)=>a.published_at).filter(Boolean).sort((a:string,b:string)=>Date.parse(a)-Date.parse(b)).at(-1);
 const set=(selector:string,value:any)=>rw.on(selector,{element(e){e.setInnerContent(String(value??''))}});
 const html=(selector:string,value:string)=>rw.on(selector,{element(e){e.setInnerContent(value,{html:true})}});
 rw.on('[data-story-content]',{element(e){e.removeAttribute('hidden')}});
 set('title',`${title} · West Papua Watch`);set('[data-story-title]',title);set('[data-story-summary]',summary);set('[data-story-kicker]',issues[0]?.category||'');
 set('[data-story-meta]',`${articles.length} ${local?'laporan':'reports'} · ${publishers.size} ${local?'sumber':'sources'}${latest?' · '+date(latest,local):''}`);
 set('[data-story-source-count]',`${publishers.size} ${local?'sumber':'sources'}`);
 rw.on('meta[name="description"],meta[property="og:description"]',{element(e){e.setAttribute('content',summary||'')}}).on('meta[property="og:title"]',{element(e){e.setAttribute('content',title)}}).on('meta[property="og:url"]',{element(e){e.setAttribute('content',canonical.href)}}).on('link[rel="canonical"]',{element(e){e.setAttribute('href',canonical.href)}}).on('a[hreflang],link[rel="alternate"]',{element(e){const href=e.getAttribute('href');if(href){const next=new URL(href,requestUrl);next.searchParams.set('id',id!);e.setAttribute('href',next.href)}}});
 const points=array(local?(s.key_points?.id||s.key_points_id_json):(s.key_points?.en||s.key_points_en_json));
 if(points.length){rw.on('[data-story-points]',{element(e){e.removeAttribute('hidden')}});html('[data-story-points] ul',points.map(p=>`<li>${escape(p)}</li>`).join(''))}
 const changed=local?(s.what_changed_id||s.what_changed):s.what_changed;
 if(changed){rw.on('[data-story-changed]',{element(e){e.removeAttribute('hidden')}});set('[data-story-changed] p',changed)}
 const common=array(s.common_ground_json);if(common.length&&publishers.size>1){rw.on('[data-story-common]',{element(e){e.removeAttribute('hidden')}});html('[data-story-common] ul',common.map(p=>`<li>${escape(p)}</li>`).join(''))}
 html('[data-story-sources]',articles.map((a:any)=>`<a class="story-source" href="${escape(url(a.canonical_url))}" target="_blank" rel="noreferrer"><span>${escape(a.publisher)} · ${escape(String(a.role||'source').replaceAll('_',' '))} · ${escape(date(a.published_at,local))}</span><strong>${escape(a.title)}</strong><p>${escape(a.what_changed||a.packet_summary||a.summary||'')}</p></a>`).join(''));
 if(issues.length||places.length){rw.on('[data-story-relations]',{element(e){e.removeAttribute('hidden')}});html('[data-story-relations]',issues.slice(0,3).map((i:any)=>`<a class="chip" href="${local?'/pmy':''}/issues/${encodeURIComponent(i.slug)}/">${escape((local?i.title_id:i.title_en)||i.title_en)}</a>`).join('')+places.slice(0,3).map((p:any)=>`<span class="chip">${escape(p.name)}</span>`).join(''))}
 const photo=articles.find((a:any)=>url(a.image_url));if(photo){rw.on('[data-story-figure]',{element(e){e.removeAttribute('hidden')}}).on('[data-story-image]',{element(e){e.setAttribute('src',url(photo.image_url));e.setAttribute('alt',photo.title||'');e.setAttribute('loading','lazy')}}).on('[data-story-image-source]',{element(e){e.setAttribute('href',url(photo.image_source_url||photo.canonical_url));e.setInnerContent(`${local?'Gambar':'Image'}: ${photo.image_credit||photo.publisher} ↗`)}}).on('head',{element(e){e.append(`<meta property="og:image" content="${escape(url(photo.image_url))}">`,{html:true})}})}
 return rw.transform(new Response(shell.body,{headers:{...Object.fromEntries(shell.headers),'cache-control':'public, max-age=60, stale-while-revalidate=180'}}));
};
