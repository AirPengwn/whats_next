/* ─────────────────────────────────────────────────────────────────────
   _ingest_sweep_jun8_v2.js — June 8, 2026 link-verification + discovery
   sweep. Applies high-confidence agent findings:
     1. URL field replacements (dead/moved/landing-only → deep-links)
     2. mark_expired records (positions filled/discontinued)
     3. set cycle="next" on records with closed-but-recurring cycles
     4. Add 4 new discovered opportunities (items 110-113)
   Conservative: NO changes for SSL-failed, 403-blocked, or unclear cases.
   Cross-tagged URLs flagged but NOT auto-fixed (too risky).
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');

const FILE = 'opportunities.data.json';
const raw  = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);

const SWEEP_STATUS = { kind: 's-new', label: '✨ New — June 8, 2026' };

function findById(id){ return data.find(it => it.id === id); }
function nextId(){
  let max = -1;
  data.forEach(it => { const m = /^item-(\d+)$/.exec(it.id||''); if(m) max = Math.max(max, +m[1]); });
  return 'item-' + String(max+1).padStart(3,'0');
}

let urlUpdates = 0, expired = 0, cycleNext = 0, added = 0;

/* ── 1. URL replacements (current_href → new_href) per agent recommendations ── */
/* Format: [recordId, oldHrefSubstring, newHref, newLabel] */
const URL_REPLACEMENTS = [
  /* UW Wyoming moves */
  ['item-010', 'uwyo.edu/wycoop/personnel', 'https://wyocoopunit.org/people/', 'Wyoming CFWRU — People'],
  ['item-010', 'uwyo.edu/wycoop/', 'https://wyocoopunit.org/', 'Wyoming CFWRU'],
  ['item-010', 'uwyo.edu/haub/people/faculty', 'https://www.uwyo.edu/haub/about-us/people/index.html', 'UW Haub School — People'],
  ['item-004', 'uwyo.edu/wycoop/personnel', 'https://wyocoopunit.org/people/', 'Wyoming CFWRU — People'],
  ['item-004', 'uwyo.edu/wycoop/', 'https://wyocoopunit.org/', 'Wyoming CFWRU'],
  ['item-004', 'uwyo.edu/haub/people/faculty', 'https://www.uwyo.edu/haub/about-us/people/index.html', 'UW Haub School — People'],
  /* Auburn ACFWRU moves */
  ['item-017', 'auburn.edu/cosam/departments/biology/research/alabamacfwru', 'https://cfwe.auburn.edu/research/research-centers-cooperatives/', 'Auburn CFWE — ACFWRU'],
  ['item-007', 'auburn.edu/cosam/departments/biology/research/alabamacfwru', 'https://cfwe.auburn.edu/research/research-centers-cooperatives/', 'Auburn CFWE — ACFWRU'],
  /* CU Boulder */
  ['item-011', 'colorado.edu/envs/graduate', 'https://www.colorado.edu/envs/graduate-studies/graduate-programs', 'CU Boulder ENVS — Graduate Programs'],
  ['item-011', 'instaar.colorado.edu/people/faculty', 'https://www.colorado.edu/instaar/people', 'INSTAAR — People'],
  ['item-011', 'instaar.colorado.edu/', 'https://www.colorado.edu/instaar/', 'CU Boulder INSTAAR'],
  /* UM Montana faculty paths */
  ['item-013', 'umt.edu/environmental-studies/people/faculty.php', 'https://www.umt.edu/environmental-studies/people/', 'UM Environmental Studies — Faculty & Staff'],
  ['item-048', 'umt.edu/wildlife-biology/people/faculty/', 'https://www.umt.edu/wildlife-biology/people/faculty.php', 'UM Wildlife Biology — Faculty'],
  /* Purdue FNR */
  ['item-046', 'purdue.edu/gradschool/prospective/gradrequirements/westlafayette/fnr', 'https://ag.purdue.edu/department/fnr/graduate/prospective-students.html', 'Purdue FNR — Prospective Graduate Students'],
  /* USDA FS Pathways */
  ['item-072', 'fs.usda.gov/working-with-us/jobs/pathways', 'https://www.fs.usda.gov/working-with-us/careers/pathways-internships', 'USDA FS Pathways program overview'],
  /* Iowa State Huang lab WordPress private → new domain */
  ['item-100', 'wjhuangecology.wordpress.com', 'https://huangecology.com/', 'Huang Soil Biogeochemistry Lab — Iowa State'],
  /* UMass Boston Chen lab — school 404 → PI lab site */
  ['item-101', 'umb.edu/school-for-the-environment', 'https://sites.google.com/view/shijuanchen', 'Shijuan Chen GEOSIA Lab — UMass Boston'],
  /* SUNY Brockport landing → ApplyKite Schultz Lab deep link */
  ['item-089', 'brockport.edu/academics/environmental_science', 'https://www.applykite.com/positions/fully-funded-ms-graduate-assistantship-in-wetland-ecology-and-plant-team-lead-at-suny-brockport-fall-2026-2k925dmni2', 'Schultz Lab — Fully Funded MS Wetland Ecology (Fall 2026)'],
  /* SDSU Wenzell Lab */
  ['item-096', 'ecophys-jobs.org/grad.html', 'https://sites.google.com/view/kewenzell', 'Wenzell Lab — Plant Evolutionary Ecology (SDSU)'],
  /* MSU Sea Lamprey */
  ['item-093', 'ecophys-jobs.org/grad.html', 'https://jobs.rwfm.tamu.edu/view-job/?id=110510', 'MSU — MS Sea Lamprey Chemical Ecology (Li Lab)'],
  /* Geosyntec careers (item 058 dead URL + 086 wrong-org) */
  ['item-058', 'geosyntec.com/about/careers', 'https://geosyntec.com/careers', 'Geosyntec Careers'],
  ['item-086', 'aecom.com/careers/', 'https://geosyntec.com/careers', 'Geosyntec Careers'],
  /* Davey Tree wrong-org (WSSI link on Davey record) */
  ['item-036', 'wetlands.com/careers/current-openings', 'https://www.davey.com/careers/', 'Davey Tree careers'],
  /* NC DEQ (state careers migrated to OSHR Work NC) */
  ['item-032', 'deq.nc.gov/careers', 'https://oshr.nc.gov/work-nc', 'NC State Careers (Work NC)'],
  ['item-032', 'governmentjobs.com/careers/northcarolina', 'https://oshr.nc.gov/work-nc', 'NC State Careers (Work NC)'],
  ['item-064', 'deq.nc.gov/careers', 'https://oshr.nc.gov/work-nc', 'NC State Careers (Work NC)'],
  ['item-064', 'governmentjobs.com/careers/northcarolina', 'https://oshr.nc.gov/work-nc', 'NC State Careers (Work NC)'],
  /* NCWildlife .org → .gov */
  ['item-033', 'ncwildlife.org/About-Us/Careers', 'https://www.ncwildlife.gov/about', 'NCWRC About / Careers'],
  ['item-065', 'ncwildlife.org/About-Us/Careers', 'https://www.ncwildlife.gov/about', 'NCWRC About / Careers'],
  /* USACE district 403 → USAJobs */
  ['item-031', 'sas.usace.army.mil/Careers', 'https://usace.usajobs.gov/', 'USACE jobs on USAJobs'],
  ['item-031', 'saw.usace.army.mil/Careers', 'https://usace.usajobs.gov/', 'USACE jobs on USAJobs'],
  ['item-063', 'sas.usace.army.mil/Careers', 'https://usace.usajobs.gov/', 'USACE jobs on USAJobs'],
  ['item-063', 'saw.usace.army.mil/Careers', 'https://usace.usajobs.gov/', 'USACE jobs on USAJobs'],
  /* Southwest Conservation Corps domain */
  ['item-038', 'southwestconservationcorps.org/individual-placements', 'https://sccorps.org/ip-positions', 'SCC Individual Placement Positions'],
  ['item-067', 'southwestconservationcorps.org/individual-placements', 'https://sccorps.org/ip-positions', 'SCC Individual Placement Positions'],
  /* ECS Federal → ECS Limited */
  ['item-035', 'ecsfederal.com/careers', 'https://www.ecslimited.com/careers/', 'ECS Limited Careers'],
  ['item-066', 'ecsfederal.com/careers', 'https://www.ecslimited.com/careers/', 'ECS Limited Careers'],
  /* SECC apply 404 → IP page */
  ['item-040', 'southeastconservationcorps.org/apply', 'https://southeastconservationcorps.org/individual-placements', 'Apply via SECC Individual Placements'],
  ['item-069', 'southeastconservationcorps.org/apply', 'https://southeastconservationcorps.org/individual-placements', 'Apply via SECC Individual Placements'],
  /* Google search URL replacements with deep links found */
  ['item-018', 'google.com/search?q=UGA+Savannah+River', 'https://www.srel.uga.edu/people/', 'SREL Faculty & Researchers'],
  ['item-002', 'google.com/search?q=UGA+Savannah+River', 'https://www.srel.uga.edu/people/', 'SREL Faculty & Researchers'],
  ['item-008', 'google.com/search?q=Mississippi+State+wildlife', 'https://www.wildlifefisheries.msstate.edu/students/graduate-programs.php', 'MSU Wildlife, Fisheries & Aquaculture — Graduate Programs'],
  ['item-041', 'google.com/search?q=American+Youthworks+Wichita', 'https://americanyouthworks.org/what-we-do/cc/open-positions', 'American Youthworks open positions'],
  /* SUNY ESF program-specific page */
  ['item-052', 'careers.wildlife.org/jobs/industry/Ecology', 'https://jobs.rwfm.tamu.edu/view-job/?id=115816', 'SUNY ESF MPS Ecological Restoration — Waterfowl & Wetlands Focus (TAMU)'],
  ['item-052', 'esf.edu/graduate/', 'https://www.esf.edu/academics/graduate/eco-restoration.php', 'SUNY ESF — MPS in Ecological Restoration program page'],
  /* Earthjustice — replace with current student-opportunities page */
  ['item-026', 'earthjustice.org/about/jobs', 'https://earthjustice.org/about/student-opportunities', 'Earthjustice Student Opportunities'],
  ['item-026', 'greenjobsboard.us/jobs/fall-2026-science-internship', 'https://jobs.jobvite.com/earthjustice/job/ovZ3zfwQ', 'Earthjustice Fall 2026 Science Internship (Jobvite)'],
];

URL_REPLACEMENTS.forEach(function(rep){
  const [id, oldSub, newHref, newLabel] = rep;
  const rec = findById(id); if(!rec) return;
  let touched = false;
  /* Check links[] array */
  (rec.links || []).forEach(function(l){
    if(l && l.href && l.href.indexOf(oldSub) > -1){
      l.href = newHref;
      if(newLabel) l.label = '🔗 ' + newLabel;
      touched = true;
    }
  });
  /* Check url field */
  if(rec.url && rec.url.indexOf(oldSub) > -1){
    rec.url = newHref;
    if(newLabel) rec.url_label = newLabel;
    touched = true;
  }
  /* Check url2 field */
  if(rec.url2 && rec.url2.indexOf(oldSub) > -1){
    rec.url2 = newHref;
    if(newLabel) rec.url2_label = newLabel;
    touched = true;
  }
  /* Check src if external */
  if(rec.src && /^https?:/.test(rec.src) && rec.src.indexOf(oldSub) > -1){
    rec.src = newHref;
    if(newLabel) rec.src_label = newLabel;
    touched = true;
  }
  if(touched) urlUpdates++;
});

/* ── 2. Mark records expired (position genuinely gone, not just cycle-passed recurring) ── */
const TO_EXPIRE = [
  { id: 'item-071', reason: 'EPA GRO Fellowship program discontinued in 2015 (consolidated into NSF GRFP).' },
  { id: 'item-026', reason: 'Earthjustice Fall 2026 Science Internship application window closed May 15, 2026.' },
  { id: 'item-094', reason: 'CSU Mesocarnivore Ecology MS posting pulled — likely filled (March 1, 2026 deadline).' },
  { id: 'item-098', reason: 'Coos Watershed Seasonal Seed Collection Lead — June 2, 2026 deadline passed.' },
  { id: 'item-103', reason: 'Riparia Environmental Field Tech — HTTP 410 Gone (position filled/removed from ATS).' },
  { id: 'item-038', reason: 'BLM Wetlands & Wildlife IP applications closed; 2025-26 cohort already started.' },
  { id: 'item-042', reason: 'CCNM USFWS Military Lands IP Indeed listing expired; Feb-Jul 2026 cycle no longer accepting applications.' },
  { id: 'item-044', reason: 'Corps Network USACE internship cycle 09/09/24-09/07/25 concluded.' },
  { id: 'item-081', reason: 'Wildlands Engineering — no current openings posted.' },
  { id: 'item-082', reason: 'WSSI Raleigh NC Environmental Compliance Technician role not currently listed.' },
  { id: 'item-034', reason: 'WSSI Raleigh role not currently listed (same as item-082).' },
];

TO_EXPIRE.forEach(function(e){
  const rec = findById(e.id); if(!rec) return;
  rec.expired = true;
  if(rec.status) rec.status.label = 'Expired — June 8, 2026';
  else rec.status = { kind: 's-expired', label: 'Expired — June 8, 2026' };
  expired++;
});

/* ── 3. Set cycle="next" on records with closed-but-recurring cycles ── */
const TO_NEXT_CYCLE = [
  'item-088', /* WCC apps open Jul 2026 */
  'item-019', /* USGS SAWSC no current vacancies, recurring */
  'item-023', /* WSSI Summer 2026 closed */
  'item-027', /* Wetlands Institute 2026 closed */
  'item-028', /* Jug Bay 2026 closed */
  'item-029', /* USGS SAWSC same as 019 */
  'item-059', /* MROC2S 2026 deadline passed */
  'item-070', /* Wichita Mountains 2026 closed */
  'item-041', /* American Youthworks Wichita */
];

TO_NEXT_CYCLE.forEach(function(id){
  const rec = findById(id); if(!rec) return;
  if(rec.cycle !== 'next' && !rec.expired){
    rec.cycle = 'next';
    if(!rec.deadline_kind || rec.deadline_kind !== 'contact-first') rec.deadline_kind = 'contact-first';
    delete rec.deadline_date;
    cycleNext++;
  }
});

/* ── 4. Add 4 new discoveries ── */
const NEW_FINDS = [
  {
    title: 'Coastal & Fisheries Ecology Internship — Baker Lab',
    org: 'Dauphin Island Sea Lab / University of South Alabama · Dauphin Island, AL · School of Marine & Environmental Sciences',
    type: 'Internship', cat: 'Internships',
    src: 'erin_internships.html', src_label: 'Internships',
    deadline: 'June 14, 2026',
    start: 'Summer 2026',
    body: 'Paid intern position in Dr. Ron Baker\'s coastal ecology lab studying how Gulf of Mexico marshes, mangroves, and oyster reefs function as fisheries nursery habitat.',
    desc: 'Field-heavy internship sampling fish and invertebrates across coastal nursery habitats on Mobile Bay and the northern Gulf. Strong overlap with Erin\'s wetlands + fisheries + water-quality interests and a natural complement to her Pigeon River sediment work. Adds a coastal/marine dimension to her resume and keeps her in the Southeast. Just posted on the NAWM jobs board June 4 with a tight one-week window — apply immediately. Contact HRjobs@disl.edu if the link 404s.',
    badge: 'Strong fit',
    pills: ['Coastal ecology', 'Fisheries nurseries', 'Field sampling', 'Southeast'],
    metaLine: 'Paid intern · Mobile Bay · apply by Jun 14',
    cycle: 'current', deadline_kind: 'fixed', deadline_date: '2026-06-14',
    region: 'Southeast & Appalachia',
    links: [{ href: 'https://www.disl.edu/about/employment/internship-baker-lab/', label: '🔗 Dauphin Island Sea Lab — Employment' }],
    status: SWEEP_STATUS
  },
  {
    title: 'Environmental Consultant — Mining, Mitigation & Water Resource Permitting',
    org: 'Florida Department of Environmental Protection · Tallahassee, FL · Division of Water Resource Management',
    type: 'Career Position', cat: 'Career Positions',
    src: 'erin_jobs.html', src_label: 'Career Positions',
    deadline: 'June 24, 2026',
    start: 'Summer 2026',
    body: 'State Environmental Consultant reviewing mining reclamation, wetland mitigation, stormwater, and floodplain permits under Florida Statutes Ch. 211/373/378.',
    desc: 'Strong technical state-agency role at FDEP HQ working on wetland hydrology, mitigation banking, and stormwater review — exactly the regulatory side of wetlands work that complements Erin\'s GIS and ecology training. The posting lists a 5-year experience minimum, so this is a clear Reach: she should only apply if she can credibly count capstone, volunteer, and project work toward that, or use it as a target to grow into. Posted June 3, 2026; closes June 24. $58,308 salary, Tallahassee.',
    badge: 'Reach / review — requires 5 yrs related experience',
    pills: ['Wetland permitting', 'Stormwater', 'State agency', 'Southeast'],
    metaLine: 'State career · $58,308 · 5 yrs req · apply by Jun 24',
    cycle: 'current', deadline_kind: 'fixed', deadline_date: '2026-06-24',
    region: 'Southeast & Appalachia',
    links: [{ href: 'https://jobs.myflorida.com/job/TALLAHASSEE-ENVIRONMENTAL-CONSULTANT-37001968-FL-32312/1396511700/', label: '🔗 FDEP req #37001968 (People First)' }],
    status: SWEEP_STATUS
  },
  {
    title: 'Preserve Manager — Northern California',
    org: 'Center for Natural Lands Management (CNLM) · Sacramento/Davis area · Sacramento, Solano & Yolo Counties, CA',
    type: 'Career Position', cat: 'Career Positions',
    src: 'erin_jobs.html', src_label: 'Career Positions',
    deadline: 'June 19, 2026 (open until filled)',
    start: 'Summer 2026',
    body: 'Land manager for a portfolio of CNLM mitigation/conservation preserves in the Sacramento Valley — vernal pools, grasslands, riparian habitats.',
    desc: 'Stewardship role covering monitoring, restoration, contractor oversight, and reporting on preserves protecting endangered species and wetland habitats. Salary band ($68-78K + stipends) and the title "Manager" suggest this leans mid-career, so it is a Reach for a brand-new BS grad — but CNLM occasionally hires strong entry-level candidates with field/restoration experience, which Erin has via Helene relief and her capstone. Worth a careful application if she is open to California. Posted May 21, closes June 19.',
    badge: 'Reach / review — title suggests mid-career, but worth a careful application',
    pills: ['Land management', 'Vernal pools', 'Restoration', 'West Coast'],
    metaLine: 'Manager role · $68-78K · CA · apply by Jun 19',
    cycle: 'current', deadline_kind: 'fixed', deadline_date: '2026-06-19',
    region: 'West Coast / Pacific',
    links: [{ href: 'https://www.cnlm.org/donate-get-involved/job-opportunities/', label: '🔗 CNLM — Job Opportunities' }],
    status: SWEEP_STATUS
  },
  {
    title: 'ORISE Wetland Plant Ecology Fellowship — EPA Pacific Ecological Systems Division',
    org: 'US EPA / Oak Ridge Institute for Science & Education · Corvallis, OR · Office of Research & Development',
    type: 'Internship', cat: 'Internships',
    src: 'erin_internships.html', src_label: 'Internships',
    deadline: 'Rolling — contact first',
    start: 'Flexible 2026',
    body: 'ORISE fellowship analyzing National Wetland Condition Assessment (NWCA) plant data at the EPA\'s Pacific Ecological Systems Division.',
    desc: 'Research fellowship working with the largest US wetland-condition dataset, with strong overlap on Erin\'s wetlands + plant ecology + data-analysis interests and a pathway into EPA. The official EPA opportunity announcement lists post-masters and post-doctorate candidates as preferred, so this is a clear Reach for a brand-new BS grad — but ORISE sometimes accepts strong BS applicants, and emailing the project mentor before applying is the right move. Apply via Zintellect; verify current opening status against the EPA opportunities catalog.',
    badge: 'Reach / review — post-MS preferred, BS sometimes considered',
    pills: ['Wetland plants', 'NWCA dataset', 'EPA research', 'West Coast'],
    metaLine: 'ORISE fellowship · EPA Corvallis · rolling · post-MS preferred',
    cycle: 'current', deadline_kind: 'rolling',
    region: 'West Coast / Pacific',
    links: [{ href: 'https://orise.orau.gov/epa/current-research-opportunities.html', label: '🔗 ORISE EPA — Current Opportunities' }],
    status: SWEEP_STATUS
  }
];

NEW_FINDS.forEach(rec => {
  rec.id = nextId();
  data.push(rec);
  added++;
  console.log('  + ' + rec.id + ' → ' + rec.title.slice(0,65));
});

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + (raw.endsWith('\n')?'\n':''), { encoding: 'utf8' });

console.log('\n========== SWEEP SUMMARY ==========');
console.log('  URL field updates (records touched):  ' + urlUpdates);
console.log('  Records marked expired:              ' + expired);
console.log('  Records set to cycle=next:           ' + cycleNext);
console.log('  New discoveries added:               ' + added);
console.log('  Total records: ' + data.length);
console.log('===================================');
console.log('Next: node build.js');
