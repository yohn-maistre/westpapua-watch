import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFile,readdir} from 'node:fs/promises';
const moduleAt=async path=>{const r=await build({entryPoints:[path],bundle:true,write:false,format:'esm',platform:'node'});return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'))};
const {relevanceDisposition}=await moduleAt('services/watch-engine/src/ingest/relevance.ts');
const packet={summary:'This Sahara discovery has no connection to Papua',places:['Papua'],watch_relevance:false,watch_relevance_confidence:.95,watch_relevance_evidence:['Papua']};
assert.equal(relevanceDisposition(packet,{title:'A discovery in the Sahara',description:'',body:''},'keep'),'irrelevant');
assert.equal(relevanceDisposition({...packet,watch_relevance:true,watch_relevance_evidence:['Governor visits Deiyai']},{title:'Governor visits Deiyai',body:'',description:''}),'relevant');
assert.equal(relevanceDisposition({...packet,watch_relevance:true,watch_relevance_evidence:['Governor visits Deiyai']},{title:'Unrelated news',body:'',description:''}),'deferred');
assert.equal(relevanceDisposition({...packet,watch_relevance_reason:'structured extraction unavailable'},{title:'Papua',body:'',description:''},'keep'),'deferred');
const {validatePartition}=await moduleAt('services/watch-engine/src/cluster/partition.ts');
assert.deepEqual(validatePartition([[1,2],[3]],[1,2,3]),[[1,2],[3]]);assert.equal(validatePartition([[1,2],[2]],[1,2,3]),null);assert.equal(validatePartition([[1],[8]],[1,2]),null);
const {conflictFeatures,CONFLICT_PERIODS}=await moduleAt('src/lib/map/conflict.ts');
assert.equal(CONFLICT_PERIODS.length,4);assert.equal(conflictFeatures('displacement','2026-q1').features.length,0);assert.ok(conflictFeatures('displacement','2026-q2').features.length>0);
const {normalizeLibraryItem,mergeLibraryItems,retrieveLibrary}=await moduleAt('shared/library.ts');
const historic=normalizeLibraryItem({url:'https://example.com/paper?utm_source=x',title:'Merauke research',type:'research',publisher:'Archive',published_at:'1969',updated_at:'2026-09-09',places:['Merauke']});
assert.equal(historic.year,'1969');assert.equal(normalizeLibraryItem({updated_at:'2026-09-09'}).year,'—');assert.equal(normalizeLibraryItem({type:'documentary'}).itemType,'film');assert.equal(normalizeLibraryItem({type:'research',url:'https://example.com/a.pdf'}).itemType,'research');
assert.equal(mergeLibraryItems([historic],[{...historic,title:'Wrong discovery title'}])[0].title,'Merauke research');assert.equal(retrieveLibrary([historic],'research about Merauke').length,1);assert.equal(retrieveLibrary([historic],'reports about Merauke').length,0);
const {maybeResourceCandidate,libraryCandidate}=await moduleAt('services/watch-engine/src/resources/index.ts');
assert.equal(libraryCandidate({},'preferred'),false);assert.equal(libraryCandidate({library_worthy:true,library_reason:'Standalone study'},'none'),false);
const mf=new Miniflare(await convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-08-29',d1Databases:{DB:'library-test'}}));
try{
 const db=await mf.getD1Database('DB');
 for(const name of (await readdir('services/watch-engine/migrations')).filter(n=>n.endsWith('.sql')).sort()){
  const sql=await readFile('services/watch-engine/migrations/'+name,'utf8');
  const statements=sql.replace(/--[^\n]*/g,'').split(';').map(s=>s.trim()).filter(Boolean);
  for(const statement of statements)await db.prepare(statement).run();
 }
 await db.prepare("INSERT INTO publishers(id,name,homepage,role,ownership,updated_at) VALUES('hrm','Human Rights Monitor','https://example.com','monitoring_org','civil_society','2026-09-09')").run();
 await db.prepare("INSERT INTO articles(id,publisher_id,canonical_url,title,published_at,fetched_at) VALUES(1,'hrm','https://example.com/study','Merauke study','2001-03-01','2026-09-09')").run();
 const article={id:1,title:'Merauke study',canonicalUrl:'https://example.com/study',publishedAt:'2001-03-01',language:'en',packet:{item_type:'research',library_worthy:true,library_reason:'Standalone research',evidence_roles:['research'],places:['Merauke'],topics:['land-indigenous-rights'],issue_candidates:[],summary:'A study of MIFEE in Merauke'}};
 await maybeResourceCandidate({DB:db},article,{id:'hrm',libraryPolicy:'selective'});
 const saved=await db.prepare('SELECT * FROM resource_candidates').first();assert.equal(saved.item_type,'research');assert.equal(saved.status,'candidate');assert.equal(saved.published_at,'2001-03-01');
 await db.prepare("UPDATE resource_candidates SET status='published'").run();
 const {resources}=await moduleAt('services/watch-engine/src/library-api.ts');
 const items=await resources({DB:db},new URL('https://example.com/resources?place=Merauke&type=research'));
 assert.ok(items.some(i=>i.publisher==='Human Rights Monitor'&&i.year==='2001'));
 await maybeResourceCandidate({DB:db},article,{id:'hrm',libraryPolicy:'selective'});assert.equal((await db.prepare('SELECT COUNT(*) n FROM resource_candidates').first()).n,1);
 // Previously rejected material must be removed even if its generated summary mentions Papua.
 await db.prepare("INSERT INTO story_packets(article_id,summary,key_points_json,what_changed,places_json,people_json,organizations_json,topics_json,issue_candidates_json,created_at,watch_relevance,watch_relevance_confidence) VALUES(1,'Not about Papua','[]','','[]','[]','[]','[]','[]',datetime('now'),0,.95)").run();
 await db.prepare("INSERT INTO developments(id,title_en,status,updated_at) VALUES(1,'Wrong story','published',datetime('now'))").run();
 await db.prepare('INSERT INTO development_articles(development_id,article_id) VALUES(1,1)').run();
 const {cleanupRecentIrrelevant}=await moduleAt('services/watch-engine/src/knowledge.ts');const repair=await cleanupRecentIrrelevant({DB:db},30);assert.equal(repair.filtered,1);assert.equal((await db.prepare('SELECT status FROM developments WHERE id=1').first()).status,'filtered');
 assert.equal((await cleanupRecentIrrelevant({DB:db},30)).checked,0);
}finally{await mf.dispose()}
console.log('Passed: grounded relevance, episode partitions, period isolation, shared Library contract, all migrations, candidate writes, resource relations/API, idempotent cleanup.');

// Following scope is based on direct subject evidence, never geography alone.
const {matchesFollowing}=await moduleAt('shared/following.ts');
assert.equal(matchesFollowing('south-papua-food-energy-estate','Police investigate a death in Merauke'),false);
assert.equal(matchesFollowing('south-papua-food-energy-estate','Wanam communities oppose the PSN food estate in Merauke'),true);
assert.equal(matchesFollowing('mining-raja-ampat','A music festival in Raja Ampat'),false);
assert.equal(matchesFollowing('nduga-displacement','Nduga students win a mathematics contest'),false);
assert.equal(matchesFollowing('nduga-displacement','Nduga families remain displaced from their homes'),true);
assert.equal(matchesFollowing('puncak-displacement','Displaced families in Puncak Jaya'),false);
assert.equal(matchesFollowing('freeport-mimika','Freeport tailings monitoring in Mimika'),true);
const {onRequest:apiBoundary}=await moduleAt('functions/api/_middleware.ts');
for(const headers of [{'content-type':'text/html'},{'content-type':'application/json'}]){
 const response=await apiBoundary({next:async()=>new Response('<!DOCTYPE html><h1>Unavailable</h1>',{status:500,headers})});
 assert.equal(response.status,502);assert.match(response.headers.get('content-type'),/json/);assert.equal(typeof(await response.json()).error,'string');
}
const healthy=await apiBoundary({next:async()=>Response.json({items:[]})});assert.equal(healthy.status,200);assert.deepEqual(await healthy.json(),{items:[]});
console.log('Passed: Following scope excludes unrelated local stories; API boundary normalizes mislabeled HTML errors.');
const {scoreCandidate,invalidAdjudicationMustCreateNewEvent}=await moduleAt('services/watch-engine/src/cluster/index.ts');
const {ModelRequestError}=await moduleAt('services/watch-engine/src/llm.ts');assert.equal(invalidAdjudicationMustCreateNewEvent(new ModelRequestError('malformed','bare new_event')),true);assert.equal(invalidAdjudicationMustCreateNewEvent(new Error('Event adjudication omitted article')),true);assert.equal(invalidAdjudicationMustCreateNewEvent(new ModelRequestError('quota','quota')),false);
const visitPacket={event_key:'Working visit to Deiyai',summary:'Education commitments during the working visit',places:['Deiyai'],organizations:[],people:['Meki Nawipa'],event_date:'2026-09-06'};
const visitCandidate={id:1,title:'Education support announced',summary:'Promises of student support',event_signature:'education',places:['Deiyai'],organizations:[],event_date:'2026-09-06',reports:[{title:'Meki Nawipa working visit to Deiyai',event_key:'Working visit to Deiyai',summary:'Meetings with residents',people_json:'["Meki Nawipa"]'}]};
assert.ok(scoreCandidate({title:'Local response to the visit'},visitPacket,visitCandidate)>scoreCandidate({title:'Local response to the visit'},visitPacket,{...visitCandidate,reports:[]}));
const {fallbackDraft,draftFrom,sourceBriefEligible,sourceBriefDraftEligible,translationRepairEligible,usableEditorialSummary}=await moduleAt('services/watch-engine/src/cluster/editorial.ts');
const grounded=fallbackDraft({dev:{title_en:'Existing grounded title',summary_en:'Existing grounded summary'},items:[{title:'Source title',places_json:'["Deiyai"]',topics_json:'["governance"]'}]});
assert.equal(draftFrom({development_id:7,summary_id:'Ringkasan baru'},grounded).title_en,'Existing grounded title');
assert.equal(draftFrom({development_id:7,summary_id:'Ringkasan baru'},grounded).summary_id,'Ringkasan baru');
assert.deepEqual(draftFrom({development_id:7},grounded).places,['Deiyai']);
const localBrief={items:[{title:'LBH asks police to finish the investigation',summary:'A'.repeat(100),published_at:new Date().toISOString(),event_date:new Date().toISOString().slice(0,10),role:'local_newsroom',item_type:'reporting',watch_relevance:1,watch_relevance_confidence:.95}]};
assert.equal(sourceBriefEligible(localBrief),true);assert.equal(sourceBriefEligible({...localBrief,items:[...localBrief.items,{...localBrief.items[0]}]}),false);assert.equal(sourceBriefEligible({items:[{...localBrief.items[0],role:'civil_society'}]}),false);assert.equal(sourceBriefEligible({items:[{...localBrief.items[0],published_at:null,event_date:'2025-09-18'}]}),false);
const bilingual={title_en:'Police urged to complete torture investigation',title_id:'Polisi didesak tuntaskan penyelidikan penyiksaan',summary_en:'A complete English summary grounded in the source report and long enough for publication without clipping.',summary_id:'Ringkasan Indonesia lengkap yang bersumber pada laporan dan cukup panjang untuk diterbitkan tanpa terpotong.',_lockedIdEcho:true};
assert.equal(sourceBriefDraftEligible(bilingual),true);assert.equal(sourceBriefDraftEligible({...bilingual,summary_en:bilingual.summary_id}),false);assert.equal(usableEditorialSummary('Ringkasan sumber berhenti sebelum kalimat selesai [...]'),false);assert.equal(usableEditorialSummary('456'),false);
const repairJob={dev:{status:'published',title_en:'Judul sama',title_id:'Judul sama',summary_en:'Ringkasan sama dan cukup panjang untuk menandai publikasi lama dalam bahasa Indonesia.',summary_id:'Ringkasan sama dan cukup panjang untuk menandai publikasi lama dalam bahasa Indonesia.'}};assert.equal(translationRepairEligible(repairJob,bilingual),true);assert.equal(translationRepairEligible(repairJob,{...bilingual,_lockedIdEcho:false}),false);
const {packetSummary}=await moduleAt('services/watch-engine/src/ingest/story.ts');const packetArticle={title:'Judul sumber',description:'Ringkasan sumber yang benar dan cukup panjang untuk dipakai sebagai fallback aman.',body:'Isi sumber'};assert.equal(packetSummary({summary_id:'456'},packetArticle),packetArticle.description);assert.equal(packetSummary({summary_id:'Ringkasan hasil model yang lengkap dan cukup panjang untuk dipakai.'},packetArticle),'Ringkasan hasil model yang lengkap dan cukup panjang untuk dipakai.');
const {reusableRelevantPacket}=await moduleAt('services/watch-engine/src/ingest/process.ts');assert.equal(reusableRelevantPacket({watch_relevance:1,watch_relevance_confidence:.95,summary:'Grounded packet'}),true);assert.equal(reusableRelevantPacket({watch_relevance:0,watch_relevance_confidence:1,summary:'Irrelevant'}),false);assert.equal(reusableRelevantPacket({watch_relevance:1,watch_relevance_confidence:0,summary:'Failed packet'}),false);
console.log('Passed: episode retrieval, grounded partial drafts, bounded source briefs and safe packet replay.');

const {runJson,parseStructured}=await moduleAt('services/watch-engine/src/llm.ts');
const schema={type:'object',properties:{items:{type:'array',items:{type:'object',properties:{verdict:{type:'string',enum:['pass','revise']},problem:{type:'boolean'}},required:['verdict','problem'],additionalProperties:false}}},required:['items'],additionalProperties:false};
assert.throws(()=>parseStructured('{"items":[{"verdict":"pass","problem":"false"}]}',schema));
assert.throws(()=>parseStructured('{"items":[{"verdict":"sure","problem":false}]}',schema));
assert.throws(()=>parseStructured('{"items":[{"verdict":"pass"}]}',schema));
assert.equal(parseStructured('[{"verdict":"pass","problem":false}]',schema).items[0].verdict,'pass');
const singleDevelopmentSchema={type:'object',properties:{items:{type:'array',items:{type:'object',properties:{development_id:{type:'integer'},title:{type:'string'}},required:['development_id','title'],additionalProperties:false}}},required:['items'],additionalProperties:false};
assert.equal(parseStructured('{"development_id":7,"title":"One episode"}',singleDevelopmentSchema).items[0].development_id,7);
assert.throws(()=>parseStructured('[{"verdict":"pass","problem":false}]',{type:'object',properties:{answer:{type:'string'}},required:['answer'],additionalProperties:false}));
const originalFetch=globalThis.fetch;let calls=0;
try{
 globalThis.fetch=async(url,options)=>{calls++;const body=JSON.parse(options.body);assert.equal(body.model,'dynamic/watch-fast');assert.equal(body.response_format,undefined);assert.equal(body.reasoning_effort,undefined);assert.match(body.messages[0].content,/Schema:/);return Response.json({choices:[{message:{content:'{"items":[{"verdict":"pass","problem":false}]}'}}]})};
 const env={AI_GATEWAY_BASE:'https://gateway.example/v1',AI_GATEWAY_TOKEN:'test'};
 assert.equal((await runJson(env,[],schema,'critic')).items[0].verdict,'pass');assert.equal(calls,1);
 globalThis.fetch=async()=>{calls++;return new Response('invalid argument',{status:400})};
 await assert.rejects(runJson(env,[],schema,'critic'),e=>e.status===400);assert.equal(calls,2);
}finally{globalThis.fetch=originalFetch}
console.log('Passed: provider-neutral structured requests, recursive critic validation and no hidden inference retry.');

const rich=normalizeLibraryItem({url:'https://example.com/book',type:'thesis',year:1998,authors:['A. Author'],doi:'10.1234/example',visual:{url:'https://example.com/cover.jpg',credit:'Publisher'},issueRefs:['freeport-mimika']});
assert.equal(rich.itemType,'research');assert.equal(rich.subtype,'thesis');assert.equal(rich.year,'1998');assert.equal(rich.authors[0],'A. Author');assert.equal(rich.following[0],'freeport-mimika');assert.equal(rich.visual.credit,'Publisher');
assert.equal(normalizeLibraryItem({url:'https://example.com',visual:{url:'javascript:alert(1)'}}).visual,undefined);
assert.equal(normalizeLibraryItem({source_url:'https://example.com',metadata_json:JSON.stringify({authors:['A. Author'],visual:{url:'https://example.com/cover.jpg'}})}).authors[0],'A. Author');
assert.equal(retrieveLibrary([rich],'A. Author').length,1);
const {libraryVisualTone}=await moduleAt('shared/library.ts');assert.equal(libraryVisualTone(rich),'research');assert.equal(libraryVisualTone(normalizeLibraryItem({type:'book'})),'book');assert.equal(libraryVisualTone(normalizeLibraryItem({type:'reporting'})),'website');
console.log('Passed: bibliographic metadata, subtype groups, safe covers, type-based visual fallbacks and author search.');
