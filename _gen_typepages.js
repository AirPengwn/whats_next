/* ─────────────────────────────────────────────────────────────────────
   _gen_typepages.js — generate the 4 lean, data-driven per-type Browse
   pages from proven parts. Reuses: original global-nav + theme script
   (pristine backup), the canonical PRIMARY-GATED save block, the verified
   engine (extracted from mockup_programs.html), and the engine CSS.
   Overwrites erin_programs/internships/jobs/service.html (originals are
   preserved in .overhaul_backup/). Run: node _gen_typepages.js
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');

const NAV   = fs.readFileSync('_nav_block.txt', 'utf8').trim();
const THEME = fs.readFileSync('_theme_block.txt', 'utf8').trim();
const MLRAW = fs.readFileSync('_ml_block.txt', 'utf8').trim();      // <script>…</script>
/* IMPORTANT: _engine_css.txt ends with the stylesheet's @media print
   hide-list (".global-nav, button, … {display:none!important}"). Cutting
   at the first @media drops that entire block — keeping it (even without
   the @media wrapper) would globally hide the nav and ALL buttons. */
let CSS = fs.readFileSync('_engine_css.txt', 'utf8').split('@media')[0]
            .split('\n').filter(l => l && !/^\/\*EXTRACTED/.test(l)).join('\n');
if (/display:\s*none\s*!important/.test(CSS) || /\.global-nav|\bbutton\b\s*[,{]/.test(CSS)) {
  console.error('✗ refusing: engine CSS still contains a global hide/nav-button rule'); process.exit(1);
}

/* verified engine source (snapshot of the reviewed mockup engine) */
const MK = fs.readFileSync('_engine_src.txt', 'utf8');
const engStart = MK.indexOf('/* ════════ MOCKUP');
const engOpen  = MK.indexOf('(function(){', engStart);
const engClose = MK.indexOf('})();', MK.lastIndexOf('try{ renderBrowse=renderBrowseX;') > -1
                 ? MK.lastIndexOf('try{ renderBrowse=renderBrowseX;') : engOpen);
let body = MK.slice(engOpen + '(function(){'.length, MK.indexOf('})();', MK.indexOf('function mkInit')));
// CRITICAL: remove the mockup cloud-write stub so real primary-gated
// save (window.ML.push) is NOT neutralised on the live pages.
body = body.replace(/try\{\s*push=function\(\)\{\};[\s\S]*?\}catch\(e\)\{\}/, '');
// strip the mockup init (banner/setMode/timeout) and the renderBrowse reassignment
body = body.replace(/try\{ renderBrowse=renderBrowseX;[\s\S]*$/,'');
if (/push=function\(\)\{\}/.test(body) || /MOCKUP/.test(body)) {
  console.error('✗ refusing: stub/mockup residue still in engine body'); process.exit(1);
}
// LOCK_TYPE becomes a placeholder
body = body.replace(/var LOCK_TYPE='Graduate';[^\n]*/, "var LOCK_TYPE='__LOCK__';");

const ENGINE =
`<script>
(function(){
/* lean per-type Browse page — data-driven, primary-gated save reused */
function el(tag,cls,txt){ var e=document.createElement(tag); if(cls)e.className=cls; if(txt!=null)e.textContent=txt; return e; }
function payload(it){ return {title:it.title,org:it.org,type:it.type,cat:it.cat,src:it.src,
  src_label:it.src_label,deadline:it.deadline||'',start:it.start||'',body:it.body||'',
  desc:it.desc||'',badge:it.badge||'',pills:it.pills||[],id:it.id}; }
function has(id){ return !!(window.ML&&ML.isSaved(id)); }
function addItem(it){ if(window.ML) ML.save(payload(it)); }
function delItem(id){ if(window.ML) ML.remove(id); }
function renderBrowse(){ renderBrowseX(); }
${body.trim()}
function init(){
  var s=document.getElementById('bs'); if(s) s.addEventListener('input',renderBrowseX);
  renderBrowseX();
  if(window.ML&&ML.update) ML.update();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
else init();
})();
</script>`;

function page(title, headerTitle, sub, lock){
  const eng = ENGINE.replace("'__LOCK__'", lock ? "'"+lock+"'" : 'null');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>/*theme-preset*/(function(){try{var s=localStorage.getItem('erin_theme');if(s==='dark'||(!s&&window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark');}catch(e){}})();</script>
<link rel="stylesheet" href="styles.css?v=20260518e">
<title>${title}</title>
<style>
body{font-family:var(--fn);color:var(--t1);background:var(--bg3);line-height:1.6;padding:0 0 2rem}
.page-header{padding:1.5rem 0 1.1rem;border-bottom:.5px solid var(--bd);margin-bottom:1.25rem}
.page-header-eyebrow{font-size:11px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--teal-t);margin-bottom:.25rem}
.page-header-title{font-size:24px;font-weight:700;color:var(--t1);line-height:1.2;letter-spacing:-.02em;margin-bottom:.2rem}
.page-header-sub{font-size:13px;color:var(--t2);line-height:1.5}
.footer{font-size:12px;color:var(--t3);text-align:center;margin-top:1.5rem;padding-bottom:1.5rem}
${CSS}
.bx-fgroup{display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin:.15rem 0}
.bx-flabel{font-size:10px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--t3);min-width:62px}
.bx-chip{font-size:12px;padding:3px 11px;border-radius:999px;border:.5px solid var(--bds);background:transparent;color:var(--t2);cursor:pointer;font-family:var(--fn)}
.bx-chip.on{background:var(--teal);color:#fff;border-color:var(--teal);font-weight:600}
.bx-chip:not(.on):hover{background:var(--bg2);color:var(--t1)}
.bx-sec{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--t3);margin:1rem 0 .5rem;display:flex;align-items:center;gap:8px}
.bx-sec .n{background:var(--bg2);color:var(--t2);border-radius:999px;padding:1px 8px;font-size:11px}
.bx-saved{font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:var(--teal-bg);color:var(--teal-t);white-space:nowrap}
.bx-new{font-size:10px;font-weight:800;padding:2px 9px;border-radius:999px;background:#d63a1f;color:#fff;white-space:nowrap;letter-spacing:.04em;box-shadow:0 0 0 2px rgba(214,58,31,.2)}
html.dark .bx-new{background:#ff5a3c;color:#1a1a1a}
.browse-card.is-new{border-left:3px solid #d63a1f}
.bx-ni-badge{font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;background:var(--bg2);color:var(--t3);border:.5px solid var(--bd);white-space:nowrap}
.bx-ni-btn{font-size:11px;font-weight:600;color:var(--red-t);background:var(--red-bg);border:1px solid var(--red);padding:4px 12px;border-radius:999px;cursor:pointer;font-family:var(--fn);white-space:nowrap}
.bx-ni-btn:hover{background:var(--red);color:#fff}
.bx-ni-btn.on{background:var(--red);color:#fff}
.browse-card.is-ni{opacity:.7}
.browse-card.is-ni:hover{opacity:1}
.bx-urg{font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;white-space:nowrap}
.u0{background:var(--red-bg);color:#993c1d}.u1{background:var(--amber-bg);color:var(--amber-t)}
.u2{background:var(--teal-bg);color:var(--teal-t)}.u3{background:var(--blue-bg);color:var(--blue)}
.u4{background:var(--bg2);color:var(--t3)}.u5{background:var(--bg2);color:var(--t3)}
.bx-fwrap{display:flex;flex-direction:column;gap:2px;width:100%}
</style>
${THEME}
<script src="site.js?v=20260518e"></script>
</head>
<body>
${NAV}
<div class="page">
<div class="page-header">
  <div class="page-header-eyebrow">What&rsquo;s Next for Erin</div>
  <div class="page-header-title">${headerTitle}</div>
  <div class="page-header-sub">${sub}</div>
</div>
<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem;flex-wrap:wrap">
  <input id="bs" type="search" class="search-input" placeholder="Search ${headerTitle.toLowerCase()}…" style="flex:1;margin-bottom:0">
  <div id="browse-filters" style="display:flex;gap:4px;flex-wrap:wrap"></div>
</div>
<div id="browse-body"></div>
<p class="footer">Live opportunities, sorted by urgency. Saving is gated to Erin&rsquo;s primary device.<br><br><a href="index.html" style="color:var(--blue)">&#8592; Back to home</a></p>
</div>
<script src="opportunities.js"></script>
${MLRAW}
${eng}
</body>
</html>
`;
}

const PAGES = [
  ['erin_programs.html',    'Funded Graduate Programs — What’s Next for Erin', 'Funded Graduate Programs', 'Current &amp; next-cycle MS/PhD positions — sorted by urgency; filter by status, cycle, fit.', 'Graduate'],
  ['erin_internships.html', 'Internships — What’s Next for Erin',              'Internships',              'Current &amp; next-cycle internships — sorted by urgency; filter by status, cycle, fit.', 'Internship'],
  ['erin_jobs.html',        'Career Positions — What’s Next for Erin',          'Career Positions',         'Entry-level environmental & conservation roles — sorted by urgency; filter by sector, status, fit.', 'Career'],
  ['erin_service.html',     'Service & Fellowships — What’s Next for Erin',     'Service &amp; Fellowships','AmeriCorps & conservation-corps service — sorted by urgency; filter by program, status, fit.', 'Service'],
];

PAGES.forEach(function(p){
  const [file, title, hdr, sub, lock] = p;
  const bkp = '.overhaul_backup/' + file.replace('.html', '.PRE_TYPEPAGE.html');
  if (!fs.existsSync(bkp)) fs.copyFileSync(file, bkp); // never clobber an existing backup
  fs.writeFileSync(file, page(title, hdr, sub, lock), { encoding: 'utf8' });
  console.log('wrote ' + file + '  (lock=' + lock + ')  ' + fs.statSync(file).size + ' bytes');
});
console.log('done. originals preserved in .overhaul_backup/ (PRE_TYPEPAGE + the pristine overhaul backup).');
