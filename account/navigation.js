export const accountViews=Object.freeze({overview:'Tổng quan',devices:'Thiết bị',renew:'Mua / gia hạn',history:'Yêu cầu & phản hồi',profile:'Hồ sơ tài khoản',support:'Hỗ trợ'});
export function accountView(hash,search=''){
 const candidate=String(hash).replace(/^#/,'');
 if(Object.hasOwn(accountViews,candidate))return candidate;
 return new URLSearchParams(search).has('intent')?'renew':'overview';
}
