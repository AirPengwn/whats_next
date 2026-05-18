/* ─────────────────────────────────────────────────────────────────────
   _extract_browse.js  —  ONE-TIME migration helper (not part of build).
   Model: "chrome-gap regions, verbatim." A managed card region is the
   maximal span between two HARD chrome separators that contains at least
   one ml-save-btn. Hard separators are unique single-line openers that
   never occur inside an opportunity card — so NO div-balancing is needed.
   Regions are captured/re-emitted byte-for-byte (provably lossless /
   pixel-identical). build.js only ever APPENDS new sweep cards before a
   region's end marker; existing bytes are never reparsed or changed.
   Usage:  node _extract_browse.js <file.html> [--write]
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');

const FILE = process.argv[2];
const WRITE = process.argv.includes('--write');
if (!FILE) { console.error('usage: node _extract_browse.js <file.html> [--write]'); process.exit(1); }
const src = fs.readFileSync(FILE, 'utf8');

/* Hard separator signatures. Each has a regex that matches its opener and
   a function giving the byte index just AFTER the separator element ends
   (so a region can start cleanly after it). All are single-level. */
const SEPS = [
  { name: 'page-header',  re: /<div class="page-header">/g,            after: closeDiv1 },
  { name: 'slabel',       re: /<div class="slabel">/g,                 after: closeDiv1 },
  { name: 'page-search',  re: /<div class="page-search-wrap"/g,        after: closeDiv1 },
  { name: 'tip',          re: /<div class="tip( tip-warn)?">/g,        after: closeDiv1 },
  { name: 'context-bnr',  re: /<div class="context-banner"/g,          after: closeDiv1 },
  { name: 'tabs',         re: /<div class="tabs">/g,                   after: closeDiv1 },
  { name: 'psec-open',    re: /<div id="tab-[a-z]+" class="psec[^"]*">/g, after: m => m.index + m[0].length },
  { name: 'hr',           re: /<hr>/g,                                 after: m => m.index + 4 },
  { name: 'footer',       re: /<p class="footer">/g,                   after: m => m.index },
];
/* index just past the FIRST </div> at-or-after the opener (single-level
   chrome elements: slabel/tip/page-header/etc. contain no nested div that
   would close before them in practice; verified by invariant checks). */
function closeDiv1(m) {
  const i = src.indexOf('</div>', m.index + m[0].length);
  return i === -1 ? src.length : i + 6;
}

/* Collect all separator hits in document order. */
let seps = [];
for (const S of SEPS) {
  S.re.lastIndex = 0;
  let m;
  while ((m = S.re.exec(src))) seps.push({ name: S.name, start: m.index, end: S.after(m) });
}
seps.sort((a, b) => a.start - b.start);

/* Region candidates = the gap AFTER each separator's end and BEFORE the
   next separator's start, when that gap contains an ml-save-btn. */
const regions = [];
for (let i = 0; i < seps.length; i++) {
  const gapS = seps[i].end;
  const gapE = i + 1 < seps.length ? seps[i + 1].start : src.length;
  if (gapS >= gapE) continue;
  const slice = src.slice(gapS, gapE);
  if (!/class="ml-save-btn"\s+data-id="/.test(slice)) continue; // real card, not the JS
  // trim leading/trailing whitespace-only so markers hug real content
  let s = gapS, e = gapE;
  while (s < e && /\s/.test(src[s])) s++;
  while (e > s && /\s/.test(src[e - 1])) e--;
  regions.push({ s, e, afterSep: seps[i].name, beforeSep: i + 1 < seps.length ? seps[i + 1].name : 'EOF' });
}

/* ── Invariant checks ──────────────────────────────────────────────── */
const allBtn = [...src.matchAll(/class="ml-save-btn"\s+data-id="/g)].map(m => m.index);
const inRegion = o => regions.some(r => o >= r.s && o < r.e);
const stranded = allBtn.filter(o => !inRegion(o));

// no HARD separator opener may appear strictly inside a region interior
const sepOpenRes = SEPS.map(S => S.re.source);
let chromeInside = 0, chromeWhere = [];
for (const r of regions) {
  const body = src.slice(r.s, r.e);
  for (const S of SEPS) {
    const rx = new RegExp(S.re.source, 'g');
    if (rx.test(body)) { chromeInside++; chromeWhere.push(`${S.name} in [${r.s}..${r.e}]`); }
  }
}

// reconstruction (verbatim slices) === original
let rebuilt = '', pos = 0;
for (const r of regions) { rebuilt += src.slice(pos, r.s) + src.slice(r.s, r.e); pos = r.e; }
rebuilt += src.slice(pos);

const ids = [];
regions.forEach(r => {
  const got = [...src.slice(r.s, r.e).matchAll(/class="ml-save-btn"\s+data-id="([^"]+)"/g)].map(x => x[1]);
  ids.push(got);
});

console.log('FILE:', FILE);
console.log('  regions:', regions.length, ' ml-save-btn:', allBtn.length);
regions.forEach((r, i) =>
  console.log(`  region ${i}: [${r.s}..${r.e}] len ${r.e - r.s}  after=${r.afterSep} before=${r.beforeSep}  ids=${ids[i].length}[${[...new Set(ids[i])].join(',')}]`));
console.log('  I1 reconstruction === original :', rebuilt === src);
console.log('  I2 every ml-save-btn in a region:', stranded.length === 0, stranded.length ? '(stranded ' + stranded.length + ')' : '');
console.log('  I3 no hard chrome inside region :', chromeInside === 0, chromeWhere.slice(0, 6).join(' | '));

if (WRITE) {
  if (rebuilt !== src || stranded.length || chromeInside) {
    console.error('  ✗ REFUSING --write: invariants not all green.'); process.exit(1);
  }
  const base = FILE.replace(/\.html$/, '');
  let out = '', p = 0;
  const pageRegions = [];
  regions.forEach((r, i) => {
    const marker = `BR:${base}:${i}`;
    out += src.slice(p, r.s);
    out += `<!--${marker}:start-->` + src.slice(r.s, r.e) + `<!--${marker}:end-->`;
    p = r.e;
    pageRegions.push({ marker, after: r.afterSep, before: r.beforeSep, ids: [...new Set(ids[i])] });
  });
  out += src.slice(p);
  fs.writeFileSync(FILE, out, { encoding: 'utf8' });
  fs.writeFileSync('_pageentry_' + base + '.json',
    JSON.stringify({ file: FILE, regions: pageRegions }, null, 2), { encoding: 'utf8' });
  console.log('  ✓ WROTE markers + _pageentry_' + base + '.json');
}
