#!/usr/bin/env node
/**
 * Bounded content transaction runner for the West Papua Watch Librarian.
 * It accepts only a pre-validated action payload on stdin; it never accepts
 * paths, shell fragments, git arguments, or arbitrary file edits.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=process.cwd();
const allowedTypes=new Set(['article','book','collection','documentary','official','report','research']);
const allowedFormats=new Set(['pdf','video','web']);
const allowedLanguages=new Set(['en','id','multi','pmy']);
const idPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const https=/^https:\/\/.+/;
const fail=(message,code=1)=>{console.error(message);process.exit(code)};
const read=(rel)=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const write=(rel,data)=>fs.writeFileSync(path.join(root,rel),JSON.stringify(data,null,2)+'\n');
const run=(cmd,args)=>{const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8'});if(r.status!==0)fail((r.stderr||r.stdout||`${cmd} failed`).trim());return r.stdout.trim()};
const requireString=(v,name,{optional=false}={})=>{if(optional&&(v===undefined||v===null||v===''))return undefined;if(typeof v!=='string'||!v.trim())fail(`${name} must be a non-empty string`);return v.trim()};
const validateRecord=(record,{existing=false}={})=>{
  const id=requireString(record.id,'id'); if(!idPattern.test(id))fail('id must be a lowercase kebab-case identifier');
  const title=requireString(record.title,'title'); const publisher=requireString(record.publisher,'publisher');
  const url=requireString(record.url,'url'); if(!https.test(url))fail('url must use https');
  const type=requireString(record.type,'type'); if(!allowedTypes.has(type))fail(`unsupported type ${type}`);
  const format=requireString(record.format,'format'); if(!allowedFormats.has(format))fail(`unsupported format ${format}`);
  const language=requireString(record.language,'language'); if(!allowedLanguages.has(language))fail(`unsupported language ${language}`);
  if(!Array.isArray(record.tags)||!record.tags.length||record.tags.some(t=>typeof t!=='string'||!t.trim()))fail('tags must be a non-empty string array');
  const description=requireString(record.description,'description',{optional:true})??'';
  const date=requireString(record.date,'date',{optional:true}); if(date!==undefined&&!/^\d{4}(?:-\d{2}-\d{2})?$/.test(date))fail('date must be YYYY or YYYY-MM-DD');
  return {id,title,publisher,url,type,format,language,tags:[...new Set(record.tags.map(t=>t.trim()))],description,...(date?{date}:{}),...(existing&&record.published===false?{published:false}:{})};
};
const payload=(()=>{try{return JSON.parse(fs.readFileSync(0,'utf8'))}catch{fail('Expected one JSON payload on stdin')}})();
if(!payload||typeof payload!=='object')fail('Payload must be an object');
const action=requireString(payload.action,'action');
if(!['add_resource','update_resource','unpublish_resource','republish_resource'].includes(action))fail('Unsupported librarian action');
const dryRun=payload.dry_run===true;
const status=run('git',['status','--porcelain']); if(status)fail('Repository is not clean; librarian transaction refused');
const branch=run('git',['branch','--show-current']); if(branch!=='main')fail('Librarian requires main branch');
run('git',['fetch','origin','main']);
const local=run('git',['rev-parse','HEAD']); const remote=run('git',['rev-parse','origin/main']); if(local!==remote)fail('Local main is not current with origin/main; librarian transaction refused');
const rel='content/reference-sources.json'; const items=read(rel);
let changedId='';
if(action==='add_resource'){
  const record=validateRecord(payload.record); if(items.some(x=>x.id===record.id))fail(`Resource ${record.id} already exists`); if(items.some(x=>x.url===record.url))fail('A resource with this URL already exists');
  items.push({...record,published:true}); changedId=record.id;
}else{
  const id=requireString(payload.id,'id'); const index=items.findIndex(x=>x.id===id); if(index<0)fail(`Unknown resource ${id}`); changedId=id;
  if(action==='update_resource'){
    const candidate={...items[index],...(payload.patch||{}),id};
    const record=validateRecord(candidate,{existing:true});
    if(items.some((x,i)=>i!==index&&x.url===record.url))fail('A resource with this URL already exists');
    items[index]={...record,published:items[index].published!==false};
  } else if(action==='unpublish_resource') items[index]={...items[index],published:false};
  else items[index]={...items[index],published:true};
}
if(dryRun){console.log(JSON.stringify({ok:true,dry_run:true,action,id:changedId},null,2));process.exit(0)}
write(rel,items);
run(process.execPath,['scripts/check-content.mjs']);
const changed=run('git',['diff','--name-only']); if(changed!==rel)fail(`Unexpected changed path: ${changed||'(none)'}`);
run('git',['add','--',rel]);
run('git',['diff','--cached','--check']);
run('git',['commit','-m',`library: ${action.replace('_resource','')} ${changedId}`]);
run('git',['push','origin','HEAD:main']);
console.log(JSON.stringify({ok:true,action,id:changedId,commit:run('git',['rev-parse','HEAD'])},null,2));
