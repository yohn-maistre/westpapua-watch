import {fetchPublic,normalize,reply} from '../../../src/lib/etnos/data.mjs';
import wiki from '../../../src/lib/etnos/wiki.json';
import snapshot from '../../../src/lib/etnos/snapshot.json';
export const onRequestGet=async({request}:{request:Request})=>{const section=new URL(request.url).searchParams.get('section')||'news';if(section==='wiki')return reply(wiki);if(section!=='news'&&section!=='library')return reply({error:'Bagian tidak dikenal.'},400);try{const url=section==='news'?'https://westpapua.watch/api/current':'https://westpapua.watch/api/resources';return reply({items:normalize(await fetchPublic(url),section)})}catch{return reply({items:snapshot[section],capturedAt:snapshot.capturedAt,snapshot:true})}};
