/* Toybox service worker: pages load from the network when online (so updates arrive) and from the cache when offline. */
const VERSION = 'toybox-v5';
const CORE = ["./", "toybox.js", "manifest.webmanifest", "img/toybox-64.png", "img/toybox-180.png", "img/toybox-192.png", "starlight/", "starlight/manifest.webmanifest", "starlight/img/favicon-64.png", "starlight/img/icon-192.png", "kalimba-rain/", "kalimba-rain/manifest.webmanifest", "kalimba-rain/img/favicon-64.png", "kalimba-rain/img/icon-192.png", "doodle-zoo/", "doodle-zoo/manifest.webmanifest", "doodle-zoo/img/favicon-64.png", "doodle-zoo/img/icon-192.png", "goo-lab/", "goo-lab/manifest.webmanifest", "goo-lab/img/favicon-64.png", "goo-lab/img/icon-192.png", "flipside/", "flipside/manifest.webmanifest", "flipside/img/favicon-64.png", "flipside/img/icon-192.png", "slice-party/", "slice-party/manifest.webmanifest", "slice-party/img/favicon-64.png", "slice-party/img/icon-192.png", "snake/", "snake/manifest.webmanifest", "snake/img/favicon-64.png", "snake/img/icon-192.png", "block-drop/", "block-drop/manifest.webmanifest", "block-drop/img/favicon-64.png", "block-drop/img/icon-192.png", "road-hop/", "road-hop/manifest.webmanifest", "road-hop/img/favicon-64.png", "road-hop/img/icon-192.png", "maze-munch/", "maze-munch/manifest.webmanifest", "maze-munch/img/favicon-64.png", "maze-munch/img/icon-192.png", "hangman/", "hangman/manifest.webmanifest", "hangman/img/favicon-64.png", "hangman/img/icon-192.png", "paddle-duel/", "paddle-duel/manifest.webmanifest", "paddle-duel/img/favicon-64.png", "paddle-duel/img/icon-192.png", "Kalimba/", "phish-or-legit/", "phish-or-legit/manifest.webmanifest", "phish-or-legit/img/favicon-64.png", "phish-or-legit/img/icon-192.png", "road-ready/", "road-ready/manifest.webmanifest", "road-ready/img/favicon-64.png", "road-ready/img/icon-192.png", "first-aid-first/", "first-aid-first/manifest.webmanifest", "first-aid-first/img/favicon-64.png", "first-aid-first/img/icon-192.png", "water-wise/", "water-wise/manifest.webmanifest", "water-wise/img/favicon-64.png", "water-wise/img/icon-192.png", "breathe-easy/", "breathe-easy/manifest.webmanifest", "breathe-easy/img/favicon-64.png", "breathe-easy/img/icon-192.png", "fact-or-fake/", "fact-or-fake/manifest.webmanifest", "fact-or-fake/img/favicon-64.png", "fact-or-fake/img/icon-192.png", "health-myths/", "health-myths/manifest.webmanifest", "health-myths/img/favicon-64.png", "health-myths/img/icon-192.png", "share-or-keep/", "share-or-keep/manifest.webmanifest", "share-or-keep/img/favicon-64.png", "share-or-keep/img/icon-192.png", "password-lab/", "password-lab/manifest.webmanifest", "password-lab/img/favicon-64.png", "password-lab/img/icon-192.png", "sort-it-out/", "sort-it-out/manifest.webmanifest", "sort-it-out/img/favicon-64.png", "sort-it-out/img/icon-192.png"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(CORE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  const font = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!same && !font) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./'))));
    return;
  }
  if (font) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => {
    const net = fetch(req).then((res) => { if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
