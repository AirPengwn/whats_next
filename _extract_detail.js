/* ─────────────────────────────────────────────────────────────────────
   _extract_detail.js — ONE-TIME: lift the FULL detail of every frozen
   Browse card into opportunities.data.json (structured, additive).
   The pages stay the verbatim/golden source of truth; this only ADDS
   structured fields to the cabinet. Never mutates/deletes existing keys
   (only fills empty ones or adds new keys). Diagnose by default;
   --write emits opportunities.data.enriched.json (NOT the live file).
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');
const WRITE = process.argv.includes('--write');

const PAGES = JSON.parse(fs.readFileSync('browse.pages.json', 'utf8'));
const CAB = JSON.parse(fs.readFileSync('opportunities.data.json', 'utf8'));
const byId = {}; CAB.forEach(e => byId[e.id] = e);

/* entity decode for clean text (keep it conservative & reversible-safe) */
const NAMED = { amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ', mdash:'—',
  ndash:'–', rsquo:'’', lsquo:'‘', rdquo:'”', ldquo:'“', hellip:'…', middot:'·',
  times:'×', deg:'°', eacute:'é', uuml:'ü', ouml:'ö', auml:'ä', ampersand:'&' };
function decode(s){
  return String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in NAMED ? NAMED[n.toLowerCase()] : m));
}
const stripTags = h => decode(String(h).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());

/* Split a region into per-card segments at each ml-save-btn. The content
   PRECEDING a button is that card's record — uniform across all wrappers
   (class-based / inline-styled / featured), all 88 buttons. */
function segments(region){
  const btn = [...region.matchAll(/<button class="ml-save-btn"\s+data-id="([^"]+)"/g)];
  const segs = [];
  for (let i = 0; i < btn.length; i++){
    const start = i === 0 ? 0 : region.indexOf('</button>', btn[i - 1].index) + 9;
    const end = btn[i].index;
    segs.push({ id: btn[i][1], html: region.slice(start < 0 ? btn[i - 1].index : start, end), raw: region.slice(start < 0 ? btn[i - 1].index : start, region.indexOf('</button>', btn[i].index) + 9) });
  }
  return segs;
}

/* parse one card segment into structured detail */
function parseCard(html){
  const ids = [...html.matchAll(/class="ml-save-btn"\s+data-id="([^"]+)"/g)].map(x => x[1]);
  // body: first .pb2 / .pos-body / .pos-body? else first big text block
  const bodyM = html.match(/<div class="(?:pb2|pos-body)[^"]*">([\s\S]*?)<\/div>/);
  let desc = bodyM ? stripTags(bodyM[1]) : '';
  if (!desc) {
    // bespoke featured cards: body is an inline-styled div. Pick the
    // longest prose-like block (sentence text, not pills/meta rows).
    let best = '';
    for (const m of html.matchAll(/<div[^>]*>([\s\S]*?)<\/div>/g)) {
      const t = stripTags(m[1]);
      if (t.length > 140 && /[a-z]\.\s|[a-z], / .test(t) && t.split(' ').length > 18 && t.length > best.length) best = t;
    }
    desc = best;
  }
  // links: anchors inside .slinks / .pos-links
  const links = [];
  const linkZone = [...html.matchAll(/<div class="(?:slinks|pos-links)[^"]*">([\s\S]*?)<\/div>/g)].map(x => x[1]).join(' ');
  [...linkZone.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].forEach(a =>
    links.push({ href: a[1], label: stripTags(a[2]) }));
  // also primary external "View posting"/url anchors anywhere in card
  [...html.matchAll(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].forEach(a => {
    const lbl = stripTags(a[2]);
    if (lbl && !links.some(l => l.href === a[1]) && !/save to my list/i.test(lbl)) links.push({ href: a[1], label: lbl });
  });
  // more-panel structured blocks
  const mp = html.match(/<div class="more-panel"[^>]*>([\s\S]*?)<\/div>\s*(?:<button class="ml-save-btn"|<\/div>\s*<\/div>|$)/);
  const detail = [];
  if (mp){
    const inner = mp[1];
    const re = /<h4[^>]*>([\s\S]*?)<\/h4>|<p[^>]*>([\s\S]*?)<\/p>|<div class="detail-row"[^>]*><span class="detail-label">([\s\S]*?)<\/span>([\s\S]*?)<\/div>|<div class="contact-block"[^>]*>([\s\S]*?)<\/div>/g;
    let x;
    while ((x = re.exec(inner))){
      if (x[1] != null) detail.push({ t: 'h', v: stripTags(x[1]) });
      else if (x[2] != null) detail.push({ t: 'p', v: stripTags(x[2]) });
      else if (x[3] != null) detail.push({ t: 'row', label: stripTags(x[3]), value: stripTags(x[4]) });
      else if (x[5] != null) detail.push({ t: 'contact', v: stripTags(x[5]) });
    }
  }
  // inline meta line (deadline/start/funding)
  const metaM = html.match(/<div style="font-size:1[12]px;color:var\(--t2\)[^"]*">([\s\S]*?)<\/div>/);
  const metaLine = metaM ? stripTags(metaM[1]) : '';
  // status badge
  const stM = html.match(/<span class="status-badge (s-[a-z]+)"[^>]*>([\s\S]*?)<\/span>/);
  const status = stM ? { kind: stM[1], label: stripTags(stM[2]) } : null;
  return { ids, desc, links, detail, metaLine, status };
}

/* iso-ish date parse from a human deadline string (confident only) */
const MON = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
function deadlineDate(s){
  if (!s) return null;
  let m = String(s).match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:,)?\s*(\d{4})/i);
  if (m) return `${m[3]}-${String(MON[m[1].toLowerCase()]).padStart(2,'0')}-${String(+m[2]).padStart(2,'0')}`;
  m = String(s).match(/(\d{4})-(\d{2})-(\d{2})/); if (m) return m[0];
  return null;
}

/* walk pages → build extracted map by id */
const ext = {};
let cardCount = 0, noId = 0;
for (const pg of PAGES){
  const txt = fs.readFileSync(pg.file, 'utf8');
  const cycle = /_next\.html$/.test(pg.file) ? 'next' : 'current';
  for (const r of pg.regions){
    const s = txt.indexOf(`<!--${r.marker}:start-->`) + `<!--${r.marker}:start-->`.length;
    const e = txt.indexOf(`<!--${r.marker}:end-->`);
    if (s < 0 || e < 0) continue;
    const segs = segments(txt.slice(s, e)).map(sg => ({ id: sg.id, p: parseCard(sg.html + '<button class="ml-save-btn" data-id="' + sg.id + '">') }));
    // dual-button cards: a "thin" segment (no body, just closing tags)
    // belongs to the same card as the adjacent rich one → inherit it.
    segs.forEach((sg, i) => {
      if (!sg.p.desc && !sg.p.detail.length && i > 0 && segs[i - 1].p.desc) {
        sg.p = { ...segs[i - 1].p, ids: sg.p.ids };
      }
    });
    segs.forEach(sg => {
      cardCount++;
      ext[sg.id] = { ...sg.p, page: pg.file, cycle };
    });
  }
}

/* merge plan (additive only) */
const plan = { fill: [], add: [], missingCardForId: [], idsNotInCab: [] };
const seen = {};
for (const id in ext){
  seen[id] = 1;
  const c = byId[id], x = ext[id];
  if (!c){ plan.idsNotInCab.push(id); continue; }
  const adds = [];
  if (x.desc && (!c.desc) ) adds.push('desc(' + x.desc.length + 'ch)');
  if (x.links.length && !(c.links && c.links.length)) adds.push('links(' + x.links.length + ')');
  if (x.detail.length && !(c.detail && c.detail.length)) adds.push('detail(' + x.detail.length + ')');
  if (x.metaLine && !c.metaLine) adds.push('metaLine');
  if (x.status && !c.status) adds.push('status');
  if (!c.cycle) adds.push('cycle=' + x.cycle);
  const dd = deadlineDate(c.deadline);
  if (dd && !c.deadline_date) adds.push('deadline_date=' + dd);
  if (adds.length) plan.add.push(id + ': +' + adds.join(', '));
}
for (const e of CAB) if (!seen[e.id]) plan.missingCardForId.push(e.id);

console.log('Pages scanned:', PAGES.length, ' card chunks:', cardCount, ' chunks w/o id (editorial, skipped):', noId);
console.log('Cabinet records:', CAB.length, ' records with an extracted card:', Object.keys(seen).length);
console.log('IDs in a card but NOT in cabinet:', plan.idsNotInCab.length, plan.idsNotInCab.join(',') || '(none)');
console.log('Cabinet IDs with NO card found (will keep as-is):', plan.missingCardForId.length, plan.missingCardForId.join(',') || '(none)');
console.log('\nSample enrichment (first 6):');
plan.add.slice(0, 6).forEach(l => console.log('  ' + l));
console.log('... total records that would gain fields:', plan.add.length);

if (WRITE){
  const out = CAB.map(e => {
    const x = ext[e.id];
    if (!x) return e;
    const n = { ...e };
    if (x.desc && !n.desc) n.desc = x.desc;
    if (x.links.length && !(n.links && n.links.length)) n.links = x.links;
    if (x.detail.length && !(n.detail && n.detail.length)) n.detail = x.detail;
    if (x.metaLine && !n.metaLine) n.metaLine = x.metaLine;
    if (x.status && !n.status) n.status = x.status;
    if (!n.cycle) n.cycle = x.cycle;
    const dd = deadlineDate(n.deadline);
    if (dd && !n.deadline_date) n.deadline_date = dd;
    return n;
  });
  fs.writeFileSync('opportunities.data.enriched.json', JSON.stringify(out, null, 2), { encoding: 'utf8' });
  console.log('\n✓ WROTE opportunities.data.enriched.json (NOT the live cabinet) for verification.');
}
