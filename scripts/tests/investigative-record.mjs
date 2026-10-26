import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
const record=JSON.parse(await readFile('content/investigative-record.json','utf8'));
const entities=new Map(record.entities.map(x=>[x.id,x])),claims=new Map(record.claims.map(x=>[x.id,x])),sources=new Map(record.sources.map(x=>[x.id,x]));
for(const [name,items] of [['entities',record.entities],['claims',record.claims],['sources',record.sources],['cases',record.cases],['threads',record.threads]])assert.equal(new Set(items.map(x=>x.id)).size,items.length,`Duplicate ${name} identifiers`);
assert.equal(record.threads.length,20,'Keep the complete research programme');assert.equal(record.cases.length,6);
for(const c of record.claims){
 assert.ok(entities.has(c.subject)&&entities.has(c.object),`Missing participant: ${c.id}`);
 assert.match(c.date,/^\d{4}(-\d{2}(-\d{2})?)?$/);
 assert.ok(c.evidence.length,`Unsupported connection: ${c.id}`);
 for(const e of c.evidence){assert.ok(sources.has(e.source),`Missing source: ${c.id}`);for(const lang of ['en','pmy'])assert.ok(e.locator[lang]);}
 for(const lang of ['en','pmy'])assert.ok(c.predicate[lang]&&c.title[lang]&&c.text[lang],`Missing translation: ${c.id}`);
 for(const id of c.cases)assert.ok(record.cases.some(k=>k.id===id&&k.claimIds.includes(c.id)),'Claim/case membership must agree');
 if(c.amount){assert.ok(Number.isFinite(c.amount.value)&&c.amount.value>0);assert.ok(c.amount.stage&&c.amount.period);if(c.amount.unit==='money')assert.ok(['USD','IDR'].includes(c.amount.currency));else assert.equal(c.amount.currency,null,'A quantity without a verified price has no fabricated currency amount');}
}
for(const c of record.cases){
 assert.ok(c.body.length>=3&&c.questions.length&&c.reading.length);
 const ids=new Set(c.claimIds.flatMap(id=>{assert.ok(claims.has(id));assert.ok(claims.get(id).cases.includes(c.id));return [claims.get(id).subject,claims.get(id).object];}));
 assert.deepEqual(new Set(Object.keys(c.scene)),ids,'Preset layout must include all participants');
 for(const xy of Object.values(c.scene))assert.ok(xy.length===2&&xy.every(Number.isFinite),'Finite offline scene positions');
 for(const p of c.body){for(const lang of ['en','pmy'])assert.ok(p.text[lang]);for(const id of p.claimIds)assert.ok(c.claimIds.includes(id),'Inline references stay in the selected file');}
 for(const id of c.reading)assert.ok(sources.has(id));
 for(const id of c.threadIds)assert.ok(record.threads.some(t=>t.id===id&&t.caseIds.includes(c.id)));
}
for(const s of record.sources){assert.match(s.url,/^https:\/\//);assert.ok(s.scope&&s.limitations&&s.family);assert.notEqual(s.id,'S41','Unavailable CIA lead must not become public evidence');}
assert.equal(claims.get('security-2024').amount.value,26000000);assert.equal(claims.get('security-2025').amount.value,23000000);assert.match(claims.get('security-2025').text.en,/in-kind/);
assert.equal(claims.get('excavator-order').amount.unit,'excavators');assert.equal(claims.get('excavator-order').amount.currency,null);
assert.equal(claims.get('beanal-litigation').object,'fcx','Do not turn PTFI into a named defendant in this US case');
assert.notEqual(entities.get('bahlil').kind,entities.get('investment').kind,'Person and office remain distinct');
assert.equal(entities.get('jhonlin').kind,'business-group','A business group is not assumed to be a single incorporated company');
assert.ok(!entities.get('amungme').aliases.includes('Kamoro'),'Distinct Papuan communities must not become aliases');
assert.ok(!entities.get('coalition').aliases.includes('Pusaka'),'A coalition member is a related search term, not the coalition’s identity');
assert.ok(!record.claims.some(c=>c.subject==='bin'&&c.object==='kiwirok'),'Do not invent the unresolved operational-use edge');
const lib=await build({entryPoints:['src/lib/investigations.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {normaliseSelection,selectionFromURL,selectionURL,searchRecord}=await import('data:text/javascript;base64,'+Buffer.from(lib.outputFiles[0].text).toString('base64'));
assert.equal(searchRecord(record,'Krusik','en')[0].id,'krusik','Search normalises diacritics');
assert.equal(searchRecord(record,'Haji Isham','pmy')[0].id,'isam','Aliases resolve a canonical person');
assert.equal(searchRecord(record,'Bahlil','pmy')[0].id,'bahlil','A person search must not silently resolve to their office');
assert.equal(searchRecord(record,'no-such-entity-zzz','en').length,0);
const state={caseId:'freeport',entity:'ptfi',claim:'security-2025',view:'timeline',evidence:true};
assert.deepEqual(selectionFromURL(selectionURL(new URL('https://westpapua.watch/id/topics/'),state),record),state,'A shared view restores the same evidence');
assert.equal(selectionURL(new URL('https://westpapua.watch/id/topics/#topics'),state).hash,'','A shared investigation must not jump to the topic directory');
const invalid=normaliseSelection({...state,caseId:'communications'},record);assert.equal(invalid.claim,'');assert.equal(invalid.entity,'');assert.equal(invalid.evidence,false,'A stale case selection cannot show foreign evidence');
const bundle=await build({entryPoints:['src/components/investigation/InvestigativeDesk.tsx'],bundle:true,write:false,format:'esm',platform:'browser',metafile:true,loader:{'.css':'empty'}});
for(const path of Object.keys(bundle.metafile.inputs))assert.ok(!/src\/data\/(archive|history-reading|library)\.ts|shared\/research\.ts|maplibre/.test(path),`Keep the complete source corpus and WebGL map out of the desk bundle: ${path}`);
const corpus=JSON.parse(await readFile('content/generated/site-search.json','utf8'));
assert.equal(corpus.filter(x=>x.type==='investigation').length,6);
assert.equal(corpus.filter(x=>x.type==='investigative-record').length,claims.size);
const support=corpus.find(x=>x.id==='claim:security-2025');assert.match(support.href,/case=freeport&claim=security-2025/);assert.ok(support.text.en.includes(sources.get('D03').url)&&support.text.pmy.includes(sources.get('D03').url),'Ask retrieval retains original evidence URLs in both languages');
console.log(`Passed: twenty retained threads, six bilingual cases, ${claims.size} supported relationships, precise financial records, shared-view validation, identity search and bounded client imports.`);
