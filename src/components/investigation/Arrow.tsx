import '../../styles/editorial-icons.css';
export default function Arrow({direction='up-right'}:{direction?:'up-right'|'right'|'reset'}){
 return <svg className="watch-editorial-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">{direction==='reset'?<path d="M4 10a8 8 0 1 1 1.5 7M4 4v6h6"/>:direction==='right'?<path d="M4 12h15m-6-6 6 6-6 6"/>:<path d="M5 19 19 5M5 5h14v14"/>}</svg>;
}
