'use strict';
// Public key only. Sessions remain in memory and never enter storage, logs or analytics.
const endpoint = 'https://hqtsqzmwesqqnfwpfjus.supabase.co/auth/v1';
const publicKey = 'sb_publishable_DjvOyM3Jkphn6gu7pfEUpA_W7VuYv6R';
const fragment = new URLSearchParams(location.hash.slice(1));
const query = new URLSearchParams(location.search);
history.replaceState(null, '', location.pathname);
const title = document.getElementById('title'), message = document.getElementById('message');
const form = document.getElementById('password-form');
let accessToken = fragment.get('access_token');
function show(heading, text, ok = false) { title.textContent = heading; message.textContent = text; document.getElementById('symbol').textContent = ok ? '✓' : '!'; }
async function api(path, body, method = 'POST') {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 20000);
  try {
    const headers = {apikey: publicKey, 'Content-Type': 'application/json'};
    if (accessToken) headers.Authorization = 'Bearer ' + accessToken;
    const response = await fetch(endpoint + path, {method, headers, body: body ? JSON.stringify(body) : undefined, signal: controller.signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer'});
    const data = await response.json();
    if (!response.ok) throw new Error('Liên kết không hợp lệ hoặc đã hết hạn. Hãy yêu cầu email mới tại trang Tài khoản.');
    return data;
  } finally { clearTimeout(timer); }
}
async function start() {
  try {
    if (fragment.has('error') || query.has('error')) throw new Error('Liên kết đã hết hạn hoặc đã được sử dụng. Hãy yêu cầu gửi lại email tại trang Tài khoản.');
    const type = query.get('type') || fragment.get('type');
    if (query.has('token_hash')) {
      if (!['email', 'signup', 'recovery'].includes(type)) throw new Error('Loại liên kết không được hỗ trợ.');
      const result = await api('/verify', {token_hash: query.get('token_hash'), type});
      accessToken = result.access_token;
    }
    if (!accessToken) throw new Error('Mở trang này từ liên kết xác nhận trong email của XT Solution.');
    const user = await api('/user', null, 'GET');
    if (!user.email_confirmed_at) throw new Error('Email chưa được xác nhận. Hãy mở liên kết mới nhất trong hộp thư.');
    if (type === 'recovery') {
      show('Đặt mật khẩu mới', 'Tạo mật khẩu mới cho tài khoản ' + user.email + '.'); form.hidden = false;
    } else {
      show('Xác nhận email thành công', 'Tài khoản ' + user.email + ' đã sẵn sàng. Quay lại PDF Reader Pro và đăng nhập để kích hoạt license.', true);
      accessToken = null;
    }
  } catch (error) { accessToken = null; show('Chưa thể xác nhận', error.name === 'AbortError' ? 'Kết nối quá thời gian. Hãy mở lại liên kết trong email.' : error.message); }
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  const password = document.getElementById('password').value;
  if (password.length < 8 || password !== document.getElementById('confirm').value) { message.textContent = 'Mật khẩu cần ít nhất 8 ký tự và hai lần nhập phải giống nhau.'; return; }
  const button = form.querySelector('button'); button.disabled = true;
  try { await api('/user', {password}, 'PUT'); accessToken = null; form.reset(); form.hidden = true; show('Đã đổi mật khẩu', 'Quay lại PDF Reader Pro và đăng nhập bằng mật khẩu mới.', true); }
  catch { message.textContent = 'Không đổi được mật khẩu. Kiểm tra kết nối hoặc yêu cầu liên kết mới.'; }
  finally { button.disabled = false; }
});
start();
