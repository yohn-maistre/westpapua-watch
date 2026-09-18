import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
const load=async path=>{const r=await build({entryPoints:[path],bundle:true,write:false,format:'esm',platform:'node'});return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'))};
const {enqueueEditorialBacklog}=await load('services/watch-engine/src/cluster/editorial.ts');
const {recordEngineActivity,engineActivity}=await load('services/watch-engine/src/activity.ts');
const db=new DatabaseSync(':memory:');
db.exec(`CREATE TABLE developments(id INTEGER PRIMARY KEY,pipeline_version INTEGER DEFAULT 2,editorial_pending INTEGER DEFAULT 1,status TEXT DEFAULT 'held',editorial_dispatch_id TEXT,editorial_dispatched_at TEXT,editorial_started_at TEXT,editorial_not_before TEXT,updated_at TEXT);
CREATE TABLE articles(id INTEGER PRIMARY KEY,published_at TEXT);CREATE TABLE development_articles(development_id INTEGER,article_id INTEGER);`);
const DB={prepare(sql){let args=[];return {bind(...a){args=a;return this},async first(){return db.prepare(sql).get(...args)},async all(){return {results:db.prepare(sql).all(...args)}},async run(){return {meta:{changes:Number(db.prepare(sql).run(...args).changes)}}}}}};
const sent=[];const env={DB,EDITORIAL_QUEUE:{async send(message,options){sent.push({id:message.developmentIds[0],delay:options.delaySeconds})}}};
for(let id=1;id<=9;id++){
 db.prepare('INSERT INTO developments(id,updated_at) VALUES(?,?)').run(id,`2026-01-${String(id).padStart(2,'0')}`);
 db.prepare("INSERT INTO articles VALUES(?,datetime('now',?))").run(id,id<=3?'-10 days':id===9?'+5 days':'-1 hour');
 db.prepare('INSERT INTO development_articles VALUES(?,?)').run(id,id);
}
db.exec("UPDATE developments SET editorial_not_before=datetime('now','+1 day') WHERE id=8;UPDATE developments SET status='filtered' WHERE id=7");
const first=await enqueueEditorialBacklog(env,4);
assert.deepEqual(sent.map(x=>x.id),[4,5,1,2]);assert.deepEqual(sent.map(x=>x.delay),[0,180,360,540]);assert.equal(first.freshQueued,2);assert.equal(first.backlogQueued,2);
await enqueueEditorialBacklog(env,4);assert.deepEqual(sent.slice(4).map(x=>x.id),[6,3,9]);
assert.equal(db.prepare('SELECT editorial_pending p FROM developments WHERE id=8').get().p,1);
assert.equal(db.prepare('SELECT editorial_pending p FROM developments WHERE id=7').get().p,1);
assert.equal(await engineActivity(env),null);
db.exec(await readFile('services/watch-engine/migrations/0020_engine_activity.sql','utf8'));
assert.equal(await engineActivity(env),null);
await recordEngineActivity(env,'backfill',{enqueued:10});assert.equal(await engineActivity(env),null,'Backfill must not impersonate a normal completed cycle');
await recordEngineActivity(env,'normal',{editorial:first,discoveryFailed:false});const activity=await engineActivity(env);assert.ok(Date.parse(activity.completed_at));assert.equal(activity.editorial.freshQueued,2);assert.equal(activity.editorial.backlogQueued,2);
db.close();
const data=await readFile('dist/data/index.html','utf8');assert.ok(!data.includes('Explore supporting records'));assert.ok(data.includes('/data/observations.json'));
const observations=JSON.parse(await readFile('dist/data/observations.json','utf8'));assert.ok(observations.records.length);assert.ok(observations.records.every(r=>r.observations.length&&r.sources.length));
for(const path of ['dist/resources/index.html','dist/id/resources/index.html']){
 const html=await readFile(path,'utf8');assert.equal((html.match(/<details[^>]*data-directory-section/g)||[]).length,4);assert.equal((html.match(/data-organization-text=/g)||[]).length,39);assert.equal((html.match(/id="watch-menu"/g)||[]).length,1);assert.ok(html.includes('aria-haspopup="dialog"'));assert.ok(!html.includes('organization-tile'));
}
console.log('Passed: fresh/backlog fairness, unused-slot fill, future-date handling, cooldown/rejection protection, pacing, accurate activity semantics, indicator download, bilingual directory/menu rendering.');
