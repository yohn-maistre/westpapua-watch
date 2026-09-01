import fs from 'node:fs/promises';
import path from 'node:path';

const accountId=process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const apiToken=process.env.CLOUDFLARE_API_TOKEN?.trim();
const gatewayId=(process.env.AI_GATEWAY_ID||'westpapua-watch').trim();
if(!accountId)throw new Error('CLOUDFLARE_ACCOUNT_ID is required');
if(!apiToken)throw new Error('CLOUDFLARE_API_TOKEN is required');

const apiBase=`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai-gateway/gateways/${encodeURIComponent(gatewayId)}`;

async function cf(method,url,body){
  const res=await fetch(url,{
    method,
    headers:{
      authorization:`Bearer ${apiToken}`,
      'content-type':'application/json'
    },
    body:body===undefined?undefined:JSON.stringify(body)
  });
  const text=await res.text();
  let payload;
  try{payload=text?JSON.parse(text):{}}catch{payload={raw:text}}
  if(!res.ok||payload?.success===false){
    const detail=JSON.stringify(payload?.errors||payload?.messages||payload?.raw||payload).slice(0,1200);
    throw new Error(`${method} ${url} -> HTTP ${res.status}: ${detail}`);
  }
  return payload?.result??payload;
}

function routeArray(result){
  if(Array.isArray(result))return result;
  if(Array.isArray(result?.routes))return result.routes;
  if(Array.isArray(result?.data?.routes))return result.data.routes;
  return [];
}

function versionIdFrom(result){
  return result?.version_id||result?.id||result?.version?.version_id||result?.version?.id||null;
}

async function deployConfig(file){
  const config=JSON.parse(await fs.readFile(file,'utf8'));
  if(!config.name||!Array.isArray(config.elements))throw new Error(`Invalid route config: ${file}`);

  let routes=routeArray(await cf('GET',`${apiBase}/routes?per_page=100`));
  let route=routes.find((r)=>r?.name===config.name||r?.name===`dynamic/${config.name}`);

  if(!route){
    console.log(`Creating AI Gateway route ${config.name}`);
    const created=await cf('POST',`${apiBase}/routes`,{name:config.name,elements:config.elements});
    route=created;
    if(!route?.id){
      routes=routeArray(await cf('GET',`${apiBase}/routes?per_page=100`));
      route=routes.find((r)=>r?.name===config.name||r?.name===`dynamic/${config.name}`);
    }
  }
  if(!route?.id)throw new Error(`Could not resolve route id for ${config.name}`);

  console.log(`Creating version for ${config.name} (${route.id})`);
  const version=await cf('POST',`${apiBase}/routes/${encodeURIComponent(route.id)}/versions`,{elements:config.elements});
  const versionId=versionIdFrom(version);
  if(!versionId)throw new Error(`Could not resolve version id for ${config.name}: ${JSON.stringify(version).slice(0,800)}`);

  console.log(`Deploying ${config.name} version ${versionId}`);
  await cf('POST',`${apiBase}/routes/${encodeURIComponent(route.id)}/deployments`,{version_id:String(versionId)});

  const verify=await cf('GET',`${apiBase}/routes/${encodeURIComponent(route.id)}`);
  const deployed=verify?.deployment?.version_id||verify?.version?.version_id||verify?.deployed_version||'unknown';
  const expectedModels=config.elements.filter((e)=>e.type==='model').map((e)=>`${e.properties.provider}/${e.properties.model}`);
  const actualModels=(verify?.elements||[]).filter((e)=>e.type==='model').map((e)=>`${e.properties?.provider}/${e.properties?.model}`);
  if(actualModels.length&&JSON.stringify(actualModels)!==JSON.stringify(expectedModels)){
    throw new Error(`Route ${config.name} verification mismatch: expected ${expectedModels.join(' -> ')}, got ${actualModels.join(' -> ')}`);
  }
  console.log(`✓ dynamic/${config.name} deployed version ${deployed}: ${expectedModels.join(' -> ')}`);
}

const dir=path.resolve('config/ai-gateway');
for(const name of ['watch-fast.json','watch-synth.json','watch-ask.json']){
  await deployConfig(path.join(dir,name));
}
