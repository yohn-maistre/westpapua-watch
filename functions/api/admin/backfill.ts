type Env={WATCH_ENGINE?:Fetcher};
export const onRequestPost:PagesFunction<Env>=async({request,env})=>{
 const auth=request.headers.get('authorization');if(!auth?.startsWith('Bearer '))return new Response('Unauthorized',{status:401});
 if(!env.WATCH_ENGINE)return new Response('Engine unavailable',{status:503});
 const text=await request.text();if(text.length>1024)return new Response('Too large',{status:413});
 let body:any;try{body=JSON.parse(text)}catch{return new Response('Invalid JSON',{status:400})}
 const days=Number(body.days||14);if(!Number.isInteger(days)||days<1||days>31)return new Response('Invalid days',{status:400});
 const response=await env.WATCH_ENGINE.fetch(new Request('https://watch.internal/backfill',{method:'POST',headers:{'authorization':auth,'content-type':'application/json'},body:JSON.stringify({days})}));
 return new Response(response.body,{status:response.status,headers:{'content-type':'application/json','cache-control':'no-store'}});
};
