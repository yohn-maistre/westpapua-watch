import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readFile,mkdtemp,writeFile} from 'node:fs/promises';
const temp=await mkdtemp('/tmp/watch-investigation-tests-');let index=0;
async function moduleAt(path){const r=await build({entryPoints:[path],bundle:true,write:false,format:'esm',platform:'node',define:{'import.meta.env':'{}'}});const file=`${temp}/${index++}.mjs`;await writeFile(file,r.outputFiles[0].text);return import(file)}
const {meraukeRecords:records,investigationNodes:nodes,investigationEdges:edges,overviewCases}=await moduleAt('src/data/investigations.ts');
assert.equal(records.length,42,'The established full Merauke chronology is retained');
assert.equal(new Set(records.map(r=>r.id)).size,records.length);
assert.equal(new Set(nodes.map(n=>n.id)).size,nodes.length);
assert.equal(new Set(edges.map(e=>e.id)).size,edges.length);
for(const edge of edges){
 const record=records.find(r=>r.id===edge.recordId);assert.ok(record,`Missing evidence record for ${edge.id}`);
 for(const endpoint of [edge.from,edge.to]){const node=nodes.find(n=>n.id===endpoint);assert.ok(node,`Unknown entity ${endpoint}`);assert.ok(node.recordIds.includes(record.id),`${endpoint} must include supporting record ${record.id}`)}
 assert.ok(/^https:\/\//.test(record.source));assert.ok(record.date);
 for(const lang of ['en','pmy'])assert.ok(edge.label[lang]);
}
for(const node of nodes){for(const id of node.recordIds)assert.ok(records.some(r=>r.id===id));for(const lang of ['en','pmy'])assert.ok(node.label[lang]&&node.kind[lang]);}
for(const record of records){if(record.excerpt){assert.ok(record.locator);assert.ok(record.source.startsWith('https://pusaka.or.id/'));}for(const lang of ['en','pmy'])assert.ok(record.title[lang]&&record.text[lang]);}
const {readingRecords,chaptersForPath}=await moduleAt('src/data/history-reading.ts');
assert.equal(readingRecords.length,75,'Changing the default entry must not remove earlier accounts');
assert.ok(chaptersForPath('political')[0].panels.some(p=>p.records.some(r=>r.id==='history-1949')),'Modern political opening starts at 1949');
for(const id of ['history-tidore','history-1828','history-digoel','history-koreri','history-wwii'])assert.ok(readingRecords.some(r=>r.id===id),'Earlier history retained: '+id);
for(const item of overviewCases){assert.ok(readingRecords.some(r=>r.id===item.history));assert.ok(Number.isFinite(item.longitude)&&Number.isFinite(item.latitude));for(const lang of ['en','pmy'])assert.ok(item.title[lang]&&item.summary[lang]);}
const {sourceById}=await moduleAt('src/data/sources.ts');const cases=JSON.parse(await readFile('content/following.json','utf8'));
for(const slug of ['south-papua-food-energy-estate','mining-raja-ampat']){const item=cases.find(c=>c.slug===slug);assert.notEqual(item.summary.en,item.title.en);assert.ok(item.sourceIds.length);for(const id of item.sourceIds)assert.ok(sourceById[id]);}
const {libraryItems}=await moduleAt('src/data/library.ts');
for(const id of ['ZWp5904RkJY','65_DgLwjePA','nSf3268tAbg'])assert.ok(libraryItems.some(item=>item.itemType==='film'&&item.url.includes(id)));
const component=await build({entryPoints:['src/components/investigation/InvestigationExplorer.tsx'],bundle:true,write:false,format:'esm',platform:'browser',metafile:true,loader:{'.css':'empty'}});
for(const path of Object.keys(component.metafile.inputs))assert.ok(!['src/data/history-reading.ts','src/data/history-prototype.ts','src/data/archive.ts','shared/research.ts'].includes(path),`Do not send the full history/library corpus into the interactive canvas bundle: ${path}`);
console.log('Passed: evidence-backed edges/entities, complete Merauke timeline, five-path History retention and 1949 opening, sourced homepage cases, credited Library films and bounded client imports.');
