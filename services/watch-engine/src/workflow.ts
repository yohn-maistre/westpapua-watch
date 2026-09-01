import { WorkflowEntrypoint } from 'cloudflare:workers';import { discoverEnabled } from './sources/discover';import { revisitCandidateDevelopments } from './cluster/editorial';
export class NewsCycleWorkflow extends WorkflowEntrypoint<any,unknown>{
  async run(_event:any,step:any){
    const review=await step.do('revisit held-over candidates',{retries:{limit:1,delay:'15 seconds'},timeout:'4 minutes'},()=>revisitCandidateDevelopments(this.env,10));
    const items=await step.do('discover enabled publishers',{retries:{limit:2,delay:'20 seconds',backoff:'exponential'},timeout:'3 minutes'},()=>discoverEnabled());
    const fresh=await step.do('remove known urls',async()=>{const out=[];for(const item of items.slice(0,45)){const row=await this.env.DB.prepare(`SELECT id FROM articles WHERE canonical_url=?`).bind(item.url.replace(/\/$/,'')).first();if(!row)out.push(item)}return out});
    await step.do('enqueue article ingestion',async()=>{if(!fresh.length)return 0;for(let i=0;i<fresh.length;i+=20)await this.env.INGEST_QUEUE.sendBatch(fresh.slice(i,i+20).map((body:any)=>({body})));return fresh.length});
    return {review,discovered:items.length,enqueued:fresh.length};
  }
}
