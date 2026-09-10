const unavailable=()=>new Response(JSON.stringify({error:'Watch is temporarily unavailable. Please try again shortly.'}),{status:502,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
export const onRequest:PagesFunction=async({next})=>{
 try{
  const response=await next();
  if(!response.headers.get('content-type')?.includes('json'))return unavailable();
  // Some upstream proxies label an HTML error response as JSON. Check the body too.
  try{await response.clone().json()}catch{return unavailable()}
  return response;
 }catch{return unavailable()}
};
