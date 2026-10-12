const CACHE = 'xt-admin-shell-v4';
const SHELL = ['./', './index.html', './admin.css', './app.js', './api.js', './model.js', './demo.js', './renewal.js', './request-filter.js', './workspace.css', '../assets/xt-ui.css', '../assets/fonts.css', '../assets/fonts/be-vietnam-pro-latin-400-normal.woff2', '../assets/fonts/be-vietnam-pro-latin-500-normal.woff2', '../assets/fonts/be-vietnam-pro-latin-600-normal.woff2', '../assets/fonts/be-vietnam-pro-latin-700-normal.woff2', '../assets/fonts/be-vietnam-pro-latin-ext-400-normal.woff2', '../assets/fonts/be-vietnam-pro-latin-ext-500-normal.woff2', '../assets/fonts/be-vietnam-pro-latin-ext-600-normal.woff2', '../assets/fonts/be-vietnam-pro-latin-ext-700-normal.woff2', '../assets/fonts/be-vietnam-pro-vietnamese-400-normal.woff2', '../assets/fonts/be-vietnam-pro-vietnamese-500-normal.woff2', '../assets/fonts/be-vietnam-pro-vietnamese-600-normal.woff2', '../assets/fonts/be-vietnam-pro-vietnamese-700-normal.woff2', '../assets/icons.js', '../assets/site-router.js', '../assets/route-model.js', '../assets/icons.svg', '../assets/reader-icon.png', '../config.js', '../account/model.js', './icon.svg', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('xt-admin-shell-') && key !== CACHE).map(key => caches.delete(key))))); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Never cache API responses, authenticated data, or callback URLs.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !SHELL.some(path => new URL(path, self.registration.scope).pathname === url.pathname) || url.search) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => caches.match(event.request)));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const page = event.notification.data?.page === 'customers' ? 'customers' : 'requests';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows => {
    const tab = windows.find(window => new URL(window.url).pathname.startsWith('/admin/'));
    if (tab) { await tab.focus(); tab.postMessage({type:'open-page',page}); }
    else await clients.openWindow('./#' + page);
  }));
});
