import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {build} from 'esbuild';
import {readFile,readdir} from 'node:fs/promises';
const moduleAt=async path=>{const r=await build({entryPoints:[path],bundle:true,write:false,format:'esm',platform:'node'});return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'))};
const {literalExcerpt,publishLiteralExcerpt,reserveEditorialSlot,processEditorialJob}=await moduleAt('services/watch-engine/src/cluster/editorial.ts');
const db=new DatabaseSync(':memory:');for(const name of (await readdir('services/watch-engine/migrations')).filter(x=>x.endsWith('.sql')).sort())db.exec(await readFile('services/watch-engine/migrations/'+name,'utf8'));
const DB={prepare(sql){let args=[];return {bind(...a){args=a;return this},async first(){return db.prepare(sql).get(...args)},async all(){return {results:db.prepare(sql).all(...args)}},async run(){return {meta:{changes:Number(db.prepare(sql).run(...args).changes)}}}}}};
const env={DB,AUTO_PUBLISH:'true'};
assert.deepEqual(await Promise.all([reserveEditorialSlot(env),reserveEditorialSlot(env)]),[true,false]);
const item={id:1,title:'A school programme opens in Papua',summary:'The local newsroom reported that a school programme opened this week in Papua with teachers and community members attending the opening. Additional details will be provided by the school in its next public statement.',publisher:'Local newsroom',role:'local_newsroom',item_type:'reporting',watch_relevance:1,watch_relevance_confidence:.96,published_at:new Date().toISOString(),packet_summary:'Generated text must never enter an excerpt.'};
const job={id:1,dev:{status:'held'},items:[item],repair:''};
const excerpt=literalExcerpt(job);assert.ok(excerpt);assert.equal(excerpt.excerpt.split(/\s+/).length,24);assert.ok(!excerpt.excerpt.includes('Generated text'));
assert.equal(literalExcerpt({...job,repair:'An earlier critic rejected a claim'}),null);assert.equal(literalExcerpt({...job,dev:{status:'published'}}),null);assert.equal(literalExcerpt({...job,items:[{...item,watch_relevance_confidence:.3}]}),null);
assert.equal(literalExcerpt({...job,items:[{...item,summary:'<p>'+item.summary+'</p>'}]}),null);
// SQLite enforces the same lease and review invariants used by D1.
db.exec("INSERT INTO publishers(id,name,homepage,role,ownership,updated_at) VALUES('local','Local newsroom','https://example.com','local_newsroom','non_state',datetime('now'));");
const columns=db.prepare('PRAGMA table_info(articles)').all();
const required=columns.filter(x=>x.notnull&&!x.dflt_value).map(x=>x.name);
const values={id:1,publisher_id:'local',url:'https://example.com/report',canonical_url:'https://example.com/report',title:item.title,summary:item.summary,fetched_at:new Date().toISOString(),content_hash:'test',status:'processed'};
const names=Object.keys(values).filter(k=>columns.some(x=>x.name===k));
db.prepare(`INSERT INTO articles(${names.join(',')}) VALUES(${names.map(()=>'?').join(',')})`).run(...names.map(k=>values[k]));
db.exec("INSERT INTO developments(id,title_en,status,editorial_dispatch_id,updated_at) VALUES(1,'Pending title','held','valid',datetime('now'))");
assert.equal(await publishLiteralExcerpt(env,job,'stale'),false);
assert.equal(await publishLiteralExcerpt({...env,AUTO_PUBLISH:'false'},job,'valid'),false);
assert.equal(await publishLiteralExcerpt(env,job,'valid'),true);
const published=db.prepare('SELECT * FROM developments WHERE id=1').get();assert.equal(published.publication_kind,'source_excerpt');assert.equal(published.status,'published');assert.equal(published.excerpt_article_id,1);assert.match(published.summary_en,/Source excerpt/);assert.equal(db.prepare('SELECT COUNT(*) n FROM critic_reviews').get().n,0);assert.equal(db.prepare('SELECT COUNT(*) n FROM development_syntheses').get().n,0);
assert.equal(await publishLiteralExcerpt(env,job,'valid'),false);
const {publicRecords}=await moduleAt('src/data/records.ts');const places=publicRecords.filter(r=>r.kind==='place');assert.equal(places.length,6);for(const p of places){assert.equal(p.observations.length,12);assert.ok(p.observations.every(o=>o.period&&o.source.url&&o.method));}
const otsus=JSON.parse(await readFile('content/data/otsus.json'));assert.equal(otsus.rows.length,6);const mbg=JSON.parse(await readFile('content/data/sppg.json'));assert.equal(mbg.features.length,58);assert.ok(mbg.features.every(f=>['Penentuan KA SPPG','Belum Beroperasi'].includes(f.properties.status)));
const {parseStructured}=await moduleAt('services/watch-engine/src/llm.ts');assert.throws(()=>parseStructured('{"title":"  "}',{type:'object',properties:{title:{type:'string',minLength:3}},required:['title']}));
// Real publication path: malformed success -> excerpt -> later alternate route -> critic pass.
db.exec("INSERT INTO development_articles(development_id,article_id) VALUES(1,1); INSERT INTO story_packets(article_id,summary,watch_relevance,watch_relevance_confidence,item_type,created_at) VALUES(1,'A local school programme was reported.',1,.96,'reporting',datetime('now')); UPDATE developments SET status='held',editorial_dispatch_id='first',editorial_started_at=NULL,publication_kind='reviewed',provider_backoff_count=0 WHERE id=1; UPDATE editorial_pacing SET next_allowed_at='1970-01-01';");
DB.batch=async statements=>{db.exec('BEGIN');try{const out=[];for(const stmt of statements)out.push(await stmt.run());db.exec('COMMIT');return out}catch(e){db.exec('ROLLBACK');throw e}};
const originalFetch=globalThis.fetch;const requests=[];
const gatewayEnv={...env,AI_GATEWAY_BASE:'https://gateway.invalid',AI_GATEWAY_TOKEN:'test'};
try{
 globalThis.fetch=async(_url,init)=>{requests.push(JSON.parse(init.body));return new Response(JSON.stringify({choices:[{message:{content:'DEVELOPMENT 1: incomplete'}}]}),{headers:{'content-type':'application/json'}})};
 await processEditorialJob(gatewayEnv,{dispatchId:'first',developmentIds:[1]});
 let state=db.prepare('SELECT * FROM developments WHERE id=1').get();assert.equal(state.status,'published');assert.equal(state.publication_kind,'source_excerpt');assert.equal(state.editorial_pending,1);assert.equal(state.provider_backoff_count,1);assert.equal(state.editorial_dispatch_id,null);assert.equal(requests.length,1);
 db.exec("UPDATE developments SET editorial_dispatch_id='second',editorial_started_at=NULL WHERE id=1; UPDATE editorial_pacing SET next_allowed_at='1970-01-01'");
 globalThis.fetch=async(_url,init)=>{const body=JSON.parse(init.body);requests.push(body);const content=body.model==='dynamic/watch-synth-alt'?{items:[{development_id:1,title_en:'A school programme opens in Papua',title_id:'Program sekolah dibuka di Papua',summary_en:'According to the local newsroom, a school programme opened in Papua with teachers and community members attending.',summary_id:'Menurut media lokal, program sekolah dibuka di Papua dengan kehadiran guru dan anggota masyarakat.'}]}:{items:[{development_id:1,verdict:'pass',unsupported_claims:[],framing_problems:[],cluster_problem:false,relevance_problem:false,note:'Supported and attributed.'}]};return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(content)}}]}),{headers:{'content-type':'application/json'}})};
 await processEditorialJob(gatewayEnv,{dispatchId:'second',developmentIds:[1]});
 state=db.prepare('SELECT * FROM developments WHERE id=1').get();assert.equal(state.publication_kind,'reviewed');assert.equal(state.editorial_pending,0);assert.equal(state.excerpt_article_id,null);assert.equal(requests[1].model,'dynamic/watch-synth-alt');assert.equal(requests.length,3);assert.equal(db.prepare('SELECT COUNT(*) n FROM critic_reviews').get().n,1);assert.equal(db.prepare('SELECT COUNT(*) n FROM development_syntheses').get().n,1);
}finally{globalThis.fetch=originalFetch}
db.close();console.log('Passed: atomic pacing, literal-only fallback, relevance/HTML/lease protections, no fabricated review, shared province observations and MBG status integrity.');

const {retrieveSite}=await moduleAt('shared/site-retrieval.ts');const found=retrieveSite('Papua Tengah APBD expenditure 2024','en',6);assert.ok(found.some(x=>x.kind==='observation'&&x.text.includes('3725583867579')));console.log('Passed: Ask retrieves a sourced numerical observation with period and method.');
