/* ─────────────────────────────────────────────────────────────────────
   _fix_usajobs_v2.js — v2.26's URL was syntactically correct but
   returned zero matches because there are no current USFWS 0404 postings.
   Two real fixes:
     (1) Reorder links so the always-useful USFWS Careers page is FIRST.
     (2) Broaden the USAJobs URL by dropping JobCategoryCode=0404 so the
         search returns *something* (all current USFWS jobs) — Erin can
         then filter further from the USAJobs UI if she wants only 0404.
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');

const FILE = 'opportunities.data.json';
const raw  = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);

const USFWS_REFUGE_CAREERS = 'https://www.fws.gov/careers';
const USAJOBS_ALL_FWS      = 'https://www.usajobs.gov/Search/Results?d=Fish-and-Wildlife-Service';
const USAJOBS_PATHWAYS_FWS = 'https://www.usajobs.gov/Search/Results?d=Fish-and-Wildlife-Service&hp=student';

const FIXES = {
  /* GS-0404 records — careers page first, broadened USAJobs second */
  'item-030': {
    links: [
      { href: USFWS_REFUGE_CAREERS, label: '🔗 USFWS Careers & Internships (program overview)' },
      { href: USAJOBS_ALL_FWS,      label: '🔍 USAJobs: all current USFWS openings (filter to 0404 in sidebar)' }
    ]
  },
  'item-062': {
    links: [
      { href: USFWS_REFUGE_CAREERS, label: '🔗 USFWS Careers & Internships (program overview)' },
      { href: USAJOBS_ALL_FWS,      label: '🔍 USAJobs: all current USFWS openings (filter to 0404 in sidebar)' }
    ]
  },
  /* Pathways records — careers page first, USAJobs student-track filter */
  'item-021': {
    links: [
      { href: USFWS_REFUGE_CAREERS, label: '🔗 USFWS Careers & Internships (Pathways overview)' },
      { href: USAJOBS_PATHWAYS_FWS, label: '🔍 USAJobs: all USFWS student / recent-grad postings' }
    ]
  },
  'item-055': {
    links: [
      { href: USFWS_REFUGE_CAREERS, label: '🔗 USFWS Careers & Internships (Pathways overview)' },
      { href: USAJOBS_PATHWAYS_FWS, label: '🔍 USAJobs: all USFWS student / recent-grad postings' }
    ]
  }
};

let touched = 0;
Object.keys(FIXES).forEach(id => {
  const rec = data.find(r => r.id === id);
  if(!rec){ console.error('  ! '+id+' not found'); return; }
  rec.links = FIXES[id].links;
  /* Promote the first link to url field so it renders as the primary CTA */
  rec.url = FIXES[id].links[0].href;
  rec.url_label = FIXES[id].links[0].label.replace(/^🔗\s*/, '').replace(/^🔍\s*/, '');
  /* Set the SECOND link as url2 for clear secondary CTA */
  rec.url2 = FIXES[id].links[1].href;
  rec.url2_label = FIXES[id].links[1].label.replace(/^🔗\s*/, '').replace(/^🔍\s*/, '');
  touched++;
  console.log('  ✓ '+id+' — '+rec.title.slice(0,55));
});

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + (raw.endsWith('\n')?'\n':''), { encoding: 'utf8' });

console.log('\n=== USAJOBS FIX v2 ===');
console.log('  Records updated:  ' + touched);
console.log('\nNew link order on each card:');
console.log('  1. USFWS Careers page  (loads useful content always)');
console.log('  2. USAJobs all-FWS     (shows current jobs; never empty)');
console.log('\nNext: node build.js');
