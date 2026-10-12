export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function dateLabel(value, withTime = false) {
  if (!value) return '—'; const date = new Date(value.length === 10 ? value + 'T00:00:00' : value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('vi-VN', withTime ? {dateStyle:'short',timeStyle:'short'} : {dateStyle:'short'}).format(date);
}
export function licenseInfo(user, now = new Date()) {
  const until = user.paid_until || (user.trial_started ? new Date(Date.parse(user.trial_started + 'T00:00:00Z') + 14 * 86400000).toISOString().slice(0,10) : null);
  const today = now.toISOString().slice(0,10);
  return {until, label: user.status === 'Suspended' ? 'Đã khóa' : !until || until < today ? 'Hết hạn' : user.paid_until ? 'Bản quyền' : 'Dùng thử', kind: user.status === 'Suspended' ? 'danger' : !until || until < today ? 'muted' : user.paid_until ? 'success' : 'warning'};
}
export function stats(users, requests, now = new Date()) {
  return {total:users.length, paid:users.filter(u=>licenseInfo(u,now).label==='Bản quyền').length, trial:users.filter(u=>licenseInfo(u,now).label==='Dùng thử').length, pending:requests.filter(r=>r.status==='pending').length};
}
export function validateDraft(draft) {
  if (!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(draft.version)) throw new Error('Nhập phiên bản dạng 1.0.1 hoặc 1.0.1-beta.1.');
  if (!['stable','beta'].includes(draft.channel)) throw new Error('Kênh phát hành không hợp lệ.');
  if (!draft.notes.trim()) throw new Error('Hãy ghi nội dung cập nhật.');
  if (!draft.file_name || !/^[a-f0-9]{64}$/.test(draft.sha256) || !Number.isSafeInteger(draft.size_bytes) || draft.size_bytes <= 0) throw new Error('Chọn bộ cài để kiểm tra trước khi lưu bản nháp.');
  return draft;
}
