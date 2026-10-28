import {readFile,writeFile} from 'node:fs/promises';
const id=process.env.WATCH_DB_ID?.trim();
if(!id||!/^[0-9a-f-]{36}$/i.test(id))throw new Error('WATCH_DB_ID must identify the existing Watch database');
const config=JSON.parse(await readFile('wrangler.jsonc','utf8'));
// Pages preview only. No production binding, migrations, queues or AI deployment.
config.env={...config.env,preview:{...config.env?.preview,services:config.services,r2_buckets:config.r2_buckets,vars:config.vars,d1_databases:[{binding:'NEWS_DB',database_name:'westpapua-watch-db',database_id:id}]}};
await writeFile('wrangler.jsonc',JSON.stringify(config,null,2)+'\n');
console.log('Configured the preview news SELECT route; production bindings unchanged.');
