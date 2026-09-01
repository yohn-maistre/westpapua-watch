import raw from '../../content/exhibition.json';
export const exhibitionItems=raw.items.filter(item=>!item.hidden) as Array<{slug:string;title:string;type:string;lane:'works'|'voices'|'archive';summary:string;image:string;sourceId:string;hidden?:boolean}>;
