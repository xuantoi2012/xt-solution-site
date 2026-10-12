import {appRoute,canHandleLink} from './route-model.js';
document.documentElement.dataset.navigationId=crypto.randomUUID();
const loaders={
 '/':()=>import('../script.js'),
 '/downloads/':()=>import('../downloads/downloads.js'),
 '/account/':()=>import('../account/account.js'),
 '/admin/':()=>import('../admin/app.js'),
 '/privacy/':async()=>({mount:()=>({dispose(){},canLeave:()=>true})}),
};
let root=document.createElement('div');root.id='xt-page';
while(document.body.firstChild)root.append(document.body.firstChild);
document.body.append(root);
const progress=document.createElement('div');progress.className='route-progress';progress.hidden=true;progress.setAttribute('aria-hidden','true');
const status=document.createElement('div');status.className='route-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');document.body.append(progress,status);
let current=null,activeUrl=new URL(location.href),generation=0,controller,noticeTimer;
function notice(message){status.textContent=message;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>status.textContent='',5000);}
function position(url){if(url.hash&&url.pathname!=='/account/'&&url.pathname!=='/admin/'){let id=url.hash.slice(1);try{id=decodeURIComponent(id);}catch{}const target=document.getElementById(id);if(target){target.scrollIntoView({block:'start'});return;}}window.scrollTo({top:0,behavior:'instant'});}
function sameDocument(url){return url.pathname===activeUrl.pathname&&url.search===activeUrl.search;}
async function navigate(url,{pop=false}={}){
 if(!current?.canLeave?.()){notice('Đang xử lý thao tác. Vui lòng chờ hoàn tất trước khi chuyển trang.');if(pop)history.pushState(null,'',activeUrl.href);return;}
 if(sameDocument(url)){
  if(!pop)history.pushState(null,'',url.href);activeUrl=url;
  window.dispatchEvent(new HashChangeEvent('hashchange'));position(url);return;
 }
 const token=++generation;controller?.abort();controller=new AbortController();const signal=controller.signal;progress.hidden=false;root.setAttribute('aria-busy','true');
 let staged=[];
 try{
  const [response,pageModule]=await Promise.all([fetch(new URL(url.pathname,location.origin),{signal:AbortSignal.any([signal,AbortSignal.timeout(12000)]),credentials:'omit',cache:'no-cache',headers:{Accept:'text/html'}}),loaders[url.pathname]()]);
  if(!response.ok||new URL(response.url).origin!==location.origin||new URL(response.url).pathname!==url.pathname)throw new Error('Page unavailable');
  const page=new DOMParser().parseFromString(await response.text(),'text/html');
  if(!page.querySelector('main')||!page.title)throw new Error('Invalid page');
  const styles=[...page.querySelectorAll('link[rel=stylesheet]')].map(link=>new URL(link.getAttribute('href'),url).href);
  if(styles.some(href=>new URL(href).origin!==location.origin))throw new Error('Foreign stylesheet');
  const existing=[...document.querySelectorAll('link[rel=stylesheet]')];
  await Promise.all(styles.map(href=>new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.media='not all';staged.push(link);link.onload=resolve;link.onerror=reject;signal.addEventListener('abort',()=>reject(new Error('Cancelled')),{once:true});document.head.append(link);})));
  if(token!==generation||signal.aborted)return;
  // A mutation may have started while the destination was being fetched.
  if(!current.canLeave()){notice('Đang xử lý thao tác. Hãy chuyển trang sau khi hoàn tất.');return;}
  current.dispose();document.body.className=page.body.className;
  page.querySelectorAll('script').forEach(script=>script.remove());
  // Resolve resources against the destination before inserting into the current document.
  page.body.querySelectorAll('[src],[href]').forEach(element=>{for(const attribute of ['src','href'])if(element.hasAttribute(attribute))element.setAttribute(attribute,new URL(element.getAttribute(attribute),url).href);});
  const nextRoot=document.createElement('div');nextRoot.id='xt-page';while(page.body.firstChild)nextRoot.append(page.body.firstChild);
  root.replaceWith(nextRoot);root=nextRoot;existing.forEach(link=>link.remove());staged.forEach(link=>link.media='all');staged=[];
  if(!pop)history.pushState(null,'',url.href);activeUrl=url;document.title=page.title;
  for(const selector of ['meta[name=description]','meta[name=robots]','meta[name=referrer]','meta[name=theme-color]','link[rel=canonical]','link[rel=icon]','link[rel=manifest]']){const source=page.querySelector(selector),old=document.querySelector(selector);if(old)old.remove();if(source){if(source.tagName==='LINK')source.href=new URL(source.getAttribute('href'),url).href;document.head.append(source);}}
  current=pageModule.mount(root);root.classList.remove('route-enter');void root.offsetWidth;root.classList.add('route-enter');position(url);
  root.querySelector('h1')?.setAttribute('tabindex','-1');root.querySelector('h1')?.focus({preventScroll:true});
 }catch(error){if(!signal.aborted&&token===generation){notice('Chưa tải được trang. Hãy kiểm tra kết nối và thử lại.');if(pop)history.pushState(null,'',activeUrl.href);}}
 finally{staged.forEach(link=>link.remove());if(token===generation){progress.hidden=true;root.removeAttribute('aria-busy');}}
}
document.addEventListener('click',event=>{
 const link=event.target.closest('a[href]');if(!link||event.defaultPrevented)return;
 const url=canHandleLink({href:link.href,target:link.target,download:link.hasAttribute('download'),button:event.button,ctrlKey:event.ctrlKey,metaKey:event.metaKey,shiftKey:event.shiftKey,altKey:event.altKey},location.href);
 if(!url)return;event.preventDefault();void navigate(url);
});
window.addEventListener('popstate',()=>{const url=appRoute(location.href,location.href);if(url)void navigate(url,{pop:true});});
window.addEventListener('hashchange',()=>{if(location.pathname===activeUrl.pathname&&location.search===activeUrl.search)activeUrl=new URL(location.href);});
current=(await loaders[activeUrl.pathname]()).mount(root);
