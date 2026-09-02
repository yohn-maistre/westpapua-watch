import type { ExtractedArticle,SourceConfig } from '../types';
export type PrefilterDecision='keep'|'drop'|'ambiguous';

export const WESTERN_SIGNAL=/\bwest papua\b|western new guinea|tanah papua|papua barat(?: daya)?|papua tengah|papua pegunungan|papua selatan|provinsi papua\b|jayapura|sentani|cycloop|raja ampat|sorong|manokwari|nabire|merauke|timika|mimika|biak|supiori|serui|yapen|wamena|jayawijaya|puncak|nduga|intan jaya|yahukimo|deiyai|dogiyai|paniai|fak\s?fak|kaimana|tambrauw|maybrat|arfak|mamberamo|asmat|boven digoel|lanny jaya|tolikara|mappi|meepago|lapago|saireri|doberai|bomberai|mamta|anim ha|\boap\b|orang asli papua|ulayat papua|knpb|ulmwp|tpnpb|freeport indonesia/i;
export const FOREIGN_ONLY_SIGNAL=/papua new guinea|port moresby|mount hagen|pngdf|\blae\b|bougainville|madang|morobe|east sepik|western highlands|solomon islands|\bpalau\b|vanuatu|new caledonia|fiji|samoa|tonga|kiribati|tuvalu|marshall islands|micronesia|taiwan|beijing|\bchina\b|new zealand/i;
const PAPUA_GENERIC=/\bpapua\b|papuan/i;

export function hasWesternSignal(value:string){return WESTERN_SIGNAL.test(value)}
export function looksForeignOnly(value:string){return FOREIGN_ONLY_SIGNAL.test(value)&&!WESTERN_SIGNAL.test(value)&&!PAPUA_GENERIC.test(value)}

export function prefilterArticle(article:ExtractedArticle,_source:SourceConfig):PrefilterDecision{
  const head=`${article.title}\n${article.description}`;
  const sample=`${head}\n${article.body.slice(0,7000)}`;
  if(WESTERN_SIGNAL.test(sample))return 'keep';
  if(looksForeignOnly(sample))return 'drop';
  // Publisher scope is a prior, never a verdict. A Papua newsroom can and does
  // publish national, Pacific, and world reporting. Ambiguous material is sent
  // to the batched relevance model instead of being discarded by keyword absence.
  return 'ambiguous';
}
