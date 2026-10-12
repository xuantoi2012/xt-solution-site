export function selectRelease(data){
 if(!data||data.draft||data.prerelease||!/^v?\d+\.\d+\.\d+$/.test(data.tag_name||'')||!Array.isArray(data.assets))return null;
 const asset=data.assets.find(a=>a.name==='PDFReaderPro-Setup.exe');
 if(!asset||!Number.isSafeInteger(asset.size)||asset.size<=0)return null;
 let url;try{url=new URL(asset.browser_download_url);}catch{return null;}
 if(url.protocol!=='https:'||url.hostname!=='github.com'||url.username||url.password||!url.pathname.startsWith('/xuantoi2012/PDFReaderPro-Releases/releases/download/'))return null;
 return {version:data.tag_name.replace(/^v/,''),url:url.href,size:asset.size};
}
