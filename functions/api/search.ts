type Env={WATCH_ENGINE?:Fetcher};
export const onRequestGet:PagesFunction<Env>=async({request,env})=>{
 const q=(new URL(request.url).searchParams.get('q')||'').trim().slice(0,120);
 const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
 if(q.length<2)return Response.json({items:[]},{headers});
 if(!env.WATCH_ENGINE)return Response.json({items:[],available:false},{status:503,headers});
 const target=new URL('https://watch.internal/search');target.searchParams.set('q',q);
 try{const response=await env.WATCH_ENGINE.fetch(new Request(target,{signal:AbortSignal.timeout(8000)}));return new Response(response.body,{status:response.status,headers})}catch{return Response.json({items:[],available:false},{status:503,headers})}
};
