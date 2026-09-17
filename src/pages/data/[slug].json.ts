import {publicRecords} from '../../data/records';
export function getStaticPaths(){return publicRecords.map(record=>({params:{slug:record.slug},props:{record}}))}
export const GET=({props}:any)=>new Response(JSON.stringify({schemaVersion:1,record:props.record}),{headers:{'content-type':'application/json'}});
