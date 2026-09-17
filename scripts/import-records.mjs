import {readFile,writeFile,rename} from 'node:fs/promises';
import {build} from 'esbuild';
const filename=process.argv[2];if(!filename)throw Error('Usage: node scripts/import-records.mjs input.json [--write]');
const bundled=await build({entryPoints:['shared/records.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {validateRecord}=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const incoming=JSON.parse(await readFile(filename,'utf8'));if(!Array.isArray(incoming))throw Error('Expected an array of records');
const existing=JSON.parse(await readFile('content/records/curated.json','utf8'));const seen=new Set();
for(const r of incoming){validateRecord(r);if(seen.has(r.id))throw Error('Duplicate incoming identity: '+r.id);seen.add(r.id)}
const merged=new Map(existing.map(r=>[r.id,r]));for(const r of incoming)merged.set(r.id,r);
const rows=[...merged.values()];if(new Set(rows.map(r=>r.slug)).size!==rows.length)throw Error('Duplicate URL slug');
console.log(JSON.stringify({incoming:incoming.length,total:rows.length,mode:process.argv.includes('--write')?'write':'dry-run'}));
if(process.argv.includes('--write')){const path='content/records/curated.json';await writeFile(path+'.tmp',JSON.stringify(rows,null,2)+'\n');await rename(path+'.tmp',path)}
// The site build additionally checks identities and relationship targets against the whole catalogue.
