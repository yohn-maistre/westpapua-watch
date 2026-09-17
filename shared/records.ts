export const RECORD_KINDS=['place','organization','person','office','program','project','law','document','dataset','election','observation','collection'] as const;
export type RecordKind=typeof RECORD_KINDS[number];
export type Evidence={url:string;publisher:string;retrievedAt?:string;publishedAt?:string;note?:string};
export type Observation={metric:string;value:number;unit:string;period:string;place:string;measure:'observed'|'target'|'allocation'|'transfer'|'expenditure';method:string;geographyVersion:string;source:Evidence};
export type PublicRecord={id:string;slug:string;kind:RecordKind;title:string;description:string;topics:string[];places:string[];sources:Evidence[];libraryIds:string[];relations:{predicate:string;target:string;evidence:Evidence}[];observations:Observation[];status:'catalogue'|'documented';validFrom?:string;validUntil?:string};
export function validateRecord(r:any):asserts r is PublicRecord{
 if(!r||!RECORD_KINDS.includes(r.kind)||!/^[-a-z0-9]+$/.test(r.slug)||!r.id||!r.title||!r.description)throw Error('Invalid record identity');
 for(const key of ['topics','places','sources','libraryIds','relations','observations'])if(!Array.isArray(r[key]))throw Error(`Missing ${key}`);
 if(!r.sources.length)throw Error('A public record requires provenance');
 const evidence=(s:any)=>{if(!s?.publisher||!/^https?:\/\//.test(s.url))throw Error('Invalid source');};r.sources.forEach(evidence);
 for(const rel of r.relations){if(!rel.predicate||!rel.target)throw Error('Invalid relationship');evidence(rel.evidence)}
 for(const o of r.observations){if(!Number.isFinite(o.value)||!o.metric||!o.unit||!o.period||!o.place||!o.method||!o.geographyVersion||!['observed','target','allocation','transfer','expenditure'].includes(o.measure))throw Error('Incomplete observation');evidence(o.source)}
}
// Stable URL-safe identifier derived from a canonical upstream identity, not its array position.
export function recordSlug(id:string){let h=2166136261;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619);return 'item-'+(h>>>0).toString(36)}
