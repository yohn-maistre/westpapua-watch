import {fetchPublic,normalize,reply} from '../../../src/lib/etnos/data.mjs';
export const onRequestGet=async()=>{try{return reply({items:normalize(await fetchPublic('https://piefed.social/api/alpha/post/list?limit=30&sort=Active'),'forum')})}catch{return reply({items:[],error:'Percakapan PieFed belum dapat dihubungi.'},502)}};
