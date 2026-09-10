import {libraryItems} from '../data/library';
export function GET(){return new Response(JSON.stringify({items:libraryItems}),{headers:{'content-type':'application/json; charset=utf-8'}})}
