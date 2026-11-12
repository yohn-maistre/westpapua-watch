import {WorkerEntrypoint} from 'cloudflare:workers'
import {commonsCompletion,type CommonsModelEnv} from './commons-model'
/** Only explicitly configured service bindings can target this named entrypoint.
 * It is not reachable through Watch's public default fetch handler. */
export class CommonsIntelligence extends WorkerEntrypoint<CommonsModelEnv>{
 async fetch(request:Request){return commonsCompletion(request,this.env)}
}
