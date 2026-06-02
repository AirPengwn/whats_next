/* ═══════════════════════════════════════════════════════════
   What's Next for Erin — shared site scripts
   Loaded in <head> on every page (after the theme-init inline
   script, before page-specific scripts).
   ═══════════════════════════════════════════════════════════ */

/* build-stamped version (build.js patches this line each build) */
var WN_VERSION = '20260602-97-82b92d63';

/* ── 1. Sync hook ──────────────────────────────────────────
   Patches window.fetch to timestamp every successful JSONbin
   call and fire an 'erin-sync' event so the indicator updates.
   Must run before any page script that calls fetch().         */
(function(){
  if(!window.fetch || window.__erinSyncHooked) return;
  window.__erinSyncHooked = true;
  var ORIG = window.fetch;
  window.fetch = function(){
    var args = arguments, p = ORIG.apply(this, args);
    try {
      var url = (args[0] && args[0].url) || args[0] || '';
      if(typeof url === 'string' && url.indexOf('api.jsonbin.io') > -1){
        p.then(function(r){
          if(r && (r.ok || r.status === 200)){
            localStorage.setItem('erin_last_sync', Date.now().toString());
            try { window.dispatchEvent(new Event('erin-sync')); } catch(e){}
          }
        }).catch(function(){});
      }
    } catch(e) {}
    return p;
  };
})();

/* ── 2. DOMContentLoaded: active nav + sync indicator + read-only mode ── */
document.addEventListener('DOMContentLoaded', function(){

  /* ── Active nav: highlight the link matching the current page ── */
  (function(){
    var filename = (location.pathname.replace(/.*\//, '') || 'index.html').toLowerCase();
    // For _next variant pages, highlight their parent section link
    var matchName = filename.replace('_next.html', '.html');
    document.querySelectorAll('.gnav-link').forEach(function(link){
      link.classList.remove('active');
      var href = (link.getAttribute('href') || '').toLowerCase().replace(/.*\//, '');
      if(href && (href === filename || href === matchName)){
        link.classList.add('active');
      }
    });
  })();

  /* ── Sync indicator: "✓ Synced Xm ago" chip in the nav ── */
  (function(){
    var wrap = document.querySelector('.gnav-wrap');
    if(!wrap || document.getElementById('gnav-sync')) return;
    var span = document.createElement('span');
    span.id = 'gnav-sync';
    span.className = 'gnav-sync';
    span.title = 'Last cloud sync';
    /* Dock the chip beside the theme toggle (right side), NOT inside the
       wrapping link row — keeps the header identical on every page. */
    var tog = document.getElementById('theme-toggle');
    if(tog && tog.parentNode === wrap) wrap.insertBefore(span, tog);
    else wrap.appendChild(span);

    function fmtAgo(ts){
      if(!ts) return '— not synced';
      var s = Math.floor((Date.now() - ts) / 1000);
      if(s < 5)  return '✓ Synced just now';
      if(s < 60) return '✓ Synced ' + s + 's ago';
      var m = Math.floor(s / 60);
      if(m < 60) return '✓ Synced ' + m + 'm ago';
      var h = Math.floor(m / 60);
      if(h < 24) return '✓ Synced ' + h + 'h ago';
      return '✓ Synced ' + Math.floor(h / 24) + 'd ago';
    }
    function renderSync(){
      var ts = parseInt(localStorage.getItem('erin_last_sync') || '0', 10);
      span.textContent = fmtAgo(ts);
    }
    renderSync();
    setInterval(renderSync, 30000);
    window.addEventListener('erin-sync', renderSync);
  })();

  /* ── Version badge: small "v <hash> · <date>" chip in the nav ── */
  (function(){
    var wrap = document.querySelector('.gnav-wrap');
    if(!wrap || document.getElementById('gnav-version')) return;
    var v = (typeof WN_VERSION !== 'undefined' && WN_VERSION) ? WN_VERSION : 'dev';
    /* WN_VERSION format: "YYYYMMDD-COUNT-HASH" (e.g., "20260602-97-82b92d63") */
    var m = /^(\d{4})(\d{2})(\d{2})-(\d+)-([0-9a-f]+)/.exec(v);
    var shortLabel, fullTitle;
    if(m){
      var MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var dateStr = MO[(+m[2])-1] + ' ' + (+m[3]);
      shortLabel = 'v ' + m[5] + ' · ' + dateStr;
      fullTitle = 'Build ' + v + ' · ' + m[4] + ' opportunities · ' + m[1] + '-' + m[2] + '-' + m[3];
    } else {
      shortLabel = 'v ' + v;
      fullTitle = 'Build ' + v;
    }
    var span = document.createElement('span');
    span.id = 'gnav-version';
    span.className = 'gnav-version';
    span.title = fullTitle;
    span.textContent = shortLabel;
    span.style.cssText = 'font-size:10px;color:var(--t3);padding:3px 8px;background:var(--bg2);border-radius:4px;white-space:nowrap;flex-shrink:0;margin-left:6px;border:.5px solid var(--bd);align-self:center;box-sizing:border-box;font-family:var(--fn)';
    var tog = document.getElementById('theme-toggle');
    if(tog && tog.parentNode === wrap) wrap.insertBefore(span, tog);
    else wrap.appendChild(span);
  })();

  /* ── Read-only mode: mark non-primary devices ── */
  (function(){
    if(localStorage.getItem('erin_primary_device') === '1') return;
    // Add class to <html> so CSS can hide all edit controls
    document.documentElement.classList.add('erin-readonly');
    // Insert a soft banner below the nav so it's clear this is view-only
    var banner = document.createElement('div');
    banner.id = 'erin-readonly-banner';
    banner.className = 'erin-readonly-banner';
    banner.innerHTML = '&#128065;&nbsp;<strong>View-only mode</strong> &mdash; you can explore Erin\'s progress but edits will not be saved. To enable editing, open My&nbsp;List and set this as the primary device.';
    var nav = document.querySelector('.global-nav');
    if(nav && nav.parentNode) nav.parentNode.insertBefore(banner, nav.nextSibling);
    else document.body.insertBefore(banner, document.body.firstChild);
  })();

});
