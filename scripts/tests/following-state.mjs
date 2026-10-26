import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
const tmp=await mkdtemp('/tmp/watch-following-state-');
async function moduleAt(path){const out=await build({entryPoints:[path],bundle:true,write:false,format:'esm',platform:'node'});const p=tmp+'/'+path.split('/').at(-1)+'.mjs';await writeFile(p,out.outputFiles[0].text);return import(p)}
const {followingEntries,preferredCaseState}=await moduleAt('shared/following-state.ts');
const seeds=JSON.parse(await readFile('content/following.json','utf8'));
const merauke=seeds.find(s=>s.slug==='south-papua-food-energy-estate');
const old={...merauke.state,asOf:'2026-01-01'};
assert.equal(preferredCaseState(merauke.state,old).asOf,merauke.state.asOf,'An old DB snapshot cannot hide a later curated correction');
const current={...merauke.state,asOf:'2026-10-25',kind:'weekly'};
assert.equal(preferredCaseState(merauke.state,current).kind,'weekly');
const candidate={id:999,publication_kind:'reviewed',story_url:'/story/?id=999',latest_report_at:'2026-10-26T04:00:00Z',title:{en:'Merauke food estate road approval challenged in court',id:'Persetujuan jalan proyek pangan Merauke digugat di pengadilan'},summary:{en:'The Malind case concerns the food estate road permit in Merauke.',id:'Perkara Malind menyangkut izin jalan proyek pangan di Merauke.'},latest_source:{publisher:'Test original newsroom'}};
const items=followingEntries(seeds,[{slug:merauke.slug,state:old}],[candidate],Date.parse('2026-10-27'));
const selected=items.find(x=>x.slug===merauke.slug);
assert.equal(selected.update.kind,'report');assert.equal(selected.update.reportURL,candidate.story_url);assert.equal(selected.update.title.pmy,candidate.title.id);
assert.equal(selected.state.asOf,merauke.state.asOf,'New reporting is separate from the accepted case synthesis');
assert.ok(selected.state.evidence.some(s=>s.id==='merauke-road-verdict-2026'));
for(const bad of [{...candidate,latest_report_at:null,updated_at:'2026-10-26'},{...candidate,latest_report_at:'2025-01-01',updated_at:'2026-10-26'},{...candidate,publication_kind:'excerpt'},{...candidate,latest_report_at:'2027-01-01'},{...candidate,latest_source:{}},{...candidate,title:{en:candidate.title.en,id:candidate.title.en}},{...candidate,title:{en:'Sentani market road repairs',id:'Perbaikan jalan pasar Sentani'},summary:{en:'A local market road repair in Sentani',id:'Perbaikan jalan pasar setempat di Sentani'}},{...candidate,story_url:'javascript:alert(1)'}])assert.notEqual(followingEntries(seeds,[],[bad],Date.parse('2026-10-27')).find(x=>x.slug===merauke.slug).update.kind,'report');
const {onRequestGet}=await moduleAt('functions/api/following.ts');
const calls=[];
const mockEngine={fetch:async(request)=>{
 const path=new URL(request.url).pathname;calls.push(path);
 return Response.json(path==='/following'?{items:[{slug:merauke.slug,state:old}]}:{items:[candidate]});
}};
const response=await onRequestGet({request:new Request('https://test.local/api/following'),env:{WATCH_ENGINE:mockEngine},waitUntil:()=>{}});
assert.equal(response.status,200);assert.equal(calls.length,2);assert.equal((await response.json()).items.find(x=>x.slug===merauke.slug).update.kind,'report');
const fallback=await onRequestGet({request:new Request('https://test.local/api/following'),env:{},waitUntil:()=>{}});const data=await fallback.json();assert.equal(data.engine,false);assert.equal(data.items.length,seeds.length);assert.ok(data.items.every(x=>x.state&&x.update));
console.log('Passed: curated/snapshot precedence, newer published reporting, source and locale boundaries, case scopes, safe URLs, two-read API and graceful fallback.');
