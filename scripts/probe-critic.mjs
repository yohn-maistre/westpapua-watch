// Synthetic evidence only. No database, queue or publication writes.
import {build} from 'esbuild';
const route=process.argv[2]||'dynamic/watch-fast';
if(!['dynamic/watch-fast','dynamic/watch-synth'].includes(route))throw new Error('Choose dynamic/watch-fast or dynamic/watch-synth');
if(!process.env.AI_GATEWAY_BASE||!process.env.AI_GATEWAY_TOKEN)throw new Error('Set AI_GATEWAY_BASE and AI_GATEWAY_TOKEN in the environment');
const result=await build({stdin:{contents:"export {runJson} from './services/watch-engine/src/llm.ts'; export {criticBatchSchema,CRITIC_INSTRUCTION} from './services/watch-engine/src/cluster/editorial.ts';",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'});
const {runJson,criticBatchSchema,CRITIC_INSTRUCTION}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const evidence='Synthetic test. A local newsroom reports that a governor met residents during a working visit to Deiyai on 4 September. The governor said a bridge would be repaired next year. No completed repair or contract award is reported.';
const cases=[
 {name:'attributed promise',claim:'During a working visit to Deiyai, the governor promised bridge repairs next year.',expected:'pass'},
 {name:'unsupported completion',claim:'The Deiyai bridge repairs are complete and the bridge reopened.',expected:'revise'},
 {name:'invented contract',claim:'The governor awarded a $10 million bridge contract during the Deiyai visit.',expected:'revise'}
];
let failures=0;
for(const test of cases){
 const started=Date.now();
 try{
  const answer=await runJson({...process.env,AI_GATEWAY_CRITIC_MODEL:route},[{role:'system',content:CRITIC_INSTRUCTION},{role:'user',content:`DEVELOPMENT 1\nDRAFT EN: ${test.claim}\nEVIDENCE\n${evidence}`}],criticBatchSchema,'critic',1600);
  const review=answer.items?.find(x=>x.development_id===1);
  const ok=answer.items?.length===1&&review?.verdict===test.expected;
  if(!ok)failures++;
  console.log(JSON.stringify({route,test:test.name,ok,verdict:review?.verdict||null,milliseconds:Date.now()-started}));
 }catch(error){failures++;console.log(JSON.stringify({route,test:test.name,ok:false,errorCode:error.code||'unknown',httpStatus:error.status||null,milliseconds:Date.now()-started}));}
}
console.log(JSON.stringify({route,passed:cases.length-failures,total:cases.length,note:'Compatibility smoke test, not a comparative editorial benchmark.'}));
process.exitCode=failures?1:0;
