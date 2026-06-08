/* ─────────────────────────────────────────────────────────────────────
   _fix_usajobs.js — repair USAJobs search URLs that return "No jobs
   found" because of over-restrictive keyword + deprecated Series= param.
   Per OPM, use `d=Fish-and-Wildlife-Service` (department slug) and
   `JobCategoryCode=0404` (current param name, not legacy `Series`).
   Drop the keyword — USFWS uses many position titles for the 0404 series
   (Bio Sci Tech, Wildlife Refuge Specialist, Park Ranger, etc.) and an
   exact-keyword filter zeros out the search.
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');

const FILE = 'opportunities.data.json';
const raw  = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);

/* Mapping: substring match → replacement URL + label */
const FIXES = [
  {
    match: 'usajobs.gov/Search/Results?a=FWS&k=biological+science+technician',
    new:   'https://www.usajobs.gov/Search/Results?d=Fish-and-Wildlife-Service&JobCategoryCode=0404',
    label: '🔍 USAJobs: USFWS Biological Science Technician (GS-0404) postings',
    notes: 'item-030, item-062 — Bio Sci Tech GS-0404 records'
  },
  {
    match: 'usajobs.gov/Search/Results?hp=student&a=FWS&k=biological+science',
    new:   'https://www.usajobs.gov/Search/Results?d=Fish-and-Wildlife-Service&hp=student',
    label: '🔍 USAJobs: USFWS Pathways Student / Recent Grad postings',
    notes: 'item-021, item-055 — Pathways Bio Sci Student Trainee records'
  }
];

let fixed = 0;
let recordsTouched = new Set();

data.forEach(rec => {
  function fix(href){
    if(!href) return href;
    for(const f of FIXES){
      if(href.indexOf(f.match) > -1){
        fixed++;
        recordsTouched.add(rec.id);
        return f.new;
      }
    }
    return href;
  }
  function labelFor(href){
    for(const f of FIXES){
      if(href === f.new) return f.label;
    }
    return null;
  }
  if(rec.url){
    const newUrl = fix(rec.url);
    if(newUrl !== rec.url){
      rec.url = newUrl;
      rec.url_label = labelFor(newUrl) || rec.url_label;
    }
  }
  if(rec.url2){
    const newUrl = fix(rec.url2);
    if(newUrl !== rec.url2){
      rec.url2 = newUrl;
      rec.url2_label = labelFor(newUrl) || rec.url2_label;
    }
  }
  (rec.links || []).forEach(l => {
    if(!l || !l.href) return;
    const newHref = fix(l.href);
    if(newHref !== l.href){
      l.href = newHref;
      const newLabel = labelFor(newHref);
      if(newLabel) l.label = newLabel;
    }
  });
});

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + (raw.endsWith('\n')?'\n':''), { encoding: 'utf8' });

console.log('=== USAJOBS URL FIX ===');
console.log('  URLs replaced:    ' + fixed);
console.log('  Records touched:  ' + recordsTouched.size + ' (' + [...recordsTouched].join(', ') + ')');
console.log('');
console.log('New URLs in use:');
FIXES.forEach(f => console.log('  → ' + f.new));
console.log('\nNext: node build.js');
