import raw from '../../content/history.json';
export const historyChapters=raw.chapters.filter(chapter=>!chapter.hidden) as Array<{id:string;year:string;title:{en:string;pmy:string};body:{en:string;pmy:string};sourceIds:string[];visual:'map'|'document'|'split';hidden?:boolean}>;
