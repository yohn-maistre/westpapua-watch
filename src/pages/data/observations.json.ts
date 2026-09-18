import {publicRecords} from '../../data/records';
export function GET(){return new Response(JSON.stringify({records:publicRecords.filter(r=>r.observations?.length)},null,2),{headers:{'Content-Type':'application/json; charset=utf-8'}})}
