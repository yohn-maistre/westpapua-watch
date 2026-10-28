import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {build} from 'esbuild';
const data=JSON.parse(await readFile('content/investigative-record.json','utf8'));
const bundle=await build({entryPoints:['src/lib/investigation-network.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {networkModel}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const layouts={};
for(const dossier of data.cases){
 const base=data.claims.filter(c=>dossier.claimIds.includes(c.id)),ids=new Set(base.flatMap(c=>[c.subject,c.object]));
 const files=new Set(data.cases.filter(c=>data.claims.some(k=>c.claimIds.includes(k.id)&&(ids.has(k.subject)||ids.has(k.object)))).map(c=>c.id));
 const related=data.claims.filter(c=>c.cases.some(id=>files.has(id)));
 for(const [key,claims] of [[dossier.id,base],[dossier.id+':related',related],['all',data.claims]]){
  if(layouts[key])continue;layouts[key]={};
  for(const [format,width,height] of [['desktop',1000,560],['phone',360,380]]){
   const model=networkModel(data,dossier,claims,width,height);model.simulation.stop();
   layouts[key][format]=Object.fromEntries(model.nodes.map(n=>[n.id,[Number((n.x/width).toFixed(5)),Number((n.y/height).toFixed(5))]]));
  }
 }
}
await mkdir('content/generated',{recursive:true});
const path='content/generated/investigative-layouts.json',json=JSON.stringify(layouts)+'\n';
if(await readFile(path,'utf8').catch(()=>'')!==json)await writeFile(path,json);
console.log('Built '+Object.keys(layouts).length+' deterministic network layouts for desktop and phone.');
