/* Toybox shared helpers. One small file every toy loads.
   - Shared settings: sound and reduced motion, remembered across all toys
   - A tiny menu on each toy: home, fullscreen, share, install
   - Keeps the screen awake while you play, stops pull-to-refresh and double-tap zoom
   - Registers the service worker so the toys work offline and can be installed */
(function () {
  'use strict';
  var script = document.currentScript;
  var ROOT = new URL('./', script ? script.src : location.href).href;
  var T = window.Toybox = { root: ROOT, hub: document.documentElement.getAttribute('data-toybox') === 'hub', shareText: '' };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---- shared settings ---- */
  T.sound = store.get('toybox.sound', '1') !== '0';
  T.setSound = function (v) { T.sound = !!v; store.set('toybox.sound', v ? '1' : '0'); document.dispatchEvent(new CustomEvent('toybox:sound', { detail: T.sound })); };
  var mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  T.motionMode = function () { var m = store.get('toybox.motion', 'auto'); return m === 'reduced' || m === 'full' ? m : 'auto'; };
  Object.defineProperty(T, 'reduced', { get: function () { var m = T.motionMode(); return m === 'reduced' || (m === 'auto' && !!(mq && mq.matches)); } });
  T.setMotion = function (m) { store.set('toybox.motion', m); applyMotion(); document.dispatchEvent(new CustomEvent('toybox:motion', { detail: T.reduced })); };
  function applyMotion() { document.documentElement.classList.toggle('tb-reduced', T.reduced); }
  applyMotion();
  if (mq && mq.addEventListener) mq.addEventListener('change', applyMotion);

  /* ---- best scores (read by the home page) ---- */
  var KEYS = { 'flipside': 'flipside.best', 'slice-party': 'sliceparty.best' };
  T.best = function (slug) { var v = store.get(KEYS[slug] || ('retro.' + slug + '.best'), null); if (v === null) return null; v = +v; return isFinite(v) && v > 0 ? v : null; };

  /* ---- sharing ---- */
  T.setResult = function (name, score) { T.shareText = 'I scored ' + score + ' on ' + name + ' in Toybox. Can you beat it?'; };
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'tb-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 2200);
  }
  T.toast = toast;
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    return new Promise(function (res, rej) { try { var a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); var ok = document.execCommand('copy'); a.remove(); ok ? res() : rej(); } catch (e) { rej(e); } });
  }
  T.share = function () {
    var url = location.origin + location.pathname, title = document.title || 'Toybox';
    var text = T.shareText || ('Have a go at ' + title + ' on Toybox.');
    if (navigator.share) { navigator.share({ title: title, text: text, url: url }).catch(function () {}); return; }
    copyText(text + ' ' + url).then(function () { toast('Link copied'); }, function () { toast(url); });
  };

  /* ---- install ---- */
  var deferred = null;
  T.canInstall = false;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; T.canInstall = true; document.dispatchEvent(new CustomEvent('toybox:install-ready')); });
  window.addEventListener('appinstalled', function () { deferred = null; T.canInstall = false; document.dispatchEvent(new CustomEvent('toybox:install-ready')); toast('Installed'); });
  T.install = function () { if (!deferred) return; deferred.prompt(); deferred.userChoice.then(function () { deferred = null; T.canInstall = false; document.dispatchEvent(new CustomEvent('toybox:install-ready')); }); };
  T.isStandalone = function () { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; };
  T.isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  /* ---- service worker ---- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register(ROOT + 'sw.js').catch(function () {}); });
  }

  if (T.hub) return;

  /* ---- toy pages only: no pull-to-refresh, no double-tap zoom, keep the screen awake ---- */
  var css = document.createElement('style');
  css.textContent =
    'html,body{overscroll-behavior:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}' +
    '.tb-reduced *,.tb-reduced *::before,.tb-reduced *::after{animation-duration:.001s!important;animation-iteration-count:1!important;transition-duration:.001s!important}' +
    '.tb{position:fixed;z-index:2147483000;top:calc(env(safe-area-inset-top,0px) + 6px);left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:4px;padding:3px;border-radius:999px;background:rgba(10,10,22,.66);border:1px solid rgba(255,255,255,.22);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font:500 12px/1 system-ui,sans-serif;color:#fff;opacity:.5;transition:opacity .2s}' +
    '.tb:hover,.tb:focus-within,.tb.open{opacity:1}' +
    '.tb button,.tb a{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:36px;height:36px;padding:0 8px;border-radius:999px;color:#fff;cursor:pointer;font:500 12px/1 system-ui,sans-serif;letter-spacing:.02em}' +
    '.tb button:hover,.tb a:hover{background:rgba(255,255,255,.16)}.tb button:focus-visible,.tb a:focus-visible{outline:2px solid #fff;outline-offset:1px}' +
    '.tb svg{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '.tb .tb-items{display:none;align-items:center;gap:2px}.tb.open .tb-items{display:flex}.tb [hidden]{display:none!important}' +
    '.tb-toast{position:fixed;z-index:2147483001;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 70px);transform:translate(-50%,10px);padding:10px 16px;border-radius:999px;background:rgba(10,10,22,.9);color:#fff;font:500 13px/1 system-ui,sans-serif;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;border:1px solid rgba(255,255,255,.25)}' +
    '.tb-toast.on{opacity:1;transform:translate(-50%,0)}';
  document.head.appendChild(css);

  var wl = null;
  function lock() {
    if (!('wakeLock' in navigator) || document.hidden || wl) return;
    navigator.wakeLock.request('screen').then(function (l) { wl = l; l.addEventListener('release', function () { wl = null; }); }).catch(function () {});
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, lock, { passive: true }); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) lock(); });

  function icon(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'; }
  var I = {
    dots: icon('<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>'),
    home: icon('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'),
    full: icon('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    exit: icon('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'),
    share: icon('<path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 12v8h14v-8"/>'),
    install: icon('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 20h14"/>')
  };
  function build() {
    var bar = document.createElement('div'); bar.className = 'tb'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Toybox menu');
    var canFS = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
    bar.innerHTML =
      '<span class="tb-items">' +
      '<a href="' + ROOT + '" aria-label="Back to Toybox home">' + I.home + '<span>Toybox</span></a>' +
      (canFS ? '<button type="button" data-a="full" aria-label="Fullscreen">' + I.full + '</button>' : '') +
      '<button type="button" data-a="share" aria-label="Share this toy">' + I.share + '</button>' +
      '<button type="button" data-a="install" aria-label="Install Toybox" hidden>' + I.install + '</button>' +
      '</span>' +
      '<button type="button" data-a="menu" aria-expanded="false" aria-label="Toybox menu">' + I.dots + '</button>';
    document.body.appendChild(bar);
    ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup', 'click', 'keydown', 'keyup'].forEach(function (ev) { bar.addEventListener(ev, function (e) { e.stopPropagation(); }); });
    var timer;
    function setOpen(o) { bar.classList.toggle('open', o); bar.querySelector('[data-a=menu]').setAttribute('aria-expanded', String(o)); clearTimeout(timer); if (o) timer = setTimeout(function () { setOpen(false); }, 5000); }
    var fsBtn = bar.querySelector('[data-a=full]'), inBtn = bar.querySelector('[data-a=install]');
    function fsEl() { return document.fullscreenElement || document.webkitFullscreenElement; }
    function syncFS() { if (fsBtn) { fsBtn.innerHTML = fsEl() ? I.exit : I.full; fsBtn.setAttribute('aria-label', fsEl() ? 'Exit fullscreen' : 'Fullscreen'); } }
    function syncInstall() { inBtn.hidden = !(T.canInstall && !T.isStandalone()); }
    document.addEventListener('fullscreenchange', syncFS); document.addEventListener('webkitfullscreenchange', syncFS);
    document.addEventListener('toybox:install-ready', syncInstall); syncInstall();
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-a');
      if (a === 'menu') setOpen(!bar.classList.contains('open'));
      else if (a === 'full') { var d = document.documentElement; if (fsEl()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } else { var p = (d.requestFullscreen || d.webkitRequestFullscreen).call(d); if (p && p.catch) p.catch(function () { toast('Fullscreen is not available here'); }); } setOpen(false); }
      else if (a === 'share') { T.share(); setOpen(false); }
      else if (a === 'install') { T.install(); setOpen(false); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && bar.classList.contains('open')) setOpen(false); });
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
