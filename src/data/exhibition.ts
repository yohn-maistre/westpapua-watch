import raw from '../../content/exhibition.json';
// Graphic plates are unique to each catalogue record. They are decorative and do
// not depict the work; unlicensed imagery remains at the linked collection source.
const cataloguePlate=(slug:string,lane:string)=>{
  let seed=0;for(const c of slug)seed=(Math.imul(seed,31)+c.charCodeAt(0))>>>0;
  const palettes:{[key:string]:string[]}={works:['#503c54','#c28b84','#aeb4d4'],voices:['#294847','#96bbb7','#dac5a9'],archive:['#2e3b54','#8da3bb','#c4aeb9']};
  const [deep,glow,trace]=palettes[lane]||palettes.archive;
  const paths=Array.from({length:7},(_,i)=>{const shift=(seed>>>((i%4)*6))%180;const y=i*93-80;return `<path d="M -120 ${y+shift} C 140 ${y-180+shift}, 330 ${y+260-shift}, 680 ${y-80+shift} S 1080 ${y+150-shift}, 1140 ${y-40}"/>`}).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="w"><stop stop-color="${glow}" stop-opacity=".72"/><stop offset="1" stop-color="${deep}"/></radialGradient></defs><rect width="1000" height="1000" fill="${deep}"/><ellipse cx="${180+seed%620}" cy="${100+(seed>>>8)%600}" rx="690" ry="570" fill="url(#w)"/><g fill="none" stroke="${trace}" stroke-opacity=".24" stroke-width="2">${paths}</g><circle cx="${250+(seed>>>12)%600}" cy="${350+seed%280}" r="${120+seed%170}" fill="none" stroke="${trace}" stroke-opacity=".22"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
export const exhibitionItems=raw.items.filter(item=>!item.hidden).map(item=>({
  ...item,
  image:item.rights==='source-only'?cataloguePlate(item.slug,item.lane):item.image
})) as Array<{slug:string;title:string;type:string;lane:'works'|'voices'|'archive';summary:string;image:string;sourceId:string;sourceUrl?:string;publisher?:string;credit?:string;creator?:string;year?:string;mediaKind?:string;rights?:string;provenance?:string;sizeHint?:string;hidden?:boolean}>;
