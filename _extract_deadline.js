/* ─────────────────────────────────────────────────────────────────────
   _extract_deadline.js — ONE-TIME additive enrichment.
   Adds per record:  deadline_kind  ∈ {fixed, rolling, contact-first,
   passed, unknown}  and improves deadline_date (ISO, the next actionable
   date). Additive only: never mutates original/other keys; only fills
   deadline_date where absent and adds deadline_kind. Diagnose by default;
   --write emits opportunities.data.deadline.json (NOT the live file).
   "Today" = 2026-05-17 (project current date).
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');
const WRITE = process.argv.includes('--write');
const TODAY = '2026-05-17';

const CAB = JSON.parse(fs.readFileSync('opportunities.data.json', 'utf8'));
const MON = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };

/* collect every confident ISO date in a string */
function datesIn(s){
  if (!s) return [];
  s = String(s);
  const out = [];
  // ISO
  for (const m of s.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) out.push(`${m[1]}-${m[2]}-${m[3]}`);
  // Month DD, YYYY  /  Month DD YYYY
  for (const m of s.matchAll(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})\b/gi))
    out.push(`${m[3]}-${String(MON[m[1].slice(0,3).toLowerCase()]).padStart(2,'0')}-${String(+m[2]).padStart(2,'0')}`);
  // DD Month YYYY
  for (const m of s.matchAll(/\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*(\d{4})\b/gi))
    out.push(`${m[3]}-${String(MON[m[2].slice(0,3).toLowerCase()]).padStart(2,'0')}-${String(+m[1]).padStart(2,'0')}`);
  // Month YYYY (approx → 1st of month), incl. "~September 2026"
  for (const m of s.matchAll(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(\d{4})\b/gi)) {
    const iso = `${m[2]}-${String(MON[m[1].slice(0,3).toLowerCase()]).padStart(2,'0')}-01`;
    if (!out.includes(iso)) out.push(iso);
  }
  return [...new Set(out)].sort();
}

const RX_ROLL = /\b(rolling|continuous|open until filled|until filled|year-?round|ongoing|apply (immediately|now|any\s?time|when posted|as posted|asap)|accepted any\s?time|no deadline|currently recruiting|now (recruiting|accepting|hiring)|open\s*\/?\s*recruiting|open now|verified open|active posting|actively (recruiting|seeking|hiring)|accepting applications)\b/i;
const RX_CONTACT = /\binquire\b|\breach out\b|email .*(before|to apply|professors?|faculty)|varies by position|contact .*(dept|department|faculty|professor|advisor|lab|program|directly|first)|contact (faculty|professors?|the (dept|department|lab|advisor))|faculty-driven funding|only accepts .* funded|verify status|verify —|watch .* careers/i;
const RX_PASSED = /deadline passed|has passed|\bclosed\b|see next cycle|expired|no longer (open|accepting)/i;

function classify(e){
  const txt = [e.deadline, e.badge, e.status && e.status.label, e.metaLine, e.desc].filter(Boolean).join(' | ');
  const ds = datesIn([e.deadline, e.metaLine].filter(Boolean).join(' ; '));
  const upcoming = ds.filter(d => d >= TODAY);
  const past = ds.filter(d => d < TODAY);
  let kind, date = e.deadline_date || null;

  if (RX_PASSED.test(txt) && !upcoming.length) { kind = 'passed'; date = date || (past.length ? past[past.length-1] : null); }
  else if (upcoming.length)                    { kind = 'fixed';  date = date || upcoming[0]; }
  else if (RX_ROLL.test(txt))                  { kind = 'rolling'; }
  else if (past.length && !upcoming.length)    { kind = 'passed';  date = date || past[past.length-1]; }
  else if (RX_CONTACT.test(txt))               { kind = 'contact-first'; }
  else                                          { kind = 'unknown'; }
  return { kind, date };
}

const tally = {}, dateGain = [];
const out = CAB.map(e => {
  const { kind, date } = classify(e);
  tally[kind] = (tally[kind] || 0) + 1;
  const n = { ...e };
  if (!n.deadline_date && date) { n.deadline_date = date; dateGain.push(e.id); }
  n.deadline_kind = kind;
  return n;
});

/* strict additive-only check vs current cabinet */
let mutated = 0;
for (let i = 0; i < CAB.length; i++) {
  const a = CAB[i], b = out[i];
  if (a.id !== b.id) { mutated = -1; break; }
  for (const k of Object.keys(a)) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) mutated++;
}

console.log('records:', CAB.length);
console.log('deadline_kind tally:', JSON.stringify(tally));
console.log('deadline_date coverage:', out.filter(e => e.deadline_date).length + '/' + out.length,
            '(was ' + CAB.filter(e => e.deadline_date).length + ', +' + dateGain.length + ')');
console.log('original/other keys mutated (must be 0):', mutated);
console.log('\nsamples:');
['item-074','item-000','item-030','item-039','item-045','item-016','item-018'].forEach(id => {
  const e = out.find(x => x.id === id); if (!e) return;
  console.log(`  ${id}  kind=${e.deadline_kind}  date=${e.deadline_date||'-'}  deadline="${(e.deadline||'').slice(0,55)}"`);
});

if (WRITE && mutated === 0) {
  fs.writeFileSync('opportunities.data.deadline.json', JSON.stringify(out, null, 2), { encoding: 'utf8' });
  console.log('\n✓ WROTE opportunities.data.deadline.json (NOT live) for verification.');
} else if (WRITE) {
  console.error('\n✗ REFUSED to write — additive-only check failed (' + mutated + ').');
  process.exit(1);
}
