const CACHE_NAME = 'dota-rhythm-v2';
const ASSETS = [
    './',
    'index.html',
    'style.css',
    'game.js'
];

self.addEventListener('install', (event) => {
    // 简化安装逻辑，只缓存核心代码，防止图片缺失导致安装失败
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // 如果网络请求失败且没缓存，不报错，返回空以防止闪退
                return new Response('');
            });
        })
    );
});