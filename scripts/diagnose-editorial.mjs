const base=process.env.WATCH_SITE_URL||'https://westpapua.watch';const token=process.env.WATCH_ADMIN_TOKEN;
if(!token)throw Error('Set WATCH_ADMIN_TOKEN in the environment; do not paste it into diagnostic output.');
const response=await fetch(new URL('/api/admin/status',base),{headers:{authorization:`Bearer ${token}`},signal:AbortSignal.timeout(30000)});
if(!response.headers.get('content-type')?.includes('application/json'))throw Error(`Diagnostic endpoint returned HTTP ${response.status}, not JSON`);
const payload=await response.json();const redact=(k,v)=>/token|secret|authorization|api.?key/i.test(k)?'[redacted]':v;
console.log(JSON.stringify({httpStatus:response.status,diagnostic:payload},redact,2));if(!response.ok)process.exitCode=1;
