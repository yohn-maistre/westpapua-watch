export async function recordEngineActivity(env:any,kind:'normal'|'backfill',details:any){
 const completedAt=new Date().toISOString();
 await env.DB.prepare(`INSERT INTO engine_activity(kind,completed_at,details_json) VALUES(?,?,?) ON CONFLICT(kind) DO UPDATE SET completed_at=excluded.completed_at,details_json=excluded.details_json WHERE julianday(excluded.completed_at)>=julianday(engine_activity.completed_at)`).bind(kind,completedAt,JSON.stringify(details)).run();
 return completedAt;
}
export async function engineActivity(env:any){
 // Read compatibility during rolling deployment; apply migration before worker.
 try{const row:any=await env.DB.prepare(`SELECT completed_at,details_json FROM engine_activity WHERE kind='normal'`).first();return row?{completed_at:row.completed_at,...JSON.parse(row.details_json)}:null}catch{return null}
}
