// service-worker.js
const CACHE_NAME = 'my-website-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/App.css',
  '/src/assets/react.svg',
];

self.addEventListener('install', (event) => {
  // 安装service worker时预缓存资源
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // 拦截网络请求并尝试从缓存中提供资源
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在缓存中找到资源，则返回缓存的版本
        if (response) {
          return response;
        }
        // 否则发起网络请求
        return fetch(event.request).catch(() => {
          // 如果网络请求失败，返回一个默认的离线页面
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
    );
});

self.addEventListener('activate', (event) => {
  // 清理旧缓存
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});