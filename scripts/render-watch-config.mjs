import fs from 'node:fs';import path from 'node:path';
const id=process.env.WATCH_DB_ID?.trim();if(!id)throw new Error('WATCH_DB_ID is required');
const src=path.resolve('services/watch-engine/wrangler.template.jsonc');const out=path.resolve('services/watch-engine/wrangler.generated.jsonc');
const rendered=fs.readFileSync(src,'utf8').replaceAll('__WATCH_DB_ID__',id);if(rendered.includes('__WATCH_DB_ID__'))throw new Error('Failed to render Watch Engine config');fs.writeFileSync(out,rendered);console.log(`Rendered ${out}`);
