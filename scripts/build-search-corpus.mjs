import {build} from 'esbuild';
import {mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

// Resolve catalogue metadata during the build, never during Worker startup.
const temp=await mkdtemp(path.join(tmpdir(),'watch-site-search-'));
try{
 const modulePath=path.join(temp,'corpus.mjs');
 await build({entryPoints:['src/data/search.ts'],bundle:true,format:'esm',platform:'node',outfile:modulePath,define:{'import.meta.env':'{}'}});
 const {searchCorpus}=await import(pathToFileURL(modulePath).href);
 await mkdir('content/generated',{recursive:true});
 await writeFile('content/generated/site-search.json',JSON.stringify(searchCorpus)+'\n');
 console.log(`Built site search index: ${searchCorpus.length} records.`);
}finally{await rm(temp,{recursive:true,force:true})}
