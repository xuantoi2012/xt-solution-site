import {siteConfig} from '../config.js';
export const PROJECT = siteConfig.supabaseUrl;
export const PUBLIC_KEY = siteConfig.publishableKey;
const SESSION_KEY = 'xt-admin-session-v1';
export class ApiError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
export function errorMessage(error) {
  const messages = {
    ADMIN_REQUIRED: 'Tài khoản này chưa được cấp quyền quản trị PDF Reader.',
    invalid_credentials: 'Email hoặc mật khẩu không đúng.',
    email_not_confirmed: 'Hãy xác nhận email trước khi đăng nhập.',
    PGRST202: 'Chưa cài SQL quản trị tương ứng trên máy chủ. Xem hướng dẫn triển khai.',
    REQUEST_PENDING: 'Bạn đã có một yêu cầu đang chờ xử lý.',
    REQUEST_ALREADY_REVIEWED: 'Yêu cầu đã được xử lý. Hãy làm mới danh sách.',
    LICENSE_WOULD_SHRINK: 'Ngày mới phải bằng hoặc sau hạn license hiện tại.',
    ACCOUNT_SUSPENDED: 'Tài khoản đang bị khóa. Cần mở khóa trước khi cấp license.',
    AUTH_REQUIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    NETWORK: 'Mất kết nối hoặc máy chủ chưa phản hồi. Hãy làm mới để kiểm tra kết quả trước khi gửi lại.',
    over_email_send_rate_limit: 'Bạn vừa yêu cầu email. Vui lòng đợi một lát trước khi gửi lại.',
    over_request_rate_limit: 'Có quá nhiều yêu cầu. Vui lòng đợi một lát rồi thử lại.',
    weak_password: 'Mật khẩu chưa đủ mạnh. Hãy dùng ít nhất 8 ký tự và tránh mật khẩu phổ biến.',
    signup_disabled: 'Đăng ký đang tạm đóng. Vui lòng liên hệ XT Solution.',
    ACCOUNT_NOT_FOUND: 'Chưa tìm thấy hồ sơ tài khoản. Vui lòng liên hệ XT Solution.',
    REQUEST_NOT_FOUND: 'Không tìm thấy yêu cầu này. Hãy làm mới danh sách.',
    INVALID_EXPIRY: 'Chọn ngày hết hạn từ hôm nay trở đi.',
    INVALID_REQUEST: 'Nội dung hoặc thời hạn yêu cầu không hợp lệ.',
  };
  return messages[error.code] || error.message || 'Chưa thực hiện được thao tác. Hãy thử lại.';
}
export class AdminApi {
  constructor({fetcher = (...args) => globalThis.fetch(...args), sessionStore = globalThis.sessionStorage, localStore = globalThis.localStorage, clock = () => Date.now(), storageKey = SESSION_KEY} = {}) {
    this.fetcher = fetcher; this.sessionStore = sessionStore; this.localStore = localStore; this.clock = clock;
    this.access = null; this.refreshToken = null; this.email = ''; this.expires = 0; this.generation = 0; this.refreshing = null;
    this.storageKey = storageKey;
  }
  clear() {
    this.generation++; this.access = this.refreshToken = null; this.email = ''; this.expires = 0;
    for (const store of [this.sessionStore, this.localStore]) { try { store?.removeItem(this.storageKey); } catch {} }
  }
  save(session, generation) {
    if (generation !== this.generation) throw new ApiError('AUTH_REQUIRED', 'Phiên đăng nhập đã kết thúc.');
    if (!session?.access_token || !session?.refresh_token) throw new ApiError('SERVER', 'Máy chủ trả về phiên đăng nhập không hợp lệ.');
    this.access = session.access_token; this.refreshToken = session.refresh_token;
    this.email = session.user?.email || this.email;
    this.expires = this.clock() + Math.max(0, (session.expires_in || 3600) - 60) * 1000;
    try { this.store?.setItem(this.storageKey, JSON.stringify({refresh: this.refreshToken, email: this.email})); } catch {}
  }
  async login(email, password, remember = false) {
    this.clear(); this.store = remember ? this.localStore : this.sessionStore; const generation = this.generation;
    const data = await this.send('/auth/v1/token?grant_type=password', {email: email.trim(), password}, false);
    this.save(data, generation);
  }
  async signUp(email, password, displayName) {
    return this.send('/auth/v1/signup?redirect_to=' + encodeURIComponent(siteConfig.confirmationUrl),
      {email: email.trim(), password, data: {display_name: displayName.trim()}}, false);
  }
  async recover(email) {
    await this.send('/auth/v1/recover?redirect_to=' + encodeURIComponent(siteConfig.confirmationUrl), {email: email.trim()}, false);
  }
  async resend(email) {
    await this.send('/auth/v1/resend?redirect_to=' + encodeURIComponent(siteConfig.confirmationUrl), {type: 'signup', email: email.trim()}, false);
  }
  async signOut() {
    // Capture the access token before clearing local state; a late logout must not clear a newer login.
    const access = this.access; this.clear();
    if (!access) return;
    try { await this.fetcher(PROJECT + '/auth/v1/logout?scope=local', {method:'POST', headers:{apikey:PUBLIC_KEY, Authorization:'Bearer '+access}, credentials:'omit', cache:'no-store', signal:AbortSignal.timeout(10000)}); } catch {}
  }
  async restore() {
    for (const store of [this.sessionStore, this.localStore]) {
      let saved; try { saved = JSON.parse(store?.getItem(this.storageKey) || 'null'); } catch { continue; }
      if (!saved?.refresh) continue;
      this.store = store; this.refreshToken = saved.refresh; this.email = saved.email || '';
      try { await this.refresh(); return true; }
      catch (error) { if (error.code !== 'NETWORK') this.clear(); throw error; }
    }
    return false;
  }
  async refresh() {
    if (!this.refreshToken) throw new ApiError('AUTH_REQUIRED', 'Vui lòng đăng nhập lại.');
    if (this.refreshing) return this.refreshing;
    const generation = this.generation;
    this.refreshing = this.send('/auth/v1/token?grant_type=refresh_token', {refresh_token: this.refreshToken}, false)
      .then(data => this.save(data, generation)).finally(() => { this.refreshing = null; });
    return this.refreshing;
  }
  async rpc(name, body = {}) {
    if (!this.access || this.clock() >= this.expires) await this.refresh();
    const generation = this.generation;
    try {
      const result = await this.send('/rest/v1/rpc/' + name, body, true);
      if (generation !== this.generation) throw new ApiError('AUTH_REQUIRED', 'Phiên đăng nhập đã kết thúc.');
      return result;
    } catch (error) {
      // Mutations are never automatically retried: an interrupted response may already have committed.
      if (error.code === 'AUTH_REQUIRED') this.clear();
      throw error;
    }
  }
  async send(path, body, authenticated) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 20000);
    try {
      const headers = {apikey: PUBLIC_KEY, 'Content-Type': 'application/json'};
      if (authenticated) headers.Authorization = 'Bearer ' + this.access;
      const response = await this.fetcher(PROJECT + path, {method: 'POST', headers, body: JSON.stringify(body), signal: controller.signal, credentials: 'omit', cache: 'no-store'});
      let data; try { data = await response.json(); } catch { if (response.ok) return null; }
      if (!response.ok) {
        const raw = data?.message || data?.msg || '';
        const known = raw.match(/ADMIN_REQUIRED|REQUEST_PENDING|REQUEST_ALREADY_REVIEWED|LICENSE_WOULD_SHRINK|ACCOUNT_SUSPENDED|ACCOUNT_NOT_FOUND|REQUEST_NOT_FOUND|INVALID_EXPIRY|INVALID_REQUEST|AUTH_REQUIRED/);
        const code = authenticated && response.status === 401 ? 'AUTH_REQUIRED' : known?.[0] || data?.error_code || data?.code || (response.status === 401 ? 'AUTH_REQUIRED' : 'SERVER');
        throw new ApiError(code, 'Máy chủ chưa chấp nhận yêu cầu (' + response.status + ').');
      }
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('NETWORK', 'Không kết nối được máy chủ.');
    } finally { clearTimeout(timer); }
  }
}
