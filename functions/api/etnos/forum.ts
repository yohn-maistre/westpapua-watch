import {fetchPublic,normalize,reply} from '../../../src/lib/etnos/data.mjs';
import snapshot from '../../../src/lib/etnos/snapshot.json';
export const onRequestGet=async()=>{try{return reply({items:normalize(await fetchPublic('https://piefed.social/api/alpha/post/list?limit=30&sort=Active'),'forum')})}catch{return reply({items:snapshot.forum,capturedAt:snapshot.capturedAt,snapshot:true})}};
