import { runJson } from '../llm';
import type { ExtractedArticle,SourceConfig,StoryPacket,WatchDesk } from '../types';

const clean=(v:any,n=16)=>Array.isArray(v)?v.map(String).map(x=>x.trim()).filter(Boolean).slice(0,n):[];
const conf=(v:any)=>Math.max(0,Math.min(1,Number(v)||0));
const desk=(v:any):WatchDesk=>['environment','land','human_rights','politics','culture','regional','other'].includes(String(v))?v:'other';
const WORD=/[\p{L}\p{N}]+/gu;
const ENTITY=/West Papua|Papua Barat|Papua Tengah|Papua Pegunungan|Papua Selatan|Jayapura|Sentani|Raja Ampat|Sorong|Manokwari|Nabire|Merauke|Timika|Mimika|Biak|Wamena|Nduga|Intan Jaya|Yahukimo|Puncak|Fakfak|Kaimana|Tambrauw|Maybrat|ULMWP|KNPB|TPNPB|TNI|Polri|DPR|DPRK|MPR|PIF|Freeport|MIFEE|PSN/gi;

const packetItemSchema={type:'object',properties:{
  article_id:{type:'integer'},summary_id:{type:'string'},key_points:{type:'array',items:{type:'string'}},what_changed:{type:'string'},
  event_date:{type:'string'},event_key:{type:'string'},action:{type:'string'},object:{type:'string'},
  places:{type:'array',items:{type:'string'}},people:{type:'array',items:{type:'string'}},organizations:{type:'array',items:{type:'string'}},topics:{type:'array',items:{type:'string'}},issue_candidates:{type:'array',items:{type:'string'}},
  watch_relevance:{type:'boolean'},watch_relevance_confidence:{type:'number'},watch_relevance_reason:{type:'string'},watch_relevance_evidence:{type:'array',items:{type:'string'}},
  watch_desk:{type:'string',enum:['environment','land','human_rights','politics','culture','regional','other']}
},required:['article_id','summary_id','key_points','what_changed','event_date','event_key','action','object','places','people','organizations','topics','issue_candidates','watch_relevance','watch_relevance_confidence','watch_relevance_reason','watch_relevance_evidence','watch_desk'],additionalProperties:false};
const batchSchema={type:'object',properties:{items:{type:'array',items:packetItemSchema}},required:['items'],additionalProperties:false};

function wordSet(s:string){return new Set((s.toLowerCase().match(WORD)||[]).filter(x=>x.length>3))}
function paragraphScore(p:string,title:Set<string>){
  const words=wordSet(p);let overlap=0;for(const w of title)if(words.has(w))overlap++;
  const entity=(p.match(ENTITY)||[]).length;
  const numbers=(p.match(/\b\d{1,4}(?:[.,]\d+)?\b/g)||[]).length;
  return overlap*4+entity*2+Math.min(3,numbers)+Math.min(2,p.length/600);
}

export function sharpenArticleEvidence(article:ExtractedArticle,maxChars=5200){
  const paragraphs=article.body.split(/\n\s*\n|\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(x=>x.length>50);
  const title=wordSet(article.title);
  const chosen=new Set<number>();
  if(paragraphs[0])chosen.add(0);if(paragraphs[1])chosen.add(1);
  paragraphs.map((p,i)=>({i,s:paragraphScore(p,title)})).sort((a,b)=>b.s-a.s).slice(0,5).forEach(x=>chosen.add(x.i));
  if(paragraphs.length>2)chosen.add(paragraphs.length-1);
  const ordered=[...chosen].sort((a,b)=>a-b).map(i=>paragraphs[i]);
  const head=`TITLE: ${article.title}\nLEDE: ${article.description||''}\nPUBLISHED: ${article.publishedAt||''}\n`;
  let out=head;
  for(const p of ordered){if(out.length+p.length+2>maxChars)break;out+=`\n${p}`}
  return out.slice(0,maxChars);
}

function fallbackPacket(article:ExtractedArticle,_source:SourceConfig,reason='structured extraction unavailable'):StoryPacket{
  // Failure never becomes an implicit relevance verdict. The caller can safely
  // keep deterministic Western matches, while ambiguous material is deferred.
  return {summary:article.description||article.title,key_points:[],what_changed:'',event_date:article.publishedAt,event_key:article.title.slice(0,220),action:'',object:'',places:[],people:[],organizations:[],topics:[],issue_candidates:[],watch_relevance:false,watch_relevance_confidence:0,watch_relevance_reason:reason,watch_relevance_evidence:[],watch_desk:'other'};
}

function toPacket(obj:any,article:ExtractedArticle,source:SourceConfig):StoryPacket{
  return {summary:String(obj?.summary_id||article.description||article.title).slice(0,1800),key_points:clean(obj?.key_points),what_changed:String(obj?.what_changed||'').slice(0,1200),event_date:String(obj?.event_date||article.publishedAt||'').slice(0,64)||undefined,event_key:String(obj?.event_key||article.title).slice(0,320),action:String(obj?.action||'').slice(0,180),object:String(obj?.object||'').slice(0,220),places:clean(obj?.places),people:clean(obj?.people),organizations:clean(obj?.organizations),topics:clean(obj?.topics),issue_candidates:clean(obj?.issue_candidates),watch_relevance:obj?.watch_relevance===true,watch_relevance_confidence:conf(obj?.watch_relevance_confidence),watch_relevance_reason:String(obj?.watch_relevance_reason||'').slice(0,600),watch_relevance_evidence:clean(obj?.watch_relevance_evidence,10),watch_desk:desk(obj?.watch_desk)};
}

export type StoryPacketInput={id:number;article:ExtractedArticle;source:SourceConfig};

export async function makeStoryPacketsBatch(env:any,inputs:StoryPacketInput[]):Promise<Map<number,StoryPacket>>{
  const result=new Map<number,StoryPacket>();
  if(!inputs.length)return result;
  const payload=inputs.map(x=>`ARTICLE ${x.id}\nPublisher: ${x.source.name}\nRole: ${x.source.role}\nPublisher scope prior: ${x.source.scope}\n${sharpenArticleEvidence(x.article)}`).join('\n\n---\n\n');
  const prompt=`Extract one independent conservative Story Packet for EACH numbered article. Never mix facts between articles. summary_id, key_points and what_changed must be Bahasa Indonesia. event_key is a short canonical description of the concrete event/change, not a broad topic. action and object should be short normalized phrases useful for event matching.\n\nDecide whether each article materially concerns Indonesian-administered Papua / West Papua, Papuan people, or a regional/national event whose substance directly concerns West Papua. Papua New Guinea alone is not relevant. Publisher identity alone is NOT evidence of relevance: Papua-focused publishers also publish Indonesian, Pacific, and international news. A story from Jubi/Aneta/Suara Papua still needs article-level relevance. Conversely, do not reject a materially relevant story merely because its headline omits the word Papua. Use the supplied text.\n\nPreserve uncertainty and attribution. watch_relevance_evidence must contain short evidence phrases from the article when relevance is true. Return exactly one item per ARTICLE id.\n\n${payload}`;
  try{
    const out:any=await runJson(env,[{role:'system',content:'You are a conservative multilingual news extraction desk. Each item is isolated evidence. Output only the supplied schema.'},{role:'user',content:prompt}],batchSchema,'fast',Math.min(3600,900+inputs.length*520));
    const byId=new Map((Array.isArray(out?.items)?out.items:[]).map((x:any)=>[Number(x.article_id),x]));
    for(const input of inputs){const obj=byId.get(input.id);result.set(input.id,obj?toPacket(obj,input.article,input.source):fallbackPacket(input.article,input.source,'batch output omitted this article'))}
  }catch(e){
    console.warn('story packet batch degraded without recursive inference',String((e as any)?.message||e).slice(0,500));
    for(const input of inputs)result.set(input.id,fallbackPacket(input.article,input.source,'story packet batch failed'));
  }
  return result;
}

export async function makeStoryPacket(env:any,article:ExtractedArticle,source:SourceConfig):Promise<StoryPacket>{
  const map=await makeStoryPacketsBatch(env,[{id:1,article,source}]);return map.get(1)||fallbackPacket(article,source);
}
