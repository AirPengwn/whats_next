/* ═══════════════════════════════════════════════════════════
   What's Next for Erin — shared site scripts
   Loaded in <head> on every page (after the theme-init inline
   script, before page-specific scripts).
   ═══════════════════════════════════════════════════════════ */

/* build-stamped version + build (build.js patches these lines each release) */
var WN_VERSION = '3.49';
var WN_BUILD   = '20260727-505-0efed9b2';

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

/* ── 1b. BEST-LINK RESOLVER (v3.47) ───────────────────────────────────────
   23% of entries (109 of 480 as of this release) carry no `url` field at all
   — their link lives in `links[]` instead. Browse cards already fall back to
   url -> url2 -> links[], but every DOWNSTREAM consumer (Applications, My
   List's app seed, Professor tracker, Compare, the dashboard punch list, the
   print packet) read `it.url` alone and silently rendered no link. An
   application seeded from one of those 103 entries had no "Apply / View
   posting" button even though a perfectly good URL was sitting in links[].

   wnUrl(it) is the one place that decides "what is this item's link", so a
   future entry shaped any of these ways is handled everywhere at once.       */
window.wnUrl = function(it){
  if(!it) return '';
  function ok(h){ return typeof h==='string' && /^https?:/i.test(h) ? h : ''; }
  var u = ok(it.url) || ok(it.url2);
  if(u) return u;
  var L = it.links;
  if(Array.isArray(L)){
    for(var i=0;i<L.length;i++){
      var h = L[i] && ok(L[i].href);
      if(h) return h;
    }
  }
  return '';
};

/* ── 1a. LOCALHOST WRITE LOCK (v3.26) ─────────────────────────────────────
   HARD RULE: a page served from localhost / 127.0.0.1 / file:// may READ the
   cloud but may NEVER write to it. Preview and testing happen on localhost;
   Erin's real data must be unreachable from there, full stop.

   Why this exists: on 2026-07-27 a preview test set erin_primary_device='1'
   and seeded a fake application. The fetch stub covered that page, but the
   NEXT page navigation loaded fresh JS without the stub while the flag and
   fake record were still in localStorage — the init heartbeat then pushed
   1 test record over Erin's 28 real ones. No stub can protect against this,
   because the danger is on page LOAD, before any test code runs. Blocking by
   ORIGIN is the only fix that can't be forgotten or out-sequenced. */
(function(){
  var h = location.hostname;
  var isLocal = h==='localhost' || h==='127.0.0.1' || h==='' || location.protocol==='file:';
  window.WN_LOCAL_READONLY = isLocal;
  if(!isLocal) return;                       /* live site: untouched */
  var _f = window.fetch;
  window.fetch = function(input, init){
    var url = (input && input.url) || input || '';
    var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    if(typeof url === 'string' && url.indexOf('api.jsonbin.io') > -1 && method !== 'GET'){
      try{ console.warn('[LOCAL WRITE LOCK] blocked '+method+' to the live cloud from '+(h||'file://')+' — preview cannot modify real data'); }catch(e){}
      return Promise.resolve({ ok:true, status:200, json:function(){ return Promise.resolve({record:{},localBlocked:true}); } });
    }
    return _f.apply(this, arguments);
  };
})();

/* ── 1b. SANDBOX / TEST MODE ──────────────────────────────────────────────
   v3.22. Lets you explore and change anything on the site WITHOUT any of it
   being saved — nothing reaches the cloud, nothing reaches localStorage.
   The page still PULLS Erin's real current state (GET is allowed), so you're
   playing with real data; you just can't alter it.

   Why this is safe: every write in the entire site funnels through exactly
   two chokepoints, and this file runs on every page BEFORE any page script:
     1. fetch(... method:'PUT' ...) -> JSONbin   (44 call sites)
     2. localStorage.setItem / removeItem       (all the *_v1 stores)
   Both are intercepted below, so no page needs to know sandbox exists.

   Stored in sessionStorage ON PURPOSE: it clears when the tab/browser closes,
   so it can never be silently left on while Erin is actually working. */
(function(){
  var KEY='erin_sandbox';
  function isOn(){ try{ return sessionStorage.getItem(KEY)==='1'; }catch(e){ return false; } }
  window.WN_SANDBOX = isOn();
  window.__wnSandbox = {
    isOn: isOn,
    enable: function(){ try{ sessionStorage.setItem(KEY,'1'); }catch(e){} location.reload(); },
    disable: function(){ try{ sessionStorage.removeItem(KEY); }catch(e){} location.reload(); },
    blocked: 0
  };
  if(!isOn()) return;           /* completely inert when off — no patching at all */

  /* (1) Block every cloud WRITE. GET still works, so pages pull Erin's REAL
     current state; only the write-back is swallowed. */
  var _fetch = window.fetch;
  window.fetch = function(input, init){
    var url = (input && input.url) || input || '';
    var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    if(typeof url === 'string' && url.indexOf('api.jsonbin.io') > -1 && method !== 'GET'){
      window.__wnSandbox.blocked++;
      try{ console.info('[SANDBOX] blocked '+method+' to cloud — nothing was saved'); }catch(e){}
      /* Resolve like a success so page code carries on normally */
      return Promise.resolve({ ok:true, status:200, json:function(){ return Promise.resolve({record:{},sandbox:true}); } });
    }
    return _fetch.apply(this, arguments);
  };

  /* (2) Swap Erin's data stores for an IN-MEMORY copy.
     Not simply "blocked": if writes were dropped the UI would snap back on every
     re-render and you couldn't try anything. Instead reads AND writes are served
     from a memory map that dies with the tab — so the whole site behaves normally
     while real localStorage is never touched.

     The map starts EMPTY on purpose: each page's "local is empty -> restore from
     cloud" path then fires, pulling Erin's genuine current state to play with.

     'erin_primary_device' is spoofed to '1' so the site treats this as the
     primary device and UNLOCKS the full UI (status dropdowns, Save buttons,
     add/remove) — which is the whole point of test mode on a view-only PC. */
  var mem = { erin_primary_device:'1', erin_primary_device_bak:'1' };
  var realGet = Storage.prototype.getItem,
      realSet = Storage.prototype.setItem,
      realRem = Storage.prototype.removeItem;
  function mine(k){ return typeof k==='string' && /^erin_/.test(k) && k!=='erin_theme'; }
  try{
    localStorage.getItem = function(k){
      if(mine(k)) return Object.prototype.hasOwnProperty.call(mem,k) ? mem[k] : null;
      return realGet.apply(localStorage, arguments);
    };
    localStorage.setItem = function(k,v){
      if(mine(k)){ mem[k]=String(v); window.__wnSandbox.blocked++; return; }
      return realSet.apply(localStorage, arguments);   /* theme still persists */
    };
    localStorage.removeItem = function(k){
      if(mine(k)){ delete mem[k]; return; }
      return realRem.apply(localStorage, arguments);
    };
    localStorage.clear = function(){ mem={}; };
  }catch(e){}
  window.__wnSandbox.mem = mem;
})();

/* ── 2. DOMContentLoaded: active nav + sync indicator + read-only mode ── */
document.addEventListener('DOMContentLoaded', function(){

  /* v2.1 emoji-sweep finish: resolve any <span data-i="iconName"> placeholder
     to a line-icon SVG. Lets `.tip` boxes and other section glyphs across
     pages use `<span class="tip-icon" data-i="archive"></span>` without each
     page needing its own bootstrap. */
  (function(){
    if(!window.WN_ICONS) return;
    document.querySelectorAll('[data-i]').forEach(function(el){
      var name = el.getAttribute('data-i');
      if(WN_ICONS[name]) el.innerHTML = WN_ICONS[name](16);
    });
  })();

  /* ── v2.0 Phase 2.3: rebuild the global nav into the compact 3-group form ──
     One source of truth — replaces hand-edited 17-link wrapping bar on every
     page. Detects current page, picks group, renders WN brand + group tabs +
     utilities. Also injects an on-page sub-nav strip below the header when
     the current page belongs to a group (Track/Browse/Write).               */
  (function(){
    var nav = document.querySelector('nav.global-nav');
    if(!nav) return;
    var filename = (location.pathname.replace(/.*\//, '') || 'index.html').toLowerCase();
    var I = window.WN_ICONS || {};
    function ic(name, size){ return (I[name] ? I[name](size) : ''); }

    /* Per-page metadata — group / sub-label / icon name */
    var PAGES = {
      'index.html':              { group:null,    sub:'Home',     icon:'home',     href:'index.html' },
      'erin_search.html':        { group:null,    sub:'Search',   icon:'search',   href:'erin_search.html', util:true },
      'erin_bio.html':           { group:null,    sub:'Profile',  icon:'person',   href:'erin_bio.html' },
      'erin_howto.html':         { group:null,    sub:'How to',   icon:'check',    href:'erin_howto.html', util:true },
      /* Track */
      'erin_mylist.html':        { group:'track', sub:'My List',     icon:'star',     href:'erin_mylist.html' },
      'erin_compare.html':       { group:'track', sub:'Compare',     icon:'compare',  href:'erin_compare.html' },
      'erin_punchlist.html':     { group:'track', sub:'Punch List',  icon:'check',    href:'erin_punchlist.html' },
      'erin_finds.html':         { group:'track', sub:'Finds',       icon:'bolt',     href:'erin_finds.html' },
      'erin_pipeline.html':      { group:'track', sub:'Pipeline',    icon:'kanban',   href:'erin_pipeline.html' },
      'erin_timeline.html':      { group:'track', sub:'Timeline',    icon:'calendar', href:'erin_timeline.html' },
      'erin_applications.html':  { group:'track', sub:'Tracker',     icon:'file',     href:'erin_applications.html' },
      'erin_proftracker.html':   { group:'track', sub:'Profs',       icon:'person',   href:'erin_proftracker.html' },
      'erin_reftracker.html':    { group:'track', sub:'Refs',        icon:'pen',      href:'erin_reftracker.html' },
      'erin_archive.html':       { group:'track', sub:'Archive',     icon:'archive',  href:'erin_archive.html' },
      /* Browse */
      'erin_programs.html':      { group:'browse', sub:'Programs',    icon:'cap',       href:'erin_programs.html' },
      'erin_internships.html':   { group:'browse', sub:'Internships', icon:'clipboard', href:'erin_internships.html' },
      'erin_jobs.html':          { group:'browse', sub:'Jobs',        icon:'briefcase', href:'erin_jobs.html' },
      'erin_service.html':       { group:'browse', sub:'Service',     icon:'leaf',      href:'erin_service.html' },
      /* Write */
      'erin_materials.html':       { group:'write', sub:'Materials', icon:'book',    href:'erin_materials.html' },
      'erin_writing_samples.html': { group:'write', sub:'Writing',   icon:'pen',     href:'erin_writing_samples.html' },
      'erin_outreach.html':        { group:'write', sub:'Outreach',  icon:'inbox',   href:'erin_outreach.html' },
      'erin_packet.html':          { group:'write', sub:'Packet',    icon:'printer', href:'erin_packet.html' }
    };
    var current = PAGES[filename] || { group:null };

    var GROUPS = {
      track:  { label:'Track',  cls:'gl-track',  first:'erin_mylist.html'   },
      browse: { label:'Browse', cls:'gl-browse', first:'erin_programs.html' },
      write:  { label:'Write',  cls:'gl-write',  first:'erin_materials.html'}
    };
    function groupSubLinks(g){
      var out = [];
      for(var k in PAGES){ if(PAGES[k].group===g) out.push(PAGES[k]); }
      return out;
    }

    /* Build the new nav HTML */
    var html = '<div class="gnav-wrap wn-nav-wrap">';
    /* Brand */
    html += '<a href="index.html" class="wn-brand" aria-label="What\'s Next — Home">';
    html += '<span class="wn-logo">WN</span>';
    html += '<span class="wn-mark">What&rsquo;s Next</span>';
    html += '</a>';
    /* Group tabs */
    html += '<div class="wn-groups">';
    ['track','browse','write'].forEach(function(g){
      var info = GROUPS[g];
      var active = (current.group === g) ? ' active' : '';
      html += '<a href="' + info.first + '" class="wn-gtab ' + info.cls + active + '">' + info.label + '</a>';
    });
    html += '</div>';
    /* Utilities — search + theme toggle + (sync/version chips appended later) */
    html += '<div class="wn-utils">';
    html += '<a href="erin_search.html" class="wn-util-link" title="Search everything">' + ic('search',15) + '<span>Search</span></a>';
    html += '<a href="erin_howto.html" class="wn-util-link' + (filename==='erin_howto.html'?' active':'') + '" title="How to use this site">' + ic('check',15) + '<span>How to</span></a>';
    /* v3.22: Test-mode switch — explore/change anything without saving a thing */
    var _sb = !!window.WN_SANDBOX;
    html += '<button id="wn-sandbox-toggle" class="wn-sandbox-btn' + (_sb?' on':'') + '" type="button" '
          + 'title="' + (_sb ? 'TEST MODE is ON — nothing you do is being saved. Click to turn off.'
                             : 'Turn on TEST MODE — explore and change anything without saving. Erin\'s data is untouched.') + '">'
          + '<span class="wn-sb-dot"></span><span>' + (_sb ? 'TEST ON' : 'Test') + '</span></button>';
    html += '<button id="theme-toggle" class="gnav-toggle" type="button" title="Toggle theme" onclick="window.__toggleTheme&&window.__toggleTheme()">&#9728;</button>';
    html += '</div>';
    html += '</div>';
    nav.innerHTML = html;

    /* v3.22: wire the TEST switch + show the always-visible banner while it's on */
    (function(){
      var btn = document.getElementById('wn-sandbox-toggle');
      if(btn) btn.onclick = function(){
        if(window.WN_SANDBOX){ window.__wnSandbox.disable(); }
        else if(confirm('Turn ON TEST MODE?\n\nYou can use the whole site — change statuses, save items, edit anything — and NONE of it is saved. Erin\'s real data is never touched.\n\nTurning it off (or closing this tab) discards everything you did and reloads her real data.')){
          window.__wnSandbox.enable();
        }
      };
      if(!window.WN_SANDBOX) return;
      if(document.getElementById('wn-sandbox-banner')) return;
      var b = document.createElement('div');
      b.id = 'wn-sandbox-banner';
      b.style.cssText = [
        'display:block','width:100%','box-sizing:border-box','text-align:center',
        'font-family:var(--fn)','font-size:12.5px','font-weight:700','letter-spacing:.04em',
        'color:#3a2900','background:#e8c14a','border-bottom:1px solid #b8912b',
        'padding:5px 1rem','line-height:1.4','position:relative','z-index:99'
      ].join(';');
      b.innerHTML = '&#9888; TEST MODE &mdash; nothing you do here is saved. '
                  + '<span style="font-weight:500">Erin&rsquo;s real data is untouched.</span> '
                  + '<button type="button" id="wn-sb-off" style="margin-left:10px;font-family:var(--fn);font-size:12px;font-weight:700;padding:1px 10px;border-radius:999px;border:1px solid #7a5f12;background:#3a2900;color:#e8c14a;cursor:pointer">Turn off</button>';
      nav.parentNode.insertBefore(b, nav.nextSibling);
      var off = document.getElementById('wn-sb-off');
      if(off) off.onclick = function(){ window.__wnSandbox.disable(); };
    })();

    /* Sub-nav strip — appears as a sibling RIGHT AFTER the nav, on grouped pages */
    var existing = document.getElementById('wn-subnav');
    if(existing) existing.parentNode.removeChild(existing);
    if(current.group){
      var sub = document.createElement('div');
      sub.id = 'wn-subnav';
      sub.className = 'wn-subnav ' + GROUPS[current.group].cls;
      var inner = '<div class="wn-subnav-wrap">';
      inner += '<span class="wn-subnav-label">' + GROUPS[current.group].label + '</span>';
      groupSubLinks(current.group).forEach(function(p){
        var act = (p.href === filename) ? ' active' : '';
        inner += '<a href="' + p.href + '" class="wn-subnav-link' + act + '">' + ic(p.icon, 14) + '<span>' + p.sub + '</span></a>';
      });
      inner += '</div>';
      sub.innerHTML = inner;
      nav.parentNode.insertBefore(sub, nav.nextSibling);
    }
  })();

  /* ── Sync indicator: "✓ Synced Xm ago" chip in the nav ── */
  (function(){
    var wrap = document.querySelector('.gnav-wrap');
    if(!wrap || document.getElementById('gnav-sync')) return;
    var span = document.createElement('span');
    span.id = 'gnav-sync';
    span.className = 'gnav-sync';
    span.title = 'Last cloud sync';
    /* Inline styles — match version badge dimensions exactly, teal-tinted */
    span.style.cssText = 'font-size:12.5px;color:var(--teal-t);padding:2px 8px;background:var(--teal-bg);border-radius:6px;white-space:nowrap;flex-shrink:0;margin-left:6px;border:.5px solid var(--teal);align-self:center;box-sizing:border-box;font-family:var(--fn);font-weight:500';
    /* Dock the chip beside the theme toggle (right side). v2.0 Phase 2.3:
       theme-toggle now lives inside .wn-utils, not directly under .gnav-wrap,
       so insert into its parent so the chip appears in the utilities cluster. */
    var tog = document.getElementById('theme-toggle');
    if(tog && tog.parentNode) tog.parentNode.insertBefore(span, tog);
    else wrap.appendChild(span);

    function fmtAgo(ts){
      if(!ts) return '— sync';
      var s = Math.floor((Date.now() - ts) / 1000);
      if(s < 10) return '✓ sync';
      if(s < 60) return '✓ ' + s + 's';
      var m = Math.floor(s / 60);
      if(m < 60) return '✓ ' + m + 'm';
      var h = Math.floor(m / 60);
      if(h < 24) return '✓ ' + h + 'h';
      return '✓ ' + Math.floor(h / 24) + 'd';
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
    var release = (typeof WN_VERSION !== 'undefined' && WN_VERSION) ? WN_VERSION : 'dev';
    var build   = (typeof WN_BUILD   !== 'undefined' && WN_BUILD)   ? WN_BUILD   : '';
    var shortLabel = 'v ' + release;
    var fullTitle;
    /* WN_BUILD format: "YYYYMMDD-COUNT-HASH" */
    var m = /^(\d{4})(\d{2})(\d{2})-(\d+)-([0-9a-f]+)/.exec(build);
    if(m){
      var MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      fullTitle = 'Release ' + release + ' · build ' + m[5] +
                  ' · ' + MO[(+m[2])-1] + ' ' + (+m[3]) + ' ' + m[1] +
                  ' · ' + m[4] + ' opportunities';
    } else {
      fullTitle = 'Release ' + release + (build ? ' · ' + build : '');
    }
    var span = document.createElement('span');
    span.id = 'gnav-version';
    span.className = 'gnav-version';
    span.title = fullTitle;
    span.textContent = shortLabel;
    span.style.cssText = 'font-size:12.5px;color:var(--t3);padding:2px 8px;background:var(--bg2);border-radius:6px;white-space:nowrap;flex-shrink:0;margin-left:4px;border:.5px solid var(--bd);align-self:center;box-sizing:border-box;font-family:var(--fn);font-weight:500';
    var tog = document.getElementById('theme-toggle');
    if(tog && tog.parentNode) tog.parentNode.insertBefore(span, tog);
    else wrap.appendChild(span);
  })();

  /* ── Read-only mode: mark non-primary devices ── */
  (function(){
    if(localStorage.getItem('erin_primary_device') === '1') return;
    // Add class to <html> so CSS can hide all edit controls
    document.documentElement.classList.add('erin-readonly');
    // Insert a soft banner below the nav so it's clear this is view-only.
    // All visual styling is inline here so no external CSS can left-align it.
    var banner = document.createElement('div');
    banner.id = 'erin-readonly-banner';
    banner.className = 'erin-readonly-banner';
    banner.style.cssText = [
      'display:block',
      'width:100%',
      'box-sizing:border-box',
      'text-align:center',
      'font-size:12.5px',
      'font-weight:400',
      'font-family:var(--fn)',
      'color:var(--amber-t)',
      'background:var(--amber-bg)',
      'padding:3px 1rem',
      'border-bottom:.5px solid var(--bd)',
      'line-height:1.3',
      'margin:0',
      'position:relative',
      'left:0',
      'right:0'
    ].join(';') + ';';
    banner.innerHTML = '&#128065;&nbsp;<strong>View-only</strong> &mdash; marks are session-only (refresh resets them).';
    var nav = document.querySelector('.global-nav');
    if(nav && nav.parentNode) nav.parentNode.insertBefore(banner, nav.nextSibling);
    else document.body.insertBefore(banner, document.body.firstChild);
  })();

});
