import assert from 'node:assert/strict';
import {build} from 'esbuild';
const compiled=await build({entryPoints:['shared/research.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {researchRecords,researchLibrary}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
assert.equal(researchRecords.length,372);
assert.equal(new Set(researchRecords.map(r=>r.item.id)).size,372);
assert.equal(researchLibrary.length,322);
for(const r of researchRecords){if(r.published)assert.match(r.item.url,/^https?:\/\//);else assert.ok(r.reason);}
const sharedUrls=new Map();for(const r of researchLibrary){const values=sharedUrls.get(r.url)||[];values.push(r.id);sharedUrls.set(r.url,values)}
assert.ok([...sharedUrls.values()].some(ids=>ids.length>1),'Distinct works sharing a collection URL survive');
assert.ok(researchRecords.some(r=>r.reason==='conflicting-doi'));
assert.ok(researchLibrary.some(r=>r.following.length>0));
console.log('Passed: 372 unique records, 322 catalogue entries, review exclusions, DOI conflicts and shared-URL work identity.');
const contract=await build({entryPoints:['shared/library.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {normalizeLibraryItem,mergeLibraryItems}=await import('data:text/javascript;base64,'+Buffer.from(contract.outputFiles[0].text).toString('base64'));
const a=normalizeLibraryItem({title:'One work',url:'https://publisher.example/doi/full/10.1234/example',publishedAt:'2025'});
const b=normalizeLibraryItem({recordId:'research:one',title:'One work',url:'https://doi.org/10.1234/example',doi:'10.1234/example',authors:['An Author']});
const merged=mergeLibraryItems([a],[b]);assert.equal(merged.length,1);assert.deepEqual(merged[0].authors,['An Author']);assert.ok(merged[0].alternateUrls.includes(b.url));
console.log('Passed: publisher/DOI duplicate merges preserve authors and alternate links.');
