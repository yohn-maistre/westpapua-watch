const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
// Emerging Issues are an internal discovery queue in Freeze 09, not a public
// taxonomy feed. Steward-reviewed persistent Issues remain available at /api/issues.
export const onRequestGet:PagesFunction=async()=>new Response(JSON.stringify({error:'Not found'}),{status:404,headers});
