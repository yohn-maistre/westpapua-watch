import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFile,readdir,access,mkdtemp,writeFile} from 'node:fs/promises';
const temp=await mkdtemp('/tmp/watch-explorer-tests-');let moduleIndex=0;
const moduleAt=async path=>{const r=await build({entryPoints:[path],bundle:true,write:false,format:'esm',platform:'node',define:{'import.meta.env':'{}'}});const file=temp+'/'+moduleIndex+++'.mjs';await writeFile(file,r.outputFiles[0].text);return import(file)};
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const {historyRecords,historyPaths,historyEras,recordsForPath}=await moduleAt('src/data/history-prototype.ts');
assert.ok(historyRecords.length>=60);assert.equal(new Set(historyRecords.map(r=>r.id)).size,historyRecords.length);assert.equal(historyPaths.length,7);
for(const path of historyPaths){assert.ok(recordsForPath(path.id).length);if(path.startId)assert.ok(recordsForPath(path.id).some(r=>r.id===path.startId));}
for(const record of historyRecords){assert.ok(historyEras.some(e=>e.id===record.era));for(const locale of ['en','pmy'])assert.ok(record.body[locale]?.length>(record.archiveIds.length?10:60),record.id);assert.ok(record.sources.length);for(const source of record.sources)assert.match(source.url,/^https?:\/\//);if(record.media)await access('public'+record.media.src);}
const cases=await json('content/following.json');assert.equal(cases.length,8);
const {topicTimelines}=await moduleAt('src/data/topic-timelines.ts');
for(const c of cases){assert.ok(c.background.en.length>300);assert.ok(c.background.pmy.length>300);assert.ok(c.backgroundSources.length);assert.ok(topicTimelines[c.slug]?.length,c.slug);}
const {readingChapters,readingRecords,chaptersForPath,figuresForPanel,placesForPanel,paragraphsForRecord,sourceAnchor}=await moduleAt('src/data/history-reading.ts');
const {archiveItemById}=await moduleAt('src/data/archive.ts');
assert.equal(new Set(readingChapters.map(c=>c.id)).size,readingChapters.length);
const assigned=readingChapters.flatMap(c=>c.panels.flatMap(p=>p.records.map(r=>r.id)));
assert.equal(new Set(assigned).size,assigned.length,'A record belongs to one chapter/perspective');
assert.deepEqual(new Set(assigned),new Set(readingRecords.map(r=>r.id)),'No account disappears during consolidation');
for(const c of readingChapters){
 assert.ok(c.panels.length);assert.ok(c.date.en&&c.date.pmy);
 if(c.main)assert.ok(!['undated','living'].includes(c.kind),'Undated finds and living practices do not acquire a date in Chronology');
 for(const p of c.panels){assert.ok(p.paths.length);for(const r of p.records){assert.ok(r.sources.length);for(const id of r.archiveIds)assert.ok(archiveItemById[id],`${r.id}: ${id}`)}for(const point of placesForPanel(p)){assert.ok(Number.isFinite(point.longitude)&&Number.isFinite(point.latitude));assert.ok(point.note.en&&point.note.pmy);assert.match(point.source,/^https?:/)}for(const figure of figuresForPanel(p))assert.ok(figure.item.resolved.image||figure.item.resolved.poster)}
}
for(const path of historyPaths){assert.ok(chaptersForPath(path.id).length);if(path.id!=='all')for(const c of chaptersForPath(path.id))assert.ok(c.panels.some(p=>p.paths.includes(path.id)));}
for(const r of readingRecords){
 assert.ok(r.paragraphs?.length,`Explicit editorial copy: ${r.id}`);
 for(const paragraph of paragraphsForRecord(r)){
  assert.ok(paragraph.text.en&&paragraph.text.pmy);assert.ok(paragraph.sourceUrls.length);
  for(const url of paragraph.sourceUrls)assert.ok(r.sources.some(s=>s.url===url),`${r.id}: unsupported reference ${url}`);
 }
 for(const id of r.visualIds||[])assert.ok(r.archiveIds.includes(id),`Every timeline visual belongs to the archive: ${id}`);
}
for(const c of readingChapters)for(const p of c.panels){assert.equal(new Set(sourcesForPanelSafe(p).map(s=>sourceAnchor(p.id,s.url))).size,sourcesForPanelSafe(p).length);assert.ok(figuresForPanel(p).length<=3,`Edited mosaic, not whole catalogue: ${p.id}`)}
function sourcesForPanelSafe(p){return [...new Map(p.records.flatMap(r=>r.sources).map(s=>[s.url,s])).values()]}
for(const id of ['history-yosepha','history-resistance','history-border-1984','history-fronts-dialogue','history-kiwirok','history-paniai'])assert.ok(chaptersForPath('all').some(c=>c.id===id));
for(const id of ['history-kobe-oser','history-church-institutions','history-aerial-investigations','history-amungme-courts'])assert.ok(assigned.includes(id));
assert.ok(!Object.keys(archiveItemById).some(id=>['mansinam-route','digoel-internment','khombouw-materials'].includes(id)));

const {searchCorpus}=await moduleAt('src/data/search.ts');
assert.equal(searchCorpus.filter(r=>r.type==='history'&&r.id==='history-mansinam').length,1);
const sourcedTimeline=searchCorpus.find(r=>r.id==='timeline:malind-road-lawsuit');assert.ok(sourcedTimeline.text.en.includes('greenpeace.org'));assert.ok(sourcedTimeline.href.endsWith('#malind-road-lawsuit'));
for(const id of ['history-kayu-batu-pottery','history-keerom-rock-art','history-khombouw'])assert.ok(!chaptersForPath('all').some(c=>c.panels[0].records.some(r=>r.id===id)),id);
const merauke=topicTimelines['south-papua-food-energy-estate'];assert.equal(merauke.length,42);assert.equal(merauke.filter(e=>e.sourceDateLabel).length,36);
for(const id of ['mifee-launch','mifee-rights','sugar-task-force','sugar-planting'])assert.ok(merauke.some(e=>e.id===id),'Legacy Merauke links survive');
const {milestoneDate}=await moduleAt('src/data/topic-timelines.ts');
assert.equal(milestoneDate({date:'2024-05'},'en'),'May 2024');assert.equal(milestoneDate({date:'2024-05'},'pmy'),'Mei 2024');
for(const entries of Object.values(topicTimelines)){
 assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);
 for(let i=0;i<entries.length;i++){const entry=entries[i];assert.match(entry.date,/^\d{4}(-\d{2})?(-\d{2})?$/);assert.ok(!milestoneDate(entry,'en').includes('Invalid'));if(i)assert.ok(entries[i-1].date<=entry.date);if(entry.dateEnd)assert.ok(entry.dateEnd>=entry.date);for(const id of entry.mediaIds||[])assert.ok(archiveItemById[id],id);for(const lang of ['en','pmy'])assert.ok(entry.text[lang].length>80,entry.id)}
}
const {libraryItems}=await moduleAt('src/data/library.ts');const featured=await json('content/library-featured.json');assert.equal(featured.length,9);for(const id of featured)assert.ok(libraryItems.some(item=>item.id===id),id);
const exhibits=await json('content/exhibition.json');const crafts=exhibits.items.filter(e=>e.lane==='crafts'&&e.rights!=='source-only'&&!e.hidden);assert.ok(crafts.length>=6);for(const e of crafts)await access('public'+e.image);
const {witWeek,validateReview,REVIEW_TOPICS}=await moduleAt('shared/analysis.ts');
assert.equal(witWeek('2026-10-04T14:59:59Z').id,'2026-09-28');assert.equal(witWeek('2026-10-04T15:00:00Z').id,'2026-10-05');
const window=witWeek('2026-09-28T00:00:00Z');
const evidence=[1,2,3].map(id=>({id:'a:'+id,title:'South Papua PSN customary forest consultation '+id,publisher:id===3?'Second newsroom':'First newsroom',originalPublisher:id===3?'second':'first',url:'https://example.com/'+id,publishedAt:'2026-09-25T02:00:00Z',developmentId:id===3?2:1,text:'Communities in Merauke report consultations on the South Papua PSN food estate. Their representatives request records of consent and the proposed changes to their customary forest. The reporting describes meetings and distinct responses, not a finding that consent has been established.'}));
const pair={en:'The reports describe consultation and unresolved questions about customary forest consent.',pmy:'Laporan menjelaskan konsultasi serta pertanyaan yang belum terjawab tentang persetujuan atas hutan adat.'};
const delta={en:'The latest report adds a request for the consultation records from community representatives.',pmy:'Laporan terbaru menambahkan permintaan catatan konsultasi dari perwakilan masyarakat.'};
const draft={title:{en:'Consultation and customary land in South Papua',pmy:'Konsultasi dan tanah adat di Papua Selatan'},intro:[{text:pair,sourceIds:['a:1','a:3']}],threads:[{id:'land-consent',topics:['land-indigenous-rights'],title:{en:'Customary forest consultation',pmy:'Konsultasi hutan adat'},paragraphs:[{text:pair,sourceIds:['a:1','a:2','a:3']}],question:{en:'Which records document the communities’ consent?',pmy:'Catatan mana yang mendokumentasikan persetujuan masyarakat?'}}],states:[{slug:'south-papua-food-energy-estate',summary:pair,change:delta,questions:[],sourceIds:['a:1','a:3']}]};
assert.deepEqual(validateReview(draft,evidence,window,['south-papua-food-energy-estate']),[]);
const bad=structuredClone(draft);bad.threads[0].paragraphs[0].sourceIds=['invented'];assert.ok(validateReview(bad,evidence,window).includes('thread paragraph: unknown support'));
const wrongLanguage=structuredClone(draft);wrongLanguage.intro[0].text.pmy=pair.en;assert.ok(validateReview(wrongLanguage,evidence,window).some(e=>e.includes('bilingual')));
const unknownTopic=structuredClone(draft);unknownTopic.threads[0].topics=['invented'];assert.ok(validateReview(unknownTopic,evidence,window).includes('unknown topic'));
assert.ok(validateReview(draft,evidence.map(e=>({...e,publishedAt:'2026-10-01'})),window).some(e=>e.includes('cutoff')));
assert.ok(validateReview(draft,evidence.map(e=>({...e,originalPublisher:'same'})),window).some(e=>e.includes('publishers')));
const repeat=structuredClone(draft);repeat.states[0].change=repeat.states[0].summary;assert.ok(validateReview(repeat,evidence,window,['south-papua-food-energy-estate']).includes('case delta repeats summary'));
const {runWeeklyReview,readWeekly,readCaseState,publishReview}=await moduleAt('services/watch-engine/src/weekly.ts');
const mf=new Miniflare(await convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-08-29',d1Databases:{DB:'explorer-test'}}));
try{
 const db=await mf.getD1Database('DB');for(const name of (await readdir('services/watch-engine/migrations')).filter(n=>n.endsWith('.sql')).sort()){const sql=await readFile('services/watch-engine/migrations/'+name,'utf8');for(const statement of sql.replace(/--[^\n]*/g,'').split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(statement).run();}
 for(const p of ['first','second'])await db.prepare("INSERT INTO publishers(id,name,homepage,role,ownership,updated_at) VALUES(?,?,?,'local_newsroom','independent',datetime('now'))").bind(p,p,'https://example.com/'+p).run();
 for(const id of [1,2])await db.prepare("INSERT INTO developments(id,title_en,status,updated_at,publication_kind) VALUES(?,'Consultation records','published',datetime('now'),'reviewed')").bind(id).run();
 for(const e of evidence){const id=Number(e.id.slice(2));await db.prepare("INSERT INTO articles(id,publisher_id,canonical_url,title,body_excerpt,published_at,fetched_at) VALUES(?,?,?,?,?,?,datetime('now'))").bind(id,e.originalPublisher,e.url,e.title,e.text,e.publishedAt).run();await db.prepare('INSERT INTO development_articles(development_id,article_id) VALUES(?,?)').bind(e.developmentId,id).run();}
 let writes=0,audits=0,pass=true;const env={DB:db,AUTO_PUBLISH:'true',ENABLE_WORKERS_AI_FALLBACK:'true',AI:{run:async(_model,input)=>{if(input.messages[0].content.includes('Audit the proposed')){audits++;return {response:{verdict:pass?'pass':'revise',problems:pass?[]:['Fixture: unsupported mechanism']}};}writes++;const payload=JSON.parse(input.messages[1].content);assert.ok(payload.cases.some(c=>c.slug==='south-papua-food-energy-estate'));assert.deepEqual(payload.topics,REVIEW_TOPICS);return {response:draft};}}};
 assert.equal((await runWeeklyReview(env,'2026-09-28T00:00:00Z')).status,'published');assert.equal(writes,1);assert.equal(audits,1);
 const edition=(await readWeekly(env,window.id)).edition;assert.deepEqual(edition.title,draft.title);assert.equal(edition.evidence.length,3);assert.equal((await readCaseState(env,'south-papua-food-energy-estate')).change.en,delta.en);
 assert.equal((await runWeeklyReview(env,'2026-09-28')).status,'already-published');assert.equal(writes,1);
 const changed=structuredClone(draft);changed.states.push({...draft.states[0],slug:'mining-raja-ampat'});assert.equal((await publishReview(env,window,changed,evidence,'2026-09-30')).status,'already-published');assert.equal((await db.prepare('SELECT COUNT(*) n FROM following_snapshots').first()).n,1);
 // A failed critic retains the accepted picture and never writes an edition.
 await db.prepare("UPDATE articles SET published_at='2026-10-02T02:00:00Z'").run();pass=false;draft.states=[];
 const held=await runWeeklyReview(env,'2026-10-05');assert.equal(held.status,'held');assert.match(held.reason,/unsupported mechanism/);assert.equal((await db.prepare('SELECT COUNT(*) n FROM weekly_editions').first()).n,1);assert.equal((await readCaseState(env,'south-papua-food-energy-estate')).change.en,delta.en);
 assert.equal((await runWeeklyReview(env,'2026-10-05')).status,'leased-or-exhausted');
 await db.prepare("UPDATE analysis_jobs SET lease_until='2026-01-01' WHERE week_id='2026-10-05'").run();pass=true;
 const dry=await runWeeklyReview({...env,AUTO_PUBLISH:'false'},'2026-10-05');assert.equal(dry.status,'held');assert.match(dry.reason,/disabled/);assert.equal((await db.prepare('SELECT COUNT(*) n FROM weekly_editions').first()).n,1);
 await db.prepare("UPDATE analysis_jobs SET lease_until='2026-01-01' WHERE week_id='2026-10-05'").run();
 await db.prepare("INSERT INTO articles(id,publisher_id,canonical_url,title,body_excerpt,published_at,fetched_at) VALUES(4,'second','https://example.com/4','Raja Ampat nickel mining permits','The report describes Raja Ampat nickel mining permits and requests for environmental records. The island case concerns distinct companies and coastal communities, with reporting focused on Gag Island and marine conservation.','2026-10-02',datetime('now'))").run();await db.prepare('INSERT INTO development_articles(development_id,article_id) VALUES(2,4)').run();
 draft.states=[{slug:'south-papua-food-energy-estate',summary:pair,change:{en:'A further request asks for the written consultation records to be shared.',pmy:'Permintaan lanjutan meminta catatan konsultasi tertulis untuk dibagikan.'},questions:[],sourceIds:['a:1','a:4']}];
 const crossCase=await runWeeklyReview(env,'2026-10-05');assert.equal(crossCase.status,'held');assert.match(crossCase.reason,/out-of-scope/);assert.equal((await db.prepare('SELECT COUNT(*) n FROM weekly_editions').first()).n,1);
 // Old permalink editions remain readable beyond the recent-edition list.
 for(let i=1;i<=18;i++)await db.prepare('INSERT INTO weekly_editions(id,from_at,to_at,payload_json,published_at) VALUES(?,?,?,?,?)').bind('archive-'+i,'2026-10-01',new Date(Date.parse('2026-10-01')+i*86400000).toISOString(),JSON.stringify({...edition,id:'archive-'+i,to:new Date(Date.parse('2026-10-01')+i*86400000).toISOString()}),'2026-10-01').run();assert.equal((await readWeekly(env,window.id)).edition.id,window.id);
}finally{await mf.dispose()}
console.log('Passed: history paths/assets, eight grounded cases, craft and library references, WIT periods, bilingual/citation/scope contracts, actual writer/critic/D1 publication, immutable retries, held-review fallback and archived permalinks.');
