import { WorkflowEntrypoint } from 'cloudflare:workers';
import { discoverEnabled } from './sources/discover';
import { enqueueEditorialBacklog } from './cluster/editorial';
import { reconcileRecentDevelopments } from './cluster';
import { detectEmergingIssues } from './emerging';
import { enqueueLegacyReprocessing } from './ingest/process';

export class NewsCycleWorkflow extends WorkflowEntrypoint<any,unknown>{
  async run(_event:any,step:any){
    const items=await step.do('discover enabled publishers',{retries:{limit:2,delay:'20 seconds',backoff:'exponential'},timeout:'3 minutes'},()=>discoverEnabled());
    const fresh=await step.do('remove known urls',async()=>{const out=[];for(const item of items.slice(0,45)){const row=await this.env.DB.prepare(`SELECT id FROM articles WHERE canonical_url=?`).bind(item.url.replace(/\/$/,'')).first();if(!row)out.push(item)}return out});
    const enqueued=await step.do('enqueue article ingestion',async()=>{if(!fresh.length)return 0;for(let i=0;i<fresh.length;i+=20)await this.env.INGEST_QUEUE.sendBatch(fresh.slice(i,i+20).map((body:any)=>({body})));return fresh.length});
    const legacy=await step.do('reprocess legacy singleton backlog',{retries:{limit:1,delay:'15 seconds'},timeout:'2 minutes'},()=>enqueueLegacyReprocessing(this.env,12));
    // Editorial is admission-controlled: one candidate per scheduled cycle.
    // This leaves room for writer, critic and provider-route fallback without a burst.
    const editorial=await step.do('enqueue one editorial candidate',{retries:{limit:2,delay:'10 seconds'},timeout:'1 minute'},()=>enqueueEditorialBacklog(this.env,1));
    const reconcile=await step.do('reconcile recent developments',{retries:{limit:1,delay:'15 seconds'},timeout:'4 minutes'},()=>reconcileRecentDevelopments(this.env,6));
    const emerging=await step.do('detect emerging issues',{retries:{limit:1,delay:'20 seconds'},timeout:'4 minutes'},()=>detectEmergingIssues(this.env,10));
    return {legacy,editorial,reconcile,emerging,discovered:items.length,enqueued};
  }
}
