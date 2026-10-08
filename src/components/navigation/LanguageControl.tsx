import {useEffect,useRef} from 'react';
import {ToggleGroup} from '@base-ui/react/toggle-group';
import {Toggle} from '@base-ui/react/toggle';
type Props={locale:'en'|'pmy';englishPath:string;indonesianPath:string;compact?:boolean};
export default function LanguageControl({locale,englishPath,indonesianPath,compact=false}:Props){
 const ref=useRef<HTMLDivElement>(null),selected=locale==='en'?'en':'id';
 useEffect(()=>{ref.current?.querySelectorAll<HTMLAnchorElement>('a').forEach(a=>{const url=new URL(a.href,location.href);url.search=location.search;url.hash=location.hash;a.href=url.href})},[]);
 return <ToggleGroup ref={ref} value={[selected]} onValueChange={(_,details)=>details.cancel()} aria-label={locale==='en'?'Language':'Bahasa'} className={`watch-language-control${compact?' compact-language-selector':''}`}>
  {(['en','id'] as const).map(code=><Toggle key={code} value={code} nativeButton={false} render={<a href={code==='en'?englishPath:indonesianPath} hrefLang={code} lang={code} aria-label={code==='en'?'English':'Bahasa Indonesia'} aria-current={code===selected?'true':undefined} data-language-swap={code!==selected?'':undefined}/>}
   onClick={event=>{const destination=new URL(event.currentTarget.href,location.href);destination.search=location.search;destination.hash=location.hash;event.currentTarget.href=destination.href;if(code===selected){event.preventDefault();return}if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;try{const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);sessionStorage.setItem('wpw:locale-scroll',JSON.stringify({target:new URL(event.currentTarget.href,location.href).pathname,ratio:scrollY/max}))}catch{}}}>{code.toUpperCase()}</Toggle>)}
 </ToggleGroup>;
}
