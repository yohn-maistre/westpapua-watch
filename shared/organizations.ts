import records from '../content/organizations.json';
export const organizations=records;
const normalized=(v:string)=>v.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
// Match publisher identities only. A repository URL is not authorship or publishing evidence.
export function organizationIdsFor(item:{publisher?:string;publisherId?:string}){return organizations.filter(o=>o.publisherIds.includes(item.publisherId||'')||o.aliases.some(a=>normalized(a)===normalized(item.publisher||''))).map(o=>o.id)}
