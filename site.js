/* ═══════════════════════════════════════════════════════════
   What's Next for Erin — shared site scripts
   Loaded in <head> on every page (after the theme-init inline
   script, before page-specific scripts).
   ═══════════════════════════════════════════════════════════ */

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
    var inner = document.querySelector('.gnav-inner');
    if(!inner || document.getElementById('gnav-sync')) return;
    var span = document.createElement('span');
    span.id = 'gnav-sync';
    span.className = 'gnav-sync';
    span.title = 'Last cloud sync';
    inner.appendChild(span);

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
