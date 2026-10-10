// Equirectangular extent of the existing Natural Earth atlas fallback (600 × 380).
export const projectHistoryPoint=(longitude:number,latitude:number)=>({x:(longitude-128)/15*100,y:(2-latitude)/13*100});
