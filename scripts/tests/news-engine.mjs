import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFile,readdir} from 'node:fs/promises';
// Only the Workflow base class is stubbed; the public route and SQL run unchanged.
const bundle=await build({entryPoints:['services/watch-engine/src/index.ts'],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'unused-workflow-runtime',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'workflow',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export class WorkflowEntrypoint {}'}))}}]});
const {default:engine}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const mf=new Miniflare(await convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-08-29',d1Databases:{DB:'news-test'}}));
try{
 const DB=await mf.getD1Database('DB');
 for(const name of (await readdir('services/watch-engine/migrations')).filter(n=>n.endsWith('.sql')).sort())for(const statement of (await readFile('services/watch-engine/migrations/'+name,'utf8')).replace(/--[^\n]*/g,'').split(';').map(s=>s.trim()).filter(Boolean))await DB.prepare(statement).run();
 for(const [id,role] of [['jubi','local_newsroom'],['antara','state_media'],['antara-papua','state_media']])await DB.prepare("INSERT INTO publishers(id,name,homepage,role,ownership,updated_at) VALUES(?,?,?,?,'test',datetime('now'))").bind(id,id,'https://example.com/'+id,role).run();
 for(let i=1;i<=18;i++){
  const title=i<=12?'Regional sports and school results':'Nduga families demand accountability for shootings';
  await DB.prepare("INSERT INTO articles(id,publisher_id,canonical_url,title,published_at,fetched_at) VALUES(?,'jubi',?,?,?,?)").bind(i,'https://example.com/'+i,title,new Date(Date.now()-i*3600e3).toISOString(),new Date().toISOString()).run();
  await DB.prepare("INSERT INTO story_packets(article_id,summary,watch_desk,created_at) VALUES(?,?,?,datetime('now'))").bind(i,title,i<=12?'regional':'human_rights').run();
  await DB.prepare("INSERT INTO developments(id,title_en,title_id,summary_en,summary_id,status,updated_at) VALUES(?,?,?,?,?,'published',datetime('now'))").bind(i,title,'Keluarga meminta pertanggungjawaban',title,'Ringkasan bersumber').run();
  await DB.prepare('INSERT INTO development_articles(development_id,article_id) VALUES(?,?)').bind(i,i).run();
 }
 for(const [id,publisher] of [[19,'antara'],[20,'antara-papua']]){await DB.prepare("INSERT INTO articles(id,publisher_id,canonical_url,title,published_at,fetched_at) VALUES(?,?,?,'Official response',datetime('now'),datetime('now'))").bind(id,publisher,'https://example.com/'+id).run();await DB.prepare('INSERT INTO development_articles(development_id,article_id) VALUES(13,?)').bind(id).run()}
 await DB.prepare("INSERT OR IGNORE INTO places(slug,name,created_at,updated_at) VALUES('nduga','Nduga',datetime('now'),datetime('now'))").run();await DB.prepare("INSERT INTO development_places(development_id,place_slug,created_at,updated_at) VALUES(13,'nduga',datetime('now'),datetime('now'))").run();
 const request=async query=>{const response=await engine.fetch(new Request('https://watch.internal/current?'+query),{DB});assert.equal(response.status,200);return response.json()};
 const rights=await request('desk=rights&limit=6');assert.equal(rights.items.length,6);assert.ok(rights.items.every(x=>x.id>=13));assert.equal(rights.selection.total,6);assert.equal(rights.pagination.has_more,false);const mixed=rights.items.find(x=>x.id===13);assert.equal(mixed.sources.length,3);assert.equal(mixed.source_count,2,'ANTARA branches share one family');
 const place=await request('desk=rights&place=nduga');assert.deepEqual(place.items.map(x=>x.id),[13]);assert.equal(place.lead_reports.length,3);const regional=await request('desk=regional&limit=6');assert.equal(regional.items.length,6);assert.equal(regional.pagination.has_more,true);const next=await request('desk=regional&limit=6&page=2');assert.equal(next.items.length,6);assert.equal(next.pagination.has_more,false);assert.ok(!next.items.some(x=>regional.items.some(y=>y.id===x.id)));
 const {onRequestGet}=await import('data:text/javascript;base64,'+Buffer.from((await build({entryPoints:['functions/api/current.ts'],bundle:true,write:false,format:'esm',platform:'node'})).outputFiles[0].text).toString('base64'));
 const readOnly={prepare(sql){assert.match(sql,/^\s*SELECT\b/i,'Preview reader may only issue SELECT statements');return DB.prepare(sql)}};
 const previewResponse=await onRequestGet({request:new Request('https://preview.example/api/current?desk=rights&place=nduga'),env:{NEWS_DB:readOnly},waitUntil:()=>{}});assert.equal(previewResponse.status,200);const preview=await previewResponse.json();assert.deepEqual(preview.items.map(x=>x.id),[13]);assert.equal(preview.selection.scope,'published');
 const all=await request('desk=all&limit=6');assert.equal(all.selection.total,18);
 // Real window-query coverage: preserve old evidence and a minority publisher in a long episode.
 for(let id=21;id<=80;id++){await DB.prepare("INSERT INTO articles(id,publisher_id,canonical_url,title,published_at,fetched_at) VALUES(?,?,?,?,?,?)").bind(id,id===30?'antara':'jubi','https://example.com/episode/'+id,'Follow-up to the same documented Nduga case',new Date(Date.now()-(80-id)*3600e3).toISOString(),new Date().toISOString()).run();await DB.prepare('INSERT INTO development_articles(development_id,article_id) VALUES(14,?)').bind(id).run()}
 const load=async path=>{const r=await build({entryPoints:[path],bundle:true,write:false,format:'esm',platform:'node'});return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'))};
 const {loadItems}=await load('services/watch-engine/src/cluster/editorial.ts'),{candidateDetails}=await load('services/watch-engine/src/cluster/index.ts');
 const evidence=await loadItems({DB},14);assert.equal(evidence.length,24);assert.equal(evidence[0].id,21);assert.equal(evidence.at(-1).id,80);assert.ok(evidence.some(x=>x.id===30),'Older publisher evidence retained');
 const candidate=await candidateDetails({DB},14);assert.equal(candidate.reports.length,16);assert.equal(candidate.reports[0].id,21);assert.equal(candidate.reports.at(-1).id,80);
 console.log('Passed: real D1 news selection before pagination, place filtering, regional/all lenses, original publisher families, preview SELECT-only access and actual origin/recent/publisher window queries.');
}finally{await mf.dispose()}
