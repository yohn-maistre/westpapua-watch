// Deliberately small Markdown subset. DOM construction never executes source HTML.
export function renderAnswer(value:string,citation:(label:string)=>Node):DocumentFragment{
 const fragment=document.createDocumentFragment();let list:HTMLUListElement|HTMLOListElement|null=null;
 function inline(parent:Node,text:string){
  for(const part of text.split(/(\[S\d+\]|\*\*[^*\n]+\*\*|`[^`\n]+`)/g)){
   if(/^\[S\d+\]$/.test(part))parent.appendChild(citation(part));
   else if(part.startsWith('**')&&part.endsWith('**')){const strong=document.createElement('strong');strong.textContent=part.slice(2,-2);parent.appendChild(strong)}
   else if(part.startsWith('`')&&part.endsWith('`')){const code=document.createElement('code');code.textContent=part.slice(1,-1);parent.appendChild(code)}
   else parent.appendChild(document.createTextNode(part));
  }
 }
 for(const line of value.split(/\n/)){
  if(!line.trim()){list=null;continue}
  const bullet=line.match(/^\s*(?:[-*]|(\d+)\.)\s+(.+)$/);
  if(bullet){const tag=bullet[1]?'OL':'UL';if(!list||list.tagName!==tag){list=document.createElement(tag.toLowerCase()) as HTMLUListElement;fragment.append(list)}const li=document.createElement('li');inline(li,bullet[2]);list.append(li);continue}
  list=null;const p=document.createElement(/^#{1,4}\s/.test(line)?'h3':'p');inline(p,line.replace(/^#{1,4}\s+/,''));fragment.append(p);
 }
 return fragment;
}
