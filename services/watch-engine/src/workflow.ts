import { WorkflowEntrypoint } from 'cloudflare:workers';
import { discoverEnabled } from './sources/discover';
import { enqueueEditorialBacklog } from './cluster/editorial';
import { reconcileRecentDevelopments } from './cluster';
import { detectEmergingIssues } from './emerging';
import { enqueueLegacyReprocessing } from './ingest/process';

export class NewsCycleWorkflow extends WorkflowEntrypoint<any,unknown>{
  async run(_event:any,step:any){
    const items=await step.do('discover enabled publishers',{retries:{limit:2,delay:'20 seconds',backoff:'exponential'},timeout:'3 minutes'},()=>discoverEnabled());
    const fresh=await step.do('remove known urls',async()=>{const out=[];for(const item of items.slice(0,80)){const row=await this.env.DB.prepare(`SELECT id FROM articles WHERE canonical_url=?`).bind(item.url.replace(/\/$/,'')).first();if(!row)out.push(item)}return out});
    const enqueued=await step.do('enqueue ingestion batches',async()=>{if(!fresh.length)return 0;for(let i=0;i<fresh.length;i+=10)await this.env.INGEST_QUEUE.send({kind:'ingest_batch',items:fresh.slice(i,i+10)});return fresh.length});
    const legacy=await step.do('reprocess legacy singleton backlog',{retries:{limit:1,delay:'20 seconds'},timeout:'2 minutes'},()=>enqueueLegacyReprocessing(this.env,10));
    const editorial=await step.do('dispatch one editorial batch',{retries:{limit:1,delay:'15 seconds'},timeout:'1 minute'},()=>enqueueEditorialBacklog(this.env,4));
    const reconcile=await step.do('reconcile only high-confidence recent duplicates',{retries:{limit:1,delay:'20 seconds'},timeout:'2 minutes'},()=>reconcileRecentDevelopments(this.env,10));
    const witHour=new Date(Date.now()+9*60*60*1000).getUTCHours();
    const emerging=witHour===18
      ?await step.do('daily emerging issue pass',{retries:{limit:1,delay:'30 seconds'},timeout:'4 minutes'},()=>detectEmergingIssues(this.env,24))
      :{checked:0,upserted:0,skipped:'daily-maintenance-window'};
    return {legacy,editorial,reconcile,emerging,discovered:items.length,enqueued,cadence:'06/09/12/15/18 WIT'};
  }
}
