/** JSON boundary shared by live UI; HTML error pages never reach the user. */
export async function fetchJSON(url:string,init:RequestInit={}){
 const response=await fetch(url,{...init,headers:{accept:'application/json',...init.headers},signal:init.signal||AbortSignal.timeout(20000)});
 if(!response.ok||!response.headers.get('content-type')?.includes('json'))throw new Error('Service temporarily unavailable');
 try{return await response.json()}catch{throw new Error('Service temporarily unavailable')}
}
