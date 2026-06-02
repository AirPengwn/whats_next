/* ─────────────────────────────────────────────────────────────────────
   _triage_v201.js — one-shot triage of records whose deadlines have
   officially passed but the program/posting RECURS. Per the codified
   weekly-sweep methodology (README §Weekly opportunity sweep):
     • cycle: "next"          • deadline_kind: "contact-first"
     • deadline string updated to reflect next cycle
     • DO NOT mark expired (recurring, not discontinued)
     • DO NOT touch badge — fit-tier judgement is a separate concern
   Safe-by-construction: only the named indexes get touched; we re-read
   each record, mutate three fields, re-serialize with UTF-8 preserved.
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');

const FILE = 'opportunities.data.json';
const raw = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);

/* idx → {cycle, deadline_kind, deadline} updates. Indexes verified
   against the current data file before this script runs. */
const UPDATES = {
  /* Group A — recurring funded grad programs, admission cycle passed */
  2:  { deadline: 'Next cycle (Fall 2027 admit): Dec 1 for full consideration; no later than Feb 1 — contact PI early' },
  3:  { deadline: 'Next cycle — contact program / individual faculty directly for Fall 2027 admit' },
  4:  { deadline: 'Next cycle (Fall 2027 admit): Feb 15 for funding consideration; formal deadline May 15 — contact early' },
  9:  { deadline: 'Next cycle (Fall 2027 admit): typical Mar 1 for Haub School; CFWRU positions vary — contact directly' },
  15: { deadline: 'Next cycle (Fall 2027 admit): typical Dec 1 domestic / Oct 1 international — contact Dr. Siegert lab' },
  96: { deadline: 'Next cycle — contact program for next funded MS opening (May 31, 2026 cycle closed)' },
  /* Group C — recurring seasonal internships, current cycle filled/closed */
  36: { deadline: 'Next cycle (Summer 2027) — contact WSSI for posting; Summer 2026 filled' },
  39: { deadline: 'Next cycle (Fall 2027) — Earthjustice posts annually; Fall 2026 cycle closed May 15, 2026' },
  40: { deadline: 'Next cycle (2027) — Jug Bay posts annually; 2026 cycle closed' },
  76: { deadline: 'Next cycle — American Youthworks / USFWS Wichita placements recur; Jan 25, 2026 closed' },
};

let changed = 0;
Object.keys(UPDATES).forEach(function(k){
  const i = +k;
  const it = data[i];
  if(!it){ console.error('  ! index '+i+' not found — skipping'); return; }
  const u = UPDATES[k];
  it.cycle = 'next';
  it.deadline_kind = 'contact-first';
  if(u.deadline) it.deadline = u.deadline;
  /* clear deadline_date — the old date is moot; next-cycle date is unknown */
  delete it.deadline_date;
  changed++;
  console.log('  ['+i+'] cycle→next  ' + it.title.slice(0,60));
});

/* re-serialize, preserving original 2-space indent + final newline */
const out = JSON.stringify(data, null, 2);
fs.writeFileSync(FILE, out + (raw.endsWith('\n') ? '\n' : ''), { encoding: 'utf8' });
console.log('\n✓ ' + changed + ' record(s) updated. Run: node build.js');
