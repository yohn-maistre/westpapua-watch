export function validatePartition(value:unknown,expected:number[]):number[][]|null{
  if(!Array.isArray(value)||value.length<2||value.some(g=>!Array.isArray(g)||g.length===0))return null;
  const groups=value as number[][],flat=groups.flat(),allowed=new Set(expected);
  if(flat.length!==expected.length||new Set(flat).size!==flat.length||flat.some(id=>!Number.isInteger(id)||!allowed.has(id)))return null;
  return groups.map(g=>[...g]);
}
