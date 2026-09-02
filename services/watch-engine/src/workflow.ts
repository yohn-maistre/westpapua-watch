import { WorkflowEntrypoint } from 'cloudflare:workers';
import { discoverBackfill,discoverEnabled } from './sources/discover';
import { enqueueEditorialBacklog } from './cluster/editorial';
import { reconcileRecentDevelopments } from './cluster';
import { detectEmergingIssues } from './emerging';
import { enqueueDeferredRelevance,enqueueLegacyReprocessing } from './ingest/process';
import { cleanupRecentIrrelevant,reindexKnowledge } from './knowledge';

export class NewsCycleWorkflow extends WorkflowEntrypoint<any,unknown>{
  async run(event:any,step:any){
    const params=event?.payload||event?.params||{};
    if(params?.maintenance==='freeze09'){
      const cleanup=await step.do('clean recent irrelevant developments',{retries:{limit:1,delay:'20 seconds'},timeout:'3 minutes'},()=>cleanupRecentIrrelevant(this.env,Number(params?.days||30)));
      const knowledge=await step.do('reindex issue and place relations',{retries:{limit:1,delay:'20 seconds'},timeout:'5 minutes'},()=>reindexKnowledge(this.env,Number(params?.limit||1000)));
      return {mode:'freeze09-maintenance',cleanup,knowledge};
    }
    const backfillDays=Math.max(0,Math.min(31,Number(params?.backfillDays||0)));const isBackfill=backfillDays>0;
    const items=isBackfill
      ?await step.do(`discover ${backfillDays}-day backfill`,{retries:{limit:2,delay:'30 seconds',backoff:'exponential'},timeout:'6 minutes'},()=>discoverBackfill(backfillDays))
      :await step.do('discover enabled publishers',{retries:{limit:2,delay:'20 seconds',backoff:'exponential'},timeout:'3 minutes'},()=>discoverEnabled());
    const scanCap=isBackfill?300:80,enqueueCap=isBackfill?120:80;
    const fresh=await step.do('remove known urls',async()=>{const out=[];for(const item of items.slice(0,scanCap)){const row=await this.env.DB.prepare(`SELECT id FROM articles WHERE canonical_url=?`).bind(item.url.replace(/\/$/,'')).first();if(!row)out.push(item);if(out.length>=enqueueCap)break}return out});
    const enqueued=await step.do('enqueue ingestion batches',async()=>{if(!fresh.length)return 0;for(let i=0;i<fresh.length;i+=4){const delaySeconds=isBackfill?Math.floor(i/4)*60:0;await this.env.INGEST_QUEUE.send({kind:'ingest_batch',items:fresh.slice(i,i+4)},{delaySeconds})}return fresh.length});

    // A backfill only populates the durable ingestion/Development backlog. Normal
    // scheduled checkpoints own editorial admission, so a one-time archive import
    // cannot suddenly consume the whole writer quota.
    if(isBackfill)return {mode:'backfill',days:backfillDays,discovered:items.length,enqueued,editorial:{skipped:'normal-checkpoints-drain-backlog'}};

    const deferred=await step.do('retry deferred relevance',{retries:{limit:1,delay:'20 seconds'},timeout:'2 minutes'},()=>enqueueDeferredRelevance(this.env,10));
    const legacy=await step.do('reprocess legacy singleton backlog',{retries:{limit:1,delay:'20 seconds'},timeout:'2 minutes'},()=>enqueueLegacyReprocessing(this.env,10));
    const editorial=await step.do('dispatch one editorial batch',{retries:{limit:1,delay:'15 seconds'},timeout:'1 minute'},()=>enqueueEditorialBacklog(this.env,4));
    const reconcile=await step.do('reconcile only high-confidence recent duplicates',{retries:{limit:1,delay:'20 seconds'},timeout:'2 minutes'},()=>reconcileRecentDevelopments(this.env,10));
    const witHour=new Date(Date.now()+9*60*60*1000).getUTCHours();
    const emerging=witHour===18
      ?await step.do('daily emerging issue pass',{retries:{limit:1,delay:'30 seconds'},timeout:'4 minutes'},()=>detectEmergingIssues(this.env,24))
      :{checked:0,upserted:0,skipped:'daily-maintenance-window'};
    return {deferred,legacy,editorial,reconcile,emerging,discovered:items.length,enqueued,cadence:'06/09/12/15/18 WIT'};
  }
}
