import type { ExtractedArticle,SourceConfig } from '../types';
export type PrefilterDecision='keep'|'drop'|'ambiguous';

const WESTERN=/\bwest papua\b|papua barat(?: daya)?|papua tengah|papua pegunungan|papua selatan|jayapura|sentani|cycloop|raja ampat|sorong|manokwari|nabire|merauke|timika|mimika|biak|supiori|serui|yapen|wamena|jayawijaya|puncak|nduga|intan jaya|yahukimo|deiyai|dogiyai|paniai|fakfak|kaimana|tambrauw|maybrat|arfak|mamberamo|asmat|boven digoel|lanny jaya|tolikara|mappi|yahukimo|meepago|lapago|saireri|doberai|bomberai|mamta|anim ha|oap\b|orang asli papua|ulayat papua|knpb|ulmwp|tpnpb/i;
const PNG=/papua new guinea|port moresby|mount hagen|pngdf|lae\b|bougainville|madang|morobe|east sepik|western highlands/i;
const PAPUA_GENERIC=/\bpapua\b|papuan/i;

export function prefilterArticle(article:ExtractedArticle,source:SourceConfig):PrefilterDecision{
  if(source.scope==='papua')return 'keep';
  const head=`${article.title}\n${article.description}`;
  const sample=`${head}\n${article.body.slice(0,6000)}`;
  if(WESTERN.test(sample))return 'keep';
  if(PNG.test(sample)&&!WESTERN.test(sample))return 'drop';
  // Generic "Papua" is deliberately ambiguous: never reject a potentially relevant
  // national/regional story merely because the headline omitted a Western New Guinea place.
  if(PAPUA_GENERIC.test(sample))return 'ambiguous';
  return 'ambiguous';
}
