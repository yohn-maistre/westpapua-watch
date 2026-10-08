export type Pair={en:string;pmy:string};
export type Evidence={id:string;title:string;publisher:string;url:string;publishedAt:string;eventDate?:string;datePrecision?:string;text:string;developmentId?:number;originalPublisher?:string};
export type ReviewParagraph={text:Pair;sourceIds:string[]};
export type ReviewThread={id:string;topics:string[];title:Pair;paragraphs:ReviewParagraph[];question:Pair};
export type WeeklyEdition={id:string;kind:'weekly'|'initial';from:string;to:string;publishedAt:string;title:Pair;intro:ReviewParagraph[];threads:ReviewThread[];evidence:Evidence[]};
export type CaseState={slug:string;asOf:string;reviewedAt:string;summary:Pair;change:Pair;questions:Pair[];sourceIds:string[];evidence?:Evidence[];kind:'curated'|'weekly'};
export const REVIEW_TOPICS=['politics-governance-representation','land-indigenous-rights','environment-biodiversity','human-rights-conflict-security','health-food-public-services','education-language-culture','economy-livelihoods','climate-disasters','society-culture-religion'];
const normalized=(v:string)=>String(v).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function pairProblems(value:any):string[]{
 if(!value||typeof value.en!=='string'||typeof value.pmy!=='string'||value.en.trim().length<8||value.pmy.trim().length<8)return ['missing bilingual text'];
 if(normalized(value.en)===normalized(value.pmy))return ['identical bilingual text'];
 const english=/\b(the|with|which|their|while|from|have|has|were|reported|reporting)\b/gi;
 const indonesian=/\b(yang|dan|dengan|dari|untuk|pada|tersebut|masyarakat|laporan|sebagai|oleh|dalam|terhadap|sudah)\b/gi;
 const score=(text:string,pattern:RegExp)=>(text.match(pattern)||[]).length;
 if(score(value.en,indonesian)>score(value.en,english)+1)return ['Indonesian in English field'];
 if(score(value.pmy,english)>score(value.pmy,indonesian)+1)return ['English in Indonesian field'];
 return [];
}
export function witWeek(at:string|number|Date){
 const timestamp=new Date(at).getTime();if(!Number.isFinite(timestamp))throw new Error('Invalid cutoff');
 const local=new Date(timestamp+9*3600000);local.setUTCHours(0,0,0,0);local.setUTCDate(local.getUTCDate()-((local.getUTCDay()+6)%7));
 const to=new Date(local.getTime()-9*3600000).toISOString();const from=new Date(Date.parse(to)-7*86400000).toISOString();
 return {id:local.toISOString().slice(0,10),from,to};
}
/** Inputs come from the accepted source corpus, never from model-invented URLs. */
export function validateReview(draft:any,evidence:Evidence[],window:{from:string;to:string},allowedCases:string[]=[]):string[]{
 const errors:string[]=[],byId=new Map(evidence.map(e=>[e.id,e]));
 const checkPair=(pair:any,label:string)=>pairProblems(pair).forEach(p=>errors.push(`${label}: ${p}`));
 const cite=(ids:any,label:string,requiresRecent=false)=>{
  if(!Array.isArray(ids)||!ids.length){errors.push(label+': missing support');return []}
  const items:Evidence[]=ids.map(id=>byId.get(id)).filter(Boolean);
  if(items.length!==ids.length)errors.push(label+': unknown support');
  if(items.some(e=>!Number.isFinite(Date.parse(e.publishedAt))||Date.parse(e.publishedAt)>Date.parse(window.to)))errors.push(label+': evidence after cutoff');
  if(requiresRecent&&!items.some(e=>e.id.startsWith('a:')&&Date.parse(e.publishedAt)>=Date.parse(window.from)&&Date.parse(e.publishedAt)<Date.parse(window.to)))errors.push(label+': no new reporting');
  return items;
 };
 const checkParagraph=(p:any,label:string)=>{checkPair(p?.text,label);if(['en','pmy'].some(locale=>String(p?.text?.[locale]||'').split(/\s+/).length>140))errors.push(label+': excessive paragraph');return cite(p?.sourceIds,label)};
 checkPair(draft?.title,'headline');
 if(!Array.isArray(draft?.intro)||!draft.intro.length||draft.intro.length>3)errors.push('introduction missing or excessive');
 for(const p of draft?.intro||[])checkParagraph(p,'introduction');
 if(!Array.isArray(draft?.threads)||draft.threads.length<1||draft.threads.length>3)errors.push('one to three threads required');
 const threadIds=new Set<string>();
 for(const thread of draft?.threads||[]){if(!/^[a-z0-9-]+$/.test(thread.id)||threadIds.has(thread.id))errors.push('invalid thread identity');threadIds.add(thread.id);checkPair(thread.title,'thread title');checkPair(thread.question,'question');if(!Array.isArray(thread.paragraphs)||!thread.paragraphs.length||thread.paragraphs.length>4)errors.push('thread paragraphs missing or excessive');const ids=(thread.paragraphs||[]).flatMap((p:any)=>{checkParagraph(p,'thread paragraph');return p.sourceIds||[]});cite([...new Set(ids)],'thread',true);if(!Array.isArray(thread.topics)||!thread.topics.length)errors.push('thread has no topic')}
 const allIds=[...(draft?.intro||[]),...(draft?.threads||[]).flatMap((t:any)=>t.paragraphs||[])].flatMap((p:any)=>p.sourceIds||[]);
 for(const thread of draft?.threads||[])if(thread.topics?.some((topic:string)=>!REVIEW_TOPICS.includes(topic)))errors.push('unknown topic');
 const recent=[...new Set(allIds)].map(id=>byId.get(id)).filter((e):e is Evidence=>!!e&&e.id.startsWith('a:')&&Date.parse(e.publishedAt)>=Date.parse(window.from)&&Date.parse(e.publishedAt)<Date.parse(window.to));
 if(new Set(recent.map(e=>e.originalPublisher||e.publisher)).size<2)errors.push('insufficient original publishers for a weekly synthesis');
 const seenCases=new Set();
 for(const state of draft?.states||[]){if(!allowedCases.includes(state.slug)||seenCases.has(state.slug))errors.push('invalid case identity');seenCases.add(state.slug);checkPair(state.summary,'case state');checkPair(state.change,'case change');if(['en','pmy'].some(locale=>String(state.change?.[locale]||'').length>260))errors.push('case change too long');if(normalized(state.summary?.en||'')===normalized(state.change?.en||''))errors.push('case delta repeats summary');for(const q of state.questions||[])checkPair(q,'case question');cite(state.sourceIds,'case state',true)}
 return [...new Set(errors)];
}
