// Explicit preview only: never used as fallback when real authentication or API calls fail.
export function demoData() {
  const today = new Date().toISOString().slice(0,10);
  const later = new Date(Date.now()+180*86400000).toISOString().slice(0,10);
  const old = new Date(Date.now()-40*86400000).toISOString().slice(0,10);
  const people = [['Nguyễn Minh Anh','minhanh@example.invalid'],['Trần Quốc Huy','quochuy@example.invalid'],['Lê Hoàng Nam','hoangnam@example.invalid'],['Phạm Thu Hà','thuha@example.invalid'],['Võ Đức Thành','ducthanh@example.invalid'],['Bùi Quang Long','quanglong@example.invalid']];
  const users = people.map(([display_name,email],i)=>({id:'demo-'+i,display_name,email,status:i===5?'Suspended':'Active',trial_started:i===4?old:today,paid_until:i%3===0?later:null,device_count:i%3,created_at:today+'T08:00:00Z',note:'Dữ liệu minh họa, không phải khách hàng thật.'}));
  const requests = [0,1,2].map(i=>({id:'request-'+i,user_id:users[i].id,email:users[i].email,display_name:users[i].display_name,kind:i===0?'purchase':'renewal',status:'pending',message:i===0?'Tôi muốn mua license PDF Reader Pro cho 2 máy.':'Nhờ XT Solution hỗ trợ gia hạn license thêm 1 năm.',created_at:today+'T09:00:00Z'}));
  return {users,requests,releases:[{id:'release-1',version:'1.1.0-beta.1',channel:'beta',notes:'Cải thiện trải nghiệm quản lý tài khoản.\nTối ưu thao tác trên bộ hồ sơ lớn.',file_name:'PDFReaderPro-Setup.exe',size_bytes:42236518,sha256:'a'.repeat(64),status:'draft',created_at:today+'T10:00:00Z'}]};
}
