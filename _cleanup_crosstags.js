/* ─────────────────────────────────────────────────────────────────────
   _cleanup_crosstags.js — focused pass on 8 records whose URLs were
   mis-tagged (URLs from a DIFFERENT record's org). Fixes data-quality
   gaps surfaced in the v2.22 verification sweep.
   Run: node _cleanup_crosstags.js
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');

const FILE = 'opportunities.data.json';
const raw  = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);

function find(id){ return data.find(it => it.id === id); }

const log = [];

/* ── item-011: CU Boulder — INSTAAR / Environmental Studies ──
   Remove UWyo and CSU links; keep only CU links. */
(function(){
  const r = find('item-011'); if(!r) return;
  r.url = 'https://www.colorado.edu/instaar/';
  r.url_label = 'CU Boulder INSTAAR';
  r.links = [
    { href: 'https://www.colorado.edu/instaar/', label: '🔗 CU Boulder INSTAAR' },
    { href: 'https://www.colorado.edu/envs/graduate-studies/graduate-programs', label: '🔗 CU Boulder ENVS — Graduate Programs' },
    { href: 'https://www.colorado.edu/instaar/people', label: '🔗 INSTAAR — People' }
  ];
  log.push('item-011: replaced url + collapsed links to 3 CU-only entries (removed 1 UWyo + 2 CSU + 1 UWyo-Google search)');
})();

/* ── item-013: University of Montana — Environmental Studies ──
   Remove MSU links; keep only UM Env Studies + WICHE. */
(function(){
  const r = find('item-013'); if(!r) return;
  r.url = 'https://www.umt.edu/environmental-studies/graduate/';
  r.url_label = 'UM Environmental Studies — Graduate';
  r.links = [
    { href: 'https://www.umt.edu/environmental-studies/graduate/', label: '🔗 UM Environmental Studies — Graduate' },
    { href: 'https://www.wiche.edu/tuition-savings/wrgp/', label: '🔗 WICHE WRGP tuition info' },
    { href: 'https://www.umt.edu/environmental-studies/people/', label: '🔗 UM Environmental Studies — Faculty & Staff' }
  ];
  log.push('item-013: replaced url + collapsed links to 3 UM-only entries (removed 2 MSU references)');
})();

/* ── item-025: KCI Technologies — Natural Resources Intern (Nashville TN) ──
   Currently all 4 URLs point to ERO Resources — wrong org entirely. */
(function(){
  const r = find('item-025'); if(!r) return;
  r.url = 'https://www.kci.com/careers/';
  r.url_label = 'KCI Technologies careers';
  delete r.url2; delete r.url2_label;
  r.links = [
    { href: 'https://www.kci.com/careers/', label: '🔗 KCI Technologies careers' }
  ];
  log.push('item-025: replaced ALL 4 ERO Resources URLs with KCI Technologies careers (correct org)');
})();

/* ── item-026: Earthjustice Science Intern Fall 2026 ──
   Remove the two KCI links (wrong-org) from links[0-1]; keep Earthjustice [2-3]. */
(function(){
  const r = find('item-026'); if(!r) return;
  /* Filter links to keep only earthjustice.org / jobvite Earthjustice entries */
  r.links = (r.links || []).filter(l => /earthjustice|jobvite\.com\/earthjustice/i.test(l.href||''));
  /* Promote first Earthjustice link to url field if not set */
  if(!r.url && r.links[0]){
    r.url = r.links[0].href;
    r.url_label = r.links[0].label.replace(/^🔗\s*/, '');
  }
  log.push('item-026: dropped 2 wrong-org KCI links (kept '+r.links.length+' Earthjustice entries)');
})();

/* ── item-082: WSSI Raleigh — links[0] is Wildlands Engineering. Drop wrong link. ── */
(function(){
  const r = find('item-082'); if(!r) return;
  r.links = (r.links || []).filter(l => !/wildlandseng/i.test(l.href||''));
  /* Ensure WSSI link present */
  if(!r.links.some(l => /wetlands\.com/i.test(l.href||''))){
    r.links.push({ href: 'https://www.wetlands.com/careers/current-openings/', label: '🔗 WSSI current openings' });
  }
  log.push('item-082: dropped wrong-org Wildlands Engineering link');
})();

/* ── item-083: RES — links[0] was WSSI. Replace with RES open-positions. ── */
(function(){
  const r = find('item-083'); if(!r) return;
  r.links = [
    { href: 'https://res.us/home/people/open-positions/', label: '🔗 RES — Open Positions' }
  ];
  r.url = 'https://res.us/home/people/open-positions/';
  r.url_label = 'RES — Open Positions';
  log.push('item-083: replaced WSSI link with RES open-positions deep link');
})();

/* ── item-084: RK&K — links[0] was RES. Replace with RK&K ADP careers portal. ── */
(function(){
  const r = find('item-084'); if(!r) return;
  r.links = [
    { href: 'https://myjobs.adp.com/rkkcareers', label: '🔗 RK&K — All Openings (ADP portal)' }
  ];
  r.url = 'https://www.rkk.com/careers/';
  r.url_label = 'RK&K Engineering careers';
  log.push('item-084: replaced wrong-org RES link with RK&K ADP portal');
})();

/* ── item-086: Geosyntec — already clean from v2.22, double-check ── */
(function(){
  const r = find('item-086'); if(!r) return;
  /* Verify nothing AECOM remains */
  const hadAecom = (r.links||[]).some(l => /aecom\.com/i.test(l.href||''));
  if(hadAecom){
    r.links = (r.links || []).filter(l => !/aecom\.com/i.test(l.href||''));
    if(!r.links.some(l => /geosyntec/i.test(l.href||''))){
      r.links.push({ href: 'https://geosyntec.com/careers', label: '🔗 Geosyntec Careers' });
    }
    log.push('item-086: removed residual AECOM link');
  } else {
    log.push('item-086: already clean (no-op)');
  }
})();

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + (raw.endsWith('\n')?'\n':''), { encoding: 'utf8' });

console.log('\n=== CROSS-TAG CLEANUP COMPLETE ===');
log.forEach(l => console.log('  ' + l));
console.log('\nTotal records: ' + data.length);
console.log('Next: node build.js');
