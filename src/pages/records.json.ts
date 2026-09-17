import {publicRecords} from '../data/records';
export const GET=()=>new Response(JSON.stringify({schemaVersion:1,records:publicRecords}),{headers:{'content-type':'application/json'}});
