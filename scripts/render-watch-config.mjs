import fs from 'node:fs';
import path from 'node:path';

const id=process.env.WATCH_DB_ID?.trim();
if(!id)throw new Error('WATCH_DB_ID is required');

const accountId=process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const gatewayId=(process.env.AI_GATEWAY_ID||'westpapua-watch').trim();
const explicitGatewayBase=process.env.AI_GATEWAY_BASE?.trim();
const gatewayBase=explicitGatewayBase||(accountId?`https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/compat`:'');

const src=path.resolve('services/watch-engine/wrangler.template.jsonc');
const out=path.resolve('services/watch-engine/wrangler.generated.jsonc');
let rendered=fs.readFileSync(src,'utf8')
  .replaceAll('__WATCH_DB_ID__',id)
  .replaceAll('__AI_GATEWAY_BASE__',gatewayBase);

if(rendered.includes('__WATCH_DB_ID__')||rendered.includes('__AI_GATEWAY_BASE__'))throw new Error('Failed to render Watch Engine config');
fs.writeFileSync(out,rendered);
console.log(`Rendered ${out}${gatewayBase?' with AI Gateway routing':' with direct Workers AI fallback'}`);
