import type {InvestigativeRecord,RecordClaim} from '../data/investigative-record';
export type DeskView='connections'|'timeline'|'documents';
export type DeskSelection={caseId:string;entity:string;claim:string;view:DeskView;evidence:boolean};
export const initialDeskSelection:DeskSelection={caseId:'merauke',entity:'',claim:'',view:'connections',evidence:false};
export function normaliseSelection(input:Partial<DeskSelection>,data:InvestigativeRecord):DeskSelection{
 const dossier=data.cases.find(c=>c.id===input.caseId)||data.cases[0];
 const claims=data.claims.filter(c=>dossier.claimIds.includes(c.id));
 const claim=claims.find(c=>c.id===input.claim)?.id||'';
 const entity=claims.some(c=>c.subject===input.entity||c.object===input.entity)?input.entity||'':'';
 return {caseId:dossier.id,entity,claim,view:['connections','timeline','documents'].includes(input.view||'')?input.view!:'connections',evidence:!!input.evidence&&!!claim};
}
export function selectionFromURL(url:URL,data:InvestigativeRecord):DeskSelection{
 return normaliseSelection({caseId:url.searchParams.get('case')||'',entity:url.searchParams.get('entity')||'',claim:url.searchParams.get('claim')||'',view:url.searchParams.get('view') as DeskView,evidence:url.searchParams.get('evidence')==='open'},data);
}
export function selectionURL(url:URL,state:DeskSelection){
 const next=new URL(url);next.hash='';next.searchParams.set('case',state.caseId);
 for(const [key,value] of [['entity',state.entity],['claim',state.claim],['view',state.view==='connections'?'':state.view],['evidence',state.evidence?'open':'']]){if(value)next.searchParams.set(key,value);else next.searchParams.delete(key);}
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
 return [...entities,...cases,...claims].slice(0,14);
}
export function sourceIdsForClaims(claims:RecordClaim[]){return [...new Set(claims.flatMap(c=>c.evidence.map(e=>e.source)))];}
