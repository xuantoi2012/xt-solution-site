const paths=new Set(['/','/downloads/','/account/','/admin/','/privacy/']);
export function appRoute(input,base){
 let url;try{url=new URL(input,base);}catch{return null;}
 const origin=new URL(base).origin;
 if(url.origin!==origin||!['http:','https:'].includes(url.protocol)||url.username||url.password)return null;
 if(!paths.has(url.pathname))return null;
 // Authentication callbacks are never handled by the content router.
 if(['access_token','refresh_token','token_hash','code'].some(key=>url.searchParams.has(key))||/access_token=|refresh_token=|token_hash=/.test(url.hash))return null;
 return url;
}
export function canHandleLink({href,target,download,button=0,ctrlKey=false,metaKey=false,shiftKey=false,altKey=false},base){
 if(button!==0||ctrlKey||metaKey||shiftKey||altKey||download||target&&target!=='_self')return null;
 const url=appRoute(href,base);return url?.hash==='#main'?null:url;
}
