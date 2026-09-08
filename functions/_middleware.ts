export const onRequest: PagesFunction = async ({request,next}) => {
 const url=new URL(request.url),path=url.pathname.replace(/^(\/pmy)?\/(current|issues)(?=\/|$)/,(_,locale,section)=>`${locale||''}/${section==='current'?'news':'topics'}`);
 if(path!==url.pathname){url.pathname=path;return Response.redirect(url.href,308)}
 return next();
};
