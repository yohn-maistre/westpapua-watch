import {pairProblems} from './analysis';
import {matchesFollowingEvidence} from './following';

type Pair={en:string;pmy:string};
type State={asOf:string;change:Pair;summary:Pair;sourceIds:string[];kind?:string};
type Evidence={id:string;title:string;url:string;publisher:string;[key:string]:unknown};
export type FollowingEntry={slug:string;title:Pair;state:State;update:{kind:'curated'|'synthesis'|'report';title:Pair;date:string;href:string;sourceUrl?:string;reportURL?:string}};
const epoch=(s:unknown)=>typeof s==='string'?Date.parse(s):NaN;
const pair=(x:any):x is Pair=>typeof x?.en==='string'&&typeof x?.pmy==='string'&&!!x.en.trim()&&!!x.pmy.trim();
/** A stored snapshot may predate a later curated correction. Keep the newer evidence. */
export function preferredCaseState<T extends State>(curated:T|null,stored:T|null):T|null{
 const valid=(s:State|null)=>s&&Number.isFinite(epoch(s.asOf))&&pair(s.change)&&pair(s.summary)&&Array.isArray(s.sourceIds)&&s.sourceIds.length;
 if(!valid(stored))return valid(curated)?curated:null;
 if(!valid(curated))return stored;
 return epoch(stored!.asOf)>epoch(curated!.asOf)?stored:curated;
}
/** Published reporting is a dated update, not a replacement for the case synthesis. */
export function followingEntries(seeds:any[],remote:any[]=[],reporting:any[]=[],now=Date.now()):FollowingEntry[]{
 return seeds.filter(seed=>seed.state).map(seed=>{
  const base={...seed.state,slug:seed.slug,evidence:(seed.backgroundSources||[]).filter((e:Evidence)=>seed.state.sourceIds.includes(e.id))};
  const state=preferredCaseState(base,remote.find(x=>x.slug===seed.slug)?.state)!;
  const update:FollowingEntry['update']={kind:state.kind==='weekly'?'synthesis':'curated',title:state.change,date:state.asOf,href:`/topics/${seed.slug}/#overview`};
  const reports=reporting.filter(item=>{
   const date=epoch(item.latest_report_at);
   const titles={en:item.title?.en,pmy:item.title?.pmy||item.title?.id};
   return item.publication_kind==='reviewed'&&pair(titles)&&!pairProblems(titles).length&&date>epoch(state.asOf)&&date<=now&&/^\/story\/\?id=\d+$/.test(item.story_url||'')&&typeof item.latest_source?.publisher==='string'&&matchesFollowingEvidence(seed.slug,[`${titles.en} ${titles.pmy} ${item.summary?.en||''} ${item.summary?.pmy||item.summary?.id||''}`]);
  }).toSorted((a,b)=>epoch(b.latest_report_at)-epoch(a.latest_report_at));
  const latest=reports[0];if(latest){update.kind='report';update.title={en:latest.title.en,pmy:latest.title.pmy||latest.title.id};update.date=latest.latest_report_at;update.href=`/topics/${seed.slug}/#latest`;update.reportURL=latest.story_url;const original=latest.latest_source.url||latest.latest_source.canonical_url;if(/^https:\/\//.test(original||''))update.sourceUrl=original;}
  return {slug:seed.slug,title:seed.title,state,update};
 }).toSorted((a,b)=>epoch(b.update.date)-epoch(a.update.date));
}
