import type {InvestigativeRecord,RecordClaim,RelationCategory} from '../data/investigative-record';
export type DeskView='connections'|'timeline'|'documents';
export type DeskSelection={caseId:string;entity:string;claim:string;view:DeskView;evidence:boolean;source?:string;scope?:'related'|'all';lens?:RelationCategory};
export function deskClaims(data:InvestigativeRecord,caseId:string,scope?:string){
 const base=caseClaims(data,caseId);if(scope==='all')return data.claims;if(scope!=='related')return base;
 const ids=new Set(base.flatMap(c=>[c.subject,c.object]));
 const files=new Set(data.cases.filter(c=>data.claims.some(k=>c.claimIds.includes(k.id)&&(ids.has(k.subject)||ids.has(k.object)))).map(c=>c.id));
 return data.claims.filter(c=>c.cases.some(id=>files.has(id)));
}
export const initialDeskSelection:DeskSelection={caseId:'merauke',entity:'',claim:'',view:'connections',evidence:false};
export function normaliseSelection(input:Partial<DeskSelection>,data:InvestigativeRecord):DeskSelection{
 const dossier=data.cases.find(c=>c.id===input.caseId)||data.cases[0];
 const scope=['related','all'].includes(input.scope||'')?input.scope:undefined;
 const claims=deskClaims(data,dossier.id,scope);
 const claim=claims.find(c=>c.id===input.claim)?.id||'';
 const entity=claims.some(c=>c.subject===input.entity||c.object===input.entity)?input.entity||'':'';
 const source=data.sources.some(s=>s.id===input.source&&(dossier.reading.includes(s.id)||claims.some(c=>c.evidence.some(e=>e.source===s.id))))?input.source:undefined;
 const lens=['authority','business','land','accountability'].includes(input.lens||'')?input.lens:undefined;
 return {caseId:dossier.id,entity,claim,view:['connections','timeline','documents'].includes(input.view||'')?input.view!:'connections',evidence:!!input.evidence&&!!(claim||entity||source),...(scope?{scope}:{}),...(lens?{lens}:{}),...(source?{source}:{})};
}
export function selectionFromURL(url:URL,data:InvestigativeRecord):DeskSelection{
 return normaliseSelection({caseId:url.searchParams.get('case')||'',entity:url.searchParams.get('entity')||'',claim:url.searchParams.get('claim')||'',source:url.searchParams.get('source')||undefined,scope:url.searchParams.get('scope') as DeskSelection['scope'],lens:url.searchParams.get('lens') as RelationCategory,view:url.searchParams.get('view') as DeskView,evidence:url.searchParams.get('evidence')==='open'},data);
}
export function selectionURL(url:URL,state:DeskSelection){
 const next=new URL(url);next.hash='';next.searchParams.set('case',state.caseId);
 for(const [key,value] of [['entity',state.entity],['claim',state.claim],['source',state.source],['scope',state.scope],['lens',state.lens],['view',state.view==='connections'?'':state.view],['evidence',state.evidence?'open':'']]){if(value)next.searchParams.set(key,value);else next.searchParams.delete(key);}
 return next;
}
export function caseClaims(data:InvestigativeRecord,id:string){return data.claims.filter(c=>data.cases.find(k=>k.id===id)?.claimIds.includes(c.id));}
export function searchRecord(data:InvestigativeRecord,query:string,locale:'en'|'pmy'){
 const fold=(s:string)=>s.normalize('NFKD').replace(/\p{Diacritic}/gu,'').toLowerCase();
 const q=fold(query.trim());if(!q)return [];
 const present=new Set(data.claims.flatMap(c=>[c.subject,c.object]));
 const entities=data.entities.filter(e=>present.has(e.id)&&fold([e.name.en,e.name.pmy,...e.aliases,...(e.searchTerms||[])].join(' ')).includes(q)).map(e=>({id:e.id,type:'entity' as const,label:e.name[locale],detail:e.kind,caseId:data.claims.find(c=>c.subject===e.id||c.object===e.id)!.cases[0]}));
 const cases=data.cases.filter(c=>fold([c.title.en,c.title.pmy,c.deck.en,c.deck.pmy,...c.body.flatMap(p=>[p.text.en,p.text.pmy])].join(' ')).includes(q)).map(c=>({id:c.id,type:'case' as const,label:c.title[locale],detail:c.period,caseId:c.id}));
 const claims=data.claims.filter(c=>fold([c.title.en,c.title.pmy,c.text.en,c.text.pmy].join(' ')).includes(q)).slice(0,6).map(c=>({id:c.id,type:'claim' as const,label:c.title[locale],detail:c.date,caseId:c.cases[0]}));
 const sources=data.sources.filter(s=>fold([s.title,s.scope,s.family,s.url].join(' ')).includes(q)).flatMap(s=>{const c=data.cases.find(c=>c.reading.includes(s.id)||data.claims.some(k=>c.claimIds.includes(k.id)&&k.evidence.some(e=>e.source===s.id)));return c?[{id:s.id,type:'source' as const,label:s.title,detail:s.period,caseId:c.id}]:[];});
 return [...entities,...cases,...claims,...sources].slice(0,14);
}
export function sourceIdsForClaims(claims:RecordClaim[]){return [...new Set(claims.flatMap(c=>c.evidence.map(e=>e.source)))];}
