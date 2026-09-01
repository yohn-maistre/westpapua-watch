import {spawnSync} from 'node:child_process';
const config='services/watch-engine/wrangler.generated.jsonc';
const run=(cmd,args)=>{const r=spawnSync(cmd,args,{encoding:'utf8'});if(r.status!==0)throw new Error((r.stderr||r.stdout||'command failed').trim());return r.stdout};
run(process.execPath,['scripts/render-watch-config.mjs']);
const sql=`SELECT 'articles_24h' metric,COUNT(*) value FROM articles WHERE fetched_at>=datetime('now','-1 day') UNION ALL SELECT 'filtered_24h',COUNT(*) FROM articles WHERE fetched_at>=datetime('now','-1 day') AND status='filtered' UNION ALL SELECT 'published_developments_24h',COUNT(*) FROM developments WHERE updated_at>=datetime('now','-1 day') AND status='published' UNION ALL SELECT 'held_developments_24h',COUNT(*) FROM developments WHERE updated_at>=datetime('now','-1 day') AND status='held';`;
const raw=run('npx',['--no-install','wrangler','d1','execute','DB','--remote','--json','--config',config,'--command',sql]);
let data=[];try{const parsed=JSON.parse(raw);data=parsed?.[0]?.results||parsed?.results||[]}catch{}
const metrics=Object.fromEntries(data.map(x=>[x.metric,Number(x.value||0)]));
const topRaw=run('npx',['--no-install','wrangler','d1','execute','DB','--remote','--json','--config',config,'--command',`SELECT COALESCE(issue_slug,'unassigned') issue_slug,COUNT(*) n FROM developments WHERE status='published' AND updated_at>=datetime('now','-1 day') GROUP BY issue_slug ORDER BY n DESC LIMIT 5;`]);
let top=[];try{const parsed=JSON.parse(topRaw);top=parsed?.[0]?.results||parsed?.results||[]}catch{}
console.log(`West Papua Watch · Daily\n\nArticles processed: ${metrics.articles_24h||0}\nFiltered as off-desk: ${metrics.filtered_24h||0}\nDevelopments published: ${metrics.published_developments_24h||0}\nDevelopments held by critic: ${metrics.held_developments_24h||0}\n\nMost active issues:\n${top.length?top.map(x=>`- ${x.issue_slug}: ${x.n}`).join('\n'):'- No published issue updates in the last 24h'}\n`);
