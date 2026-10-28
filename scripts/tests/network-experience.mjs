import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
const data=JSON.parse(await readFile('content/investigative-record.json','utf8'));
async function module(path){const out=await build({entryPoints:[path],bundle:true,format:'esm',platform:'node',write:false});return import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'))}
const {networkModel}=await module('src/lib/investigation-network.ts');
const {deskClaims,normaliseSelection,selectionURL,selectionFromURL}=await module('src/lib/investigations.ts');
const ids=new Set(data.claims.map(c=>c.id));
for(const entity of data.entities)if(entity.profile){assert.ok(entity.profile.text.en&&entity.profile.text.pmy);assert.ok(entity.profile.claimIds.length);for(const id of entity.profile.claimIds)assert.ok(ids.has(id),'Entity context cites accepted records: '+entity.id)}
for(const claim of data.claims)assert.ok(['authority','business','land','accountability'].includes(claim.category),'A translated title is not a relationship classifier: '+claim.id);
for(const dossier of data.cases)if(dossier.groups){const assigned=dossier.groups.flatMap(g=>g.entityIds);assert.equal(new Set(assigned).size,assigned.length);assert.deepEqual(new Set(assigned),new Set(Object.keys(dossier.scene)),'Editorial groups cover the actual case');}
const merauke=data.cases.find(c=>c.id==='merauke'),original=JSON.stringify(data);
const times=[];
for(const scope of [undefined,'related','all']){
 const claims=deskClaims(data,'merauke',scope);const started=performance.now();
 const a=networkModel(data,merauke,claims,900,560),b=networkModel(data,merauke,claims,900,560);
 assert.deepEqual(a.nodes.map(n=>[n.id,n.x,n.y]),b.nodes.map(n=>[n.id,n.x,n.y]),'Stable seeds produce reproducible layout');
 for(const node of a.nodes)assert.ok(Number.isFinite(node.x)&&Number.isFinite(node.y)&&node.x>=0&&node.x<=900&&node.y>=0&&node.y<=560);
 assert.equal(a.links.length,claims.length,'Every visible link is one accepted claim');
 a.simulation.stop();b.simulation.stop();times.push({scope:scope||'case',nodes:a.nodes.length,milliseconds:Math.round(performance.now()-started)});
}
assert.equal(JSON.stringify(data),original,'D3 must never mutate the accepted entities, claims or source record');
assert.ok(deskClaims(data,'merauke','related').length>merauke.claimIds.length);
const state={caseId:'merauke',entity:'',claim:'',source:'D03',scope:'all',lens:'business',view:'connections',evidence:true};
assert.deepEqual(selectionFromURL(selectionURL(new URL('https://westpapua.watch/topics/south-papua-food-energy-estate/'),state),data),state,'A shared document restores exact source, scope and lens');
const invalid=normaliseSelection({...state,scope:undefined},data);assert.equal(invalid.source,undefined);assert.equal(invalid.evidence,false,'Foreign source IDs do not cross case boundaries without expanded scope');
assert.ok(data.claims.some(c=>c.id==='road-halt-2026')&&data.claims.some(c=>c.id==='merauke-road-ruling'),'Interim instruction survives the later judgment');
assert.ok(!data.claims.some(c=>c.subject==='isam'&&c.object==='campaign'),'Do not invent a donation to connect the canvas');
console.log('Passed: sourced bilingual profiles, explicit relationship types, complete editorial groups, immutable deterministic force layouts and shared scoped documents.',JSON.stringify(times));
