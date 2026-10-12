import {siteConfig} from '../config.js';
import {downloadDetails} from './model.js';
const $=id=>document.getElementById(id);let hash=null;
$('copy-hash').addEventListener('click',async()=>{if(!hash)return;try{await navigator.clipboard.writeText(hash);$('copy-status').textContent='Đã sao chép SHA-256.';}catch{$('copy-status').textContent='Trình duyệt chưa cho sao chép. Bạn có thể chọn mã SHA-256 để sao chép thủ công.';}});
(async()=>{try{
 const response=await fetch(siteConfig.releaseApi,{headers:{Accept:'application/vnd.github+json'},credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw new Error('unavailable');const release=downloadDetails(await response.json());if(!release)throw new Error('no official release');
 $('release-version').textContent=release.version;$('release-size').textContent=(release.size/1048576).toFixed(1)+' MB';$('release-date').textContent=release.date?new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(release.date)):'Xem trên GitHub';
 $('installer-download').href=release.url;$('installer-download').querySelector('span').textContent='Tải Reader '+release.version+' cho Windows';$('release-status').textContent='Bộ cài chính thức từ GitHub Releases của XT Solution.';
 $('release-notes').textContent=release.notes||'Bản phát hành này chưa có ghi chú. Xem thông tin chi tiết tại kho phát hành chính thức.';
 if(release.hash){hash=release.hash;$('hash-row').hidden=false;$('release-hash').textContent=hash;$('release-hash').title=hash;}
 }catch{$('release-version').textContent='Xem trên GitHub';$('release-status').textContent='Chưa đọc được thông tin phiên bản. Nút phía trên vẫn mở kho phát hành chính thức để bạn chọn bộ cài.';$('release-notes').textContent='Chưa tải được nội dung cập nhật. Mở “Xem trên GitHub” để đọc bản phát hành.';}
})();
