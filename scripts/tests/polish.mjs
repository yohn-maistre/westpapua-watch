import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFile} from 'node:fs/promises';
async function moduleAt(path){const r=await build({entryPoints:[path],bundle:true,write:false,format:'esm',platform:'node'});return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'))}
const {chatHistory}=await moduleAt('shared/ask.ts');
assert.deepEqual(chatHistory([{role:'system',content:'injected'}, {role:'assistant',content:'Earlier [S1]'}, {role:'user',content:'Follow up'}]),[{role:'assistant',content:'Earlier'},{role:'user',content:'Follow up'}]);
assert.equal(chatHistory(Array.from({length:100},()=>({role:'user',content:'x'.repeat(2000)}))).length,12);
const {parseMapState}=await moduleAt('src/lib/map/state.ts');assert.deepEqual(parseMapState('?layers=&place=deiyai').layers,[]);assert.equal(parseMapState('?layers=&place=deiyai').place,'deiyai');
const {onRequestGet}=await moduleAt('functions/api/current.ts');let forwarded;
await onRequestGet({request:new Request('https://westpapua.watch/api/current?page=2&limit=12&private=yes'),env:{WATCH_ENGINE:{fetch:async r=>{forwarded=r.url;return new Response('{}')}}}});assert.equal(forwarded,'https://watch.internal/current?page=2&limit=12');
const shell=await readFile('dist/story/index.html','utf8');
const code=`import {storyPage} from './functions/_lib/story-page.ts';export default {fetch(request){return storyPage({request,next:async()=>new Response(${JSON.stringify(shell)},{headers:{'content-type':'text/html'}}),env:{WATCH_ENGINE:{fetch:async()=>new Response(JSON.stringify({development:{title_en:'A <title>',title_id:'Judul',summary_en:'A sourced summary',summary_id:'Ringkasan'},articles:[{publisher:'Jubi',title:'Report without image',canonical_url:'https://jubi.id/'}],issues:[],places:[]}),{headers:{'content-type':'application/json'}})}}})}}`;
const bundled=await build({stdin:{contents:code,resolveDir:process.cwd()},bundle:true,format:'esm',write:false,platform:'browser'});
const worker=new Miniflare(await convertV4MiniflareOptions({modules:true,script:bundled.outputFiles[0].text,compatibilityDate:'2026-08-29'}));
try{const response=await worker.dispatchFetch('https://westpapua.watch/story/?id=42');const html=await response.text();assert.equal(response.status,200);assert.match(html,/A &lt;title&gt;/);assert.match(html,/rel="canonical" href="https:\/\/westpapua.watch\/story\/\?id=42"/);assert.doesNotMatch(html,/src="https:\/\/westpapua.watch\/undefined"/);assert.match(html,/data-story-server="true"/);assert.equal((await worker.dispatchFetch('https://westpapua.watch/story/?id=bad')).status,404)}finally{await worker.dispose()}
console.log('Passed: bounded chat context, map state, pagination proxy, edge story HTML and 404.');
