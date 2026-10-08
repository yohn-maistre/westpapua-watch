import {normalizedEditorialText} from '../../../../shared/story-synthesis';
export type CommonClaim={text_en:string;text_id:string;source_article_ids:number[]};
const clip=(s:any)=>typeof s==='string'?s.trim().slice(0,500):'';
export function commonClaims(value:any):CommonClaim[]{return Array.isArray(value)?value.filter(c=>c&&typeof c==='object').map(c=>({text_en:clip(c.text_en),text_id:clip(c.text_id),source_article_ids:Array.isArray(c.source_article_ids)?[...new Set<number>(c.source_article_ids.filter(Number.isInteger))]:[]})):[]}
export function groundSynthesisDraft(job:any,draft:any){
  const items=job.items||[],byId=new Map<number,any>(items.map((a:any)=>[Number(a.id),a]));
  const duplicate=new Set([draft.summary_en,draft.summary_id,...draft.key_points_en,...draft.key_points_id].map(normalizedEditorialText));
  const claims=commonClaims(draft.common_ground_items).filter(c=>{
    if(c.text_en.length<15||c.text_id.length<15||normalizedEditorialText(c.text_en)===normalizedEditorialText(c.text_id)||duplicate.has(normalizedEditorialText(c.text_en))||duplicate.has(normalizedEditorialText(c.text_id)))return false;
    if(c.source_article_ids.some(id=>!byId.has(id)))return false;
    const publishers=new Set(c.source_article_ids.map(id=>byId.get(id)).filter(a=>!a.syndicated_from_article_id).map(a=>a.publisher_id).filter(Boolean));
    return publishers.size>=2;
  }).slice(0,3);
  const support=(draft.what_changed_article_ids||[]).filter((id:number)=>Number.isInteger(id)&&byId.has(id));
  const changedValid=Boolean(job.previous?.summary)&&support.length>0&&draft.what_changed_en&&draft.what_changed_id&&normalizedEditorialText(draft.what_changed_en)!==normalizedEditorialText(draft.what_changed_id)&&!duplicate.has(normalizedEditorialText(draft.what_changed_en))&&!duplicate.has(normalizedEditorialText(draft.what_changed_id));
  return {...draft,common_ground_items:claims,common_ground:claims.map(c=>c.text_en),
    what_changed_en:changedValid?draft.what_changed_en:'',what_changed_id:changedValid?draft.what_changed_id:'',what_changed_article_ids:changedValid?[...new Set(support)]:[]};
}
export const SYNTHESIS_INSTRUCTION=`You are West Papua Watch's restrained multilingual aggregation editor. Write one independent synthesis per DEVELOPMENT id, using only that episode's supplied reports.
Read ALL reports, including older ones, before choosing the headline. Identify the bounded shared event and the material angles within it. Do not replace the episode's identity with the newest report's angle. Include newly established central outcomes when supported. If new reporting adds a major dimension absent from the old headline, revise the headline to encompass the episode at that level. Preserve an existing accurate headline only after this scope check. Aim for 8–14 words; no catalogue of actions, inflated conclusions, or poetic slogans. A reported consequence does not establish its cause. Do not join unrelated events merely because they share an actor, place or topic.
Write matching English and natural Bahasa Indonesia versions. Each summary is at most 55 words. Attribute sole-source, official, military, movement and NGO claims. A statement establishes that its author made a claim, not independent proof. Preserve disagreement. Syndicated copies do not provide independent confirmation.
key_points_en and key_points_id: up to 3 matching material details that add information rather than paraphrase the summary; use empty lists if unneeded.
common_ground: up to 3 specific factual claims supported by at least TWO independent original publishers. Each item contains text_en, text_id and source_article_ids (actual ARTICLE ids, not S numbers). State the narrow overlap or shared finding, not a broad topic like 'haze affects Papua'. Do not combine source-exclusive claims into consensus or restate the summary/key points. Different reported consequences are complementary angles, not necessarily a shared factual finding. Return [] when no distinct common ground is established.
what_changed_en / what_changed_id: only a material new fact relative to the supplied previous published account and key points. Both must be empty on first publication or repetition. Include supporting actual ARTICLE ids in what_changed_article_ids. This is a temporal comparison, not differences between publishers and not another summary.
Every optional section may be empty. Both language versions must express the same claims, attribution and uncertainty. Never use English sentences in Indonesian fields or vice versa. Never mix facts across DEVELOPMENT ids.`;
