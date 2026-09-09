import raw from '../../content/history.json';
export const historyChapters=raw.chapters.filter(chapter=>!chapter.hidden);
