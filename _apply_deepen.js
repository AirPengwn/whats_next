/* ─────────────────────────────────────────────────────────────────────
   _apply_deepen.js — apply URL-deepening updates from all 4 agent
   verification chunks. Matches by (id, current_href) so field-name
   drift (url vs links[N]) doesn't matter — we just find the URL and
   replace it wherever it appears on that record.
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');

const FILE = 'opportunities.data.json';
const raw  = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);

/* Load all 4 deepening result files */
const allUpdates = [];
[1, 2, 3, 4].forEach(n => {
  const result = JSON.parse(fs.readFileSync('./_deepen_result_' + n + '.json', 'utf8'));
  (result.updates || []).forEach(u => {
    if(u.action === 'replace' && u.new_href){
      allUpdates.push({ ...u, chunk: n });
    }
  });
});
console.log('Loaded ' + allUpdates.length + ' replacement updates from 4 chunks');

/* De-duplicate: same (id, current_href, new_href) tuple → keep first */
const seen = new Set();
const dedup = [];
allUpdates.forEach(u => {
  const key = u.id + '|' + u.current_href + '|' + u.new_href;
  if(!seen.has(key)){ seen.add(key); dedup.push(u); }
});
console.log('After de-dup: ' + dedup.length + ' unique updates');

/* Apply each update by matching the current_href on the record */
let appliedFields = 0;
let recordsTouched = new Set();
let notFound = 0;

dedup.forEach(u => {
  const rec = data.find(r => r.id === u.id);
  if(!rec){ console.error('  ! record not found: ' + u.id); notFound++; return; }
  let touched = false;
  /* Try links[] first (most common) */
  (rec.links || []).forEach(l => {
    if(l && l.href === u.current_href){
      l.href = u.new_href;
      if(u.new_label) l.label = '🔗 ' + u.new_label;
      touched = true;
      appliedFields++;
    }
  });
  /* Try url field */
  if(rec.url === u.current_href){
    rec.url = u.new_href;
    if(u.new_label) rec.url_label = u.new_label;
    touched = true;
    appliedFields++;
  }
  /* Try url2 field */
  if(rec.url2 === u.current_href){
    rec.url2 = u.new_href;
    if(u.new_label) rec.url2_label = u.new_label;
    touched = true;
    appliedFields++;
  }
  /* Try src field (when external) */
  if(rec.src === u.current_href){
    rec.src = u.new_href;
    if(u.new_label) rec.src_label = u.new_label;
    touched = true;
    appliedFields++;
  }
  if(touched) recordsTouched.add(u.id);
});

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + (raw.endsWith('\n')?'\n':''), { encoding: 'utf8' });

console.log('\n=== APPLIED ===');
console.log('  URL fields updated:  ' + appliedFields);
console.log('  Records touched:     ' + recordsTouched.size);
console.log('  Updates not matched: ' + (dedup.length - appliedFields > 0 ? '(some updates ran multiple times on same URL)' : 'none'));
console.log('  Records-not-found:   ' + notFound);
console.log('\nTotal records: ' + data.length);
console.log('Next: node build.js');
