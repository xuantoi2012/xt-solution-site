import {selectRelease} from '../release.js';
export function downloadDetails(data){
 const release=selectRelease(data);if(!release)return null;
 const asset=data.assets.find(item=>item.name==='PDFReaderPro-Setup.exe');
 const hash=/^sha256:[a-f0-9]{64}$/i.test(asset.digest||'')?asset.digest.slice(7).toLowerCase():null;
 const stamp=Date.parse(data.published_at);
 return {...release,hash,date:Number.isFinite(stamp)?new Date(stamp).toISOString():null,notes:typeof data.body==='string'?data.body.slice(0,50000):''};
}
