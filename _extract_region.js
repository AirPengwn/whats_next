/* ─────────────────────────────────────────────────────────────────────
   _extract_region.js — ONE-TIME additive: add `region` to every record
   (one of 8 buckets) from org/location/desc. Additive only: never mutates
   other keys. Diagnose by default; --write emits
   opportunities.data.region.json (NOT the live file).
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');
const WRITE = process.argv.includes('--write');
const CAB = JSON.parse(fs.readFileSync('opportunities.data.json', 'utf8'));

/* state → region */
const R = {
  'Southeast & Appalachia': ['NC','SC','GA','FL','AL','MS','TN','KY','VA','WV','AR','LA'],
  'Northeast': ['ME','NH','VT','MA','RI','CT','NY','NJ','PA','MD','DE','DC'],
  'Midwest & Great Plains': ['OH','MI','IN','IL','WI','MN','IA','MO','ND','SD','NE','KS'],
  'Mountain West': ['MT','ID','WY','CO','UT','NV'],
  'Southwest': ['AZ','NM','TX','OK'],
  'West Coast / Pacific': ['CA','OR','WA'],
  'Alaska, Hawaii & Territories': ['AK','HI','PR','GU','VI']
};
const STATE2REG = {};
Object.keys(R).forEach(function (reg) { R[reg].forEach(function (s) { STATE2REG[s] = reg; }); });
const NAME2REG = {
  'north carolina':'Southeast & Appalachia','south carolina':'Southeast & Appalachia','georgia':'Southeast & Appalachia',
  'florida':'Southeast & Appalachia','alabama':'Southeast & Appalachia','mississippi':'Southeast & Appalachia',
  'tennessee':'Southeast & Appalachia','kentucky':'Southeast & Appalachia','virginia':'Southeast & Appalachia',
  'west virginia':'Southeast & Appalachia','arkansas':'Southeast & Appalachia','louisiana':'Southeast & Appalachia',
  'appalachia':'Southeast & Appalachia','appalachian':'Southeast & Appalachia','southeast':'Southeast & Appalachia',
  'maine':'Northeast','new hampshire':'Northeast','vermont':'Northeast','massachusetts':'Northeast',
  'rhode island':'Northeast','connecticut':'Northeast','new york':'Northeast','new jersey':'Northeast',
  'pennsylvania':'Northeast','maryland':'Northeast','delaware':'Northeast','new england':'Northeast',
  'ohio':'Midwest & Great Plains','michigan':'Midwest & Great Plains','indiana':'Midwest & Great Plains',
  'illinois':'Midwest & Great Plains','wisconsin':'Midwest & Great Plains','minnesota':'Midwest & Great Plains',
  'iowa':'Midwest & Great Plains','missouri':'Midwest & Great Plains','north dakota':'Midwest & Great Plains',
  'south dakota':'Midwest & Great Plains','nebraska':'Midwest & Great Plains','kansas':'Midwest & Great Plains',
  'midwest':'Midwest & Great Plains','great plains':'Midwest & Great Plains','prairie pothole':'Midwest & Great Plains',
  'montana':'Mountain West','idaho':'Mountain West','wyoming':'Mountain West','colorado':'Mountain West',
  'utah':'Mountain West','nevada':'Mountain West','mountain west':'Mountain West','rockies':'Mountain West','rocky mountain':'Mountain West',
  'arizona':'Southwest','new mexico':'Southwest','texas':'Southwest','oklahoma':'Southwest','southwest':'Southwest',
  'california':'West Coast / Pacific','oregon':'West Coast / Pacific','washington':'West Coast / Pacific',
  'pacific northwest':'West Coast / Pacific','west coast':'West Coast / Pacific',
  'alaska':'Alaska, Hawaii & Territories','hawaii':'Alaska, Hawaii & Territories','puerto rico':'Alaska, Hawaii & Territories'
};
const NAT = /\b(remote|nationwide|national(?!\s+park)|multiple (sites|states|locations)|various locations|anywhere in the (us|country)|fully remote|telework)\b/i;

function regionsIn(text) {
  var found = {};
  var rx = /[,(]\s*([A-Z]{2})\b|\b([A-Z]{2})\s*[·)]/g, m;
  while ((m = rx.exec(text))) { var ab = m[1] || m[2]; if (STATE2REG[ab]) found[STATE2REG[ab]] = 1; }
  var low = text.toLowerCase();
  Object.keys(NAME2REG).forEach(function (n) {
    if (new RegExp('\\b' + n.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b').test(low)) found[NAME2REG[n]] = 1;
  });
  return Object.keys(found);
}
function classify(e) {
  // 1) Institution location wins (org/location/title/meta)
  var loc = regionsIn([e.org, e.location, e.title, e.metaLine].filter(Boolean).join(' | '));
  if (loc.length === 1) return loc[0];
  if (loc.length > 1) return 'National / Remote / Multiple';
  // 2) No location signal → look at the description
  var d = regionsIn(String(e.desc || e.body || ''));
  if (d.length === 1) return d[0];
  if (d.length > 1) return 'National / Remote / Multiple';
  // 3) explicit remote/national wording, else catch-all
  return 'National / Remote / Multiple';
}

var tally = {}, mutated = 0;
const out = CAB.map(function (e, i) {
  var reg = classify(e);
  tally[reg] = (tally[reg] || 0) + 1;
  var n = Object.assign({}, e);
  if (!n.region) n.region = reg;
  return n;
});
for (var i = 0; i < CAB.length; i++) {
  var a = CAB[i], b = out[i];
  if (a.id !== b.id) { mutated = -1; break; }
  Object.keys(a).forEach(function (k) { if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) mutated++; });
}
console.log('records:', CAB.length);
console.log('region tally:', JSON.stringify(tally, null, 1));
console.log('original/other keys mutated (must be 0):', mutated);
console.log('\nsamples:');
['item-074','item-000','item-045','item-030','item-039','item-016','item-050','item-080'].forEach(function (id) {
  var e = out.find(function (x) { return x.id === id; }); if (!e) return;
  console.log('  ' + id + '  region=' + e.region + '  org="' + (e.org || '').slice(0, 50) + '"');
});
if (WRITE && mutated === 0) {
  fs.writeFileSync('opportunities.data.region.json', JSON.stringify(out, null, 2), { encoding: 'utf8' });
  console.log('\n✓ WROTE opportunities.data.region.json (NOT live) for verification.');
} else if (WRITE) { console.error('\n✗ refused: additive-only check failed'); process.exit(1); }
