// Deliberately small Markdown subset. DOM construction never executes source HTML.
export function renderAnswer(value:string,citation:(label:string)=>Node):DocumentFragment{
 const fragment=document.createDocumentFragment();let list:HTMLUListElement|HTMLOListElement|null=null;let orderedCount=0;let item:HTMLLIElement|null=null;
 function inline(parent:Node,text:string){
  for(const part of text.split(/(\[S\d+\]|\*\*[^*\n]+\*\*|`[^`\n]+`)/g)){
   if(/^\[S\d+\]$/.test(part))parent.appendChild(citation(part));
   else if(part.startsWith('**')&&part.endsWith('**')){const strong=document.createElement('strong');strong.textContent=part.slice(2,-2);parent.appendChild(strong)}
   else if(part.startsWith('`')&&part.endsWith('`')){const code=document.createElement('code');code.textContent=part.slice(1,-1);parent.appendChild(code)}
   else parent.appendChild(document.createTextNode(part));
  }
 }
 for(const line of value.split(/\n/)){
  if(!line.trim())continue
  const bullet=line.match(/^\s*(?:[-*]|(\d+)\.)\s+(.+)$/);
  if(bullet){
   const tag=bullet[1]?'OL':'UL';
   if(tag==='UL')orderedCount=0;
   if(!list||list.tagName!==tag){
    list=document.createElement(tag.toLowerCase()) as HTMLUListElement;
    if(tag==='OL'){
     const start=Number(bullet[1]);
     if(start>1)orderedCount=start-1;
     if(orderedCount)list.setAttribute('start',String(orderedCount+1));
    }
    fragment.append(list);
   }
   item=document.createElement('li');inline(item,bullet[2]);list.append(item);
   if(tag==='OL')orderedCount++;
   continue;
  }
  if(list&&item&&/^ {2,}\S/.test(line)){const p=document.createElement('p');inline(p,line.trim());item.append(p);continue}
  if(/^#{1,4}\s/.test(line))orderedCount=0;
  list=null;const p=document.createElement(/^#{1,4}\s/.test(line)?'h3':'p');inline(p,line.replace(/^#{1,4}\s+/,''));fragment.append(p);
 }
 return fragment;
}
