import type {ExtractedArticle,StoryPacket} from '../types';
import type {PrefilterDecision} from './prefilter';
const normalize=(value:string)=>String(value||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function relevanceDisposition(packet:StoryPacket,article:ExtractedArticle,_decision?:PrefilterDecision):'relevant'|'irrelevant'|'deferred'{
  // Discovery signals nominate an article; generated prose never proves relevance.
  if(/batch failed|omitted this article|structured extraction/i.test(packet.watch_relevance_reason||''))return 'deferred';
  const confidence=Number(packet.watch_relevance_confidence||0);
  if(packet.watch_relevance===false&&confidence>=.70)return 'irrelevant';
  const original=normalize(`${article.title} ${article.description||''} ${article.body||''}`);
  const grounded=(packet.watch_relevance_evidence||[]).some(value=>{const quote=normalize(value);return quote.length>=8&&quote.split(' ').length>=2&&original.includes(quote)});
  if(packet.watch_relevance===true&&confidence>=.70&&grounded)return 'relevant';
  return 'deferred';
}
