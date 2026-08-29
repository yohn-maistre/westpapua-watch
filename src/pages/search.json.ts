import { searchCorpus } from '../data/search';
export function GET(){return new Response(JSON.stringify(searchCorpus),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=3600'}})}
