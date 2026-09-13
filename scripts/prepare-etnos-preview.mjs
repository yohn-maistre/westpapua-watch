const token=process.env.CLOUDFLARE_API_TOKEN,account=process.env.CLOUDFLARE_ACCOUNT_ID;
if(!token||!account)throw new Error('Missing Cloudflare deployment credentials');
const path=`https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects`;
async function call(url,method='GET',body){const r=await fetch(url,{method,headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();if(!d.success)throw new Error(`Cloudflare request failed: ${r.status} ${JSON.stringify(d.errors)}`);return d.result}
const projects=await call(path);let project=projects.find(p=>p.name==='etnos-watch-lab');
if(!project)await call(path,'POST',{name:'etnos-watch-lab',production_branch:'main'});
project=await call(`${path}/etnos-watch-lab`);
const preview=project.deployment_configs?.preview||{};
for(const key of ['d1_databases','r2_buckets','services','service_bindings','env_vars'])if(Object.keys(preview[key]||{}).length)throw new Error(`Preview isolation check: unexpected ${key}`);
console.log('Separate ETNOS Pages project verified; preview bindings empty.');
