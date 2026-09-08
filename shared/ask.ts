export type ChatMessage={role:'user'|'assistant';content:string};
// A bounded conversation window is context, never an evidence source.
export function chatHistory(value:unknown):ChatMessage[]{
 if(!Array.isArray(value))return [];
 return value.slice(-12).filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.replace(/\[S\d+\]/g,'').trim().slice(0,m.role==='user'?500:1200)})).filter(m=>m.content);
}
export function retrievalQuestion(query:string,history:ChatMessage[]){if(!/\b(it|that|they|them|this|those|earlier|more|why|itu|tadi|mereka|lanjut|tersebut)\b/i.test(query))return query;return [query,...history.filter(m=>m.role==='user').slice(-2).reverse().map(m=>m.content)].join(' ').slice(0,1200)}
