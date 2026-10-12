import {siteConfig} from './config.js';
import {selectRelease} from './release.js';
export function mount(root){
let disposed=false;
const events=new AbortController();
const on=(target,type,handler)=>target.addEventListener(type,handler,{signal:events.signal});
const find=id=>root.querySelector('#'+id);
const toolTabs=[...root.querySelectorAll('.studio-tabs [role=tab]')];
function selectTool(tab,focus=false){for(const item of toolTabs){const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;find(item.getAttribute('aria-controls')).hidden=!selected;}if(focus)tab.focus();}
for(const tab of toolTabs){tab.addEventListener('click',()=>selectTool(tab));tab.addEventListener('keydown',event=>{const index=toolTabs.indexOf(tab);let next;if(event.key==='ArrowRight')next=(index+1)%toolTabs.length;if(event.key==='ArrowLeft')next=(index+toolTabs.length-1)%toolTabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=toolTabs.length-1;if(next!==undefined){event.preventDefault();selectTool(toolTabs[next],true);}});}
const dialog=find('image-dialog');
root.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{find('expanded-image').src=button.dataset.image;dialog.showModal();}));
find('close-image').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
(async()=>{const label=find('release-info');try{const response=await fetch(siteConfig.releaseApi,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.any([events.signal,AbortSignal.timeout(8000)]),credentials:'omit',cache:'no-store'});if(!response.ok)throw new Error('release unavailable');const release=selectRelease(await response.json());if(!release)throw new Error('no official asset');const button=find('download-button');button.href=release.url;button.textContent='Tải Reader '+release.version+' ↓';label.textContent='Windows x64 · '+release.version+' · '+(release.size/1048576).toFixed(1)+' MB · Bộ cài chính thức';}catch{label.textContent='Windows x64 · Xem phiên bản và bộ cài tại kho phát hành XT Solution.';}})();
return {canLeave:()=>!(root.querySelector('dialog[open]')!==null),dispose(){disposed=true;events.abort();root.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());root.querySelectorAll('input[type=password]').forEach(input=>input.value='');}};
}
