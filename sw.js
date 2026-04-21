const CACHE_NAME = 'dota-rhythm-v1';
const ASSETS = [
    'index.html',
    'style.css',
    'game.js',
    'sf_hero.png',
    'monster_satyr.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});