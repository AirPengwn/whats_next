/* ─────────────────────────────────────────────────────────────────────
   _ingest_sweep_jun2.js — one-shot ingestion of the June 2, 2026 sweep
   findings. Adds 5 verified new opportunities to opportunities.data.json
   with proper schema, region, badge fit tier, and "✨ New — June 2, 2026"
   status (auto-expires 21 days per the engine).
   Run: node _ingest_sweep_jun2.js
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');

const FILE = 'opportunities.data.json';
const raw  = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);

const SWEEP_LABEL = '✨ New — June 2, 2026';
const SWEEP_STATUS = { kind: 's-new', label: SWEEP_LABEL };

/* Next available ID after the existing 97 records (item-000 … item-096) */
function nextId(){
  let max = -1;
  data.forEach(it => {
    const m = /^item-(\d+)$/.exec(it.id||'');
    if(m) max = Math.max(max, +m[1]);
  });
  return 'item-' + String(max+1).padStart(3,'0');
}

const NEW_FINDS = [
  /* ── 1. NJ DEP Environmental Services Trainee (Career) ─────────── */
  {
    title: 'Environmental Services Trainee — Permit Efficiency Initiative (WLM)',
    org:   'New Jersey Department of Environmental Protection · Trenton, NJ · Watershed & Land Management',
    type:  'Career Position',
    cat:   'Career Positions',
    src:   'erin_jobs.html',
    src_label: 'Career Positions',
    deadline: 'June 8, 2026 at 4:00 PM',
    start: 'Summer/Fall 2026',
    body:  'NJDEP is filling multiple Environmental Services Trainee vacancies (postings WLM-2026-12, -13, -14) in the Watershed & Land Management division as part of Governor Sherrill’s “DEP Delivers” permitting initiative. Trainees support wetlands, water, and land-use permit review while developing into full Environmental Specialists.',
    desc:  'These trainee lines are explicitly designed as on-ramp positions for recent grads with a bachelor’s in environmental science, biology, ecology, or related; the WLM division houses freshwater wetlands, flood hazard, and Coastal Area Facility Review Act permitting — a strong substantive match for Erin’s wetlands/water-quality interests. Three open vacancies improve odds. Caveat: NJ state employees must live in NJ unless exempted, so this is a relocation commitment. Quick turnaround — apply by June 8.',
    badge: 'Strong fit',
    pills: ['Wetlands permitting', 'Water quality', 'State agency career start', 'Northeast'],
    metaLine: 'Multiple openings (WLM-2026-12/13/14) · NJ residency required · deadline June 8, 2026',
    cycle: 'current',
    deadline_kind: 'fixed',
    deadline_date: '2026-06-08',
    region: 'Northeast',
    links: [{ href: 'https://dep.nj.gov/jobs/', label: '🔗 NJDEP Employment Opportunities' }],
    status: SWEEP_STATUS
  },
  /* ── 2. Coos Watershed Association — Seed Collection Crew Lead (Internship) ── */
  {
    title: 'Seasonal Seed Collection Crew Lead — native plant restoration',
    org:   'Coos Watershed Association · Coos Bay, OR · Plants Program',
    type:  'Internship',
    cat:   'Internships',
    src:   'erin_internships.html',
    src_label: 'Internships',
    deadline: 'June 2, 2026 at 5:00 PM — applications reviewed as received',
    start: 'Summer 2026 (seasonal, up to 40 hrs/week)',
    body:  'Seasonal grant-funded crew lead role with a long-running Oregon coastal watershed nonprofit, leading native-seed collection field crews under the Plants Program Manager.',
    desc:  'Quick-decision option for getting West Coast restoration field experience on Erin’s resume. Coos Watershed Association is a 501(c)(3) doing salmon-bearing stream restoration on the southern Oregon coast — direct overlap with her water-quality, restoration, and watershed interests. Lead role means supervisory experience too. URGENT: deadline is today (June 2). If interested at all, email cooswatershed.org immediately; otherwise treat the org as a contact for future seasonal cycles.',
    badge: 'Reach / review — deadline today, decide fast',
    pills: ['Restoration', 'Watershed nonprofit', 'Seasonal field crew', 'Pacific NW'],
    metaLine: 'Seasonal (Summer 2026) · West Coast · CLOSES TODAY',
    cycle: 'current',
    deadline_kind: 'fixed',
    deadline_date: '2026-06-02',
    region: 'West Coast / Pacific',
    links: [{ href: 'https://www.conservationjobboard.com/job-listing-seasonal-seed-collection-crew-lead-coos-bay-oregon/8493671191', label: '🔗 Conservation Job Board listing' }],
    status: SWEEP_STATUS
  },
  /* ── 3. Central Michigan University — MS Wetland Nutrient Modeling ── */
  {
    title: 'Central Michigan University — Funded MS, Wetland Nutrient Dynamics Modeling',
    org:   'Mount Pleasant, MI · Lammers Lab (Engineering) / Suchy Lab (Biology)',
    type:  'Graduate Program',
    cat:   'Funded Graduate Programs',
    src:   'erin_programs.html',
    src_label: 'Funded Graduate Programs',
    deadline: 'Open until filled (priority April 17, 2026 passed — still accepting)',
    start: 'August 2026 (possible early start May–Aug 2026)',
    body:  'Fully funded two-year MS (stipend + tuition waiver) characterizing and modeling nutrient dynamics in managed Michigan wetlands using field data, lab analysis, and process-based hydrology/biogeochemistry models. Co-advised by Drs. Roderick Lammers and Amanda Suchy; student enrolls in either MS Engineering or MS Biology.',
    desc:  'Excellent overlap with Erin’s wetlands, water-quality, and Pigeon River sediment background, and explicitly invites BS-in-environmental-science applicants. Lammers/Suchy welcome candidates whose strengths run more ecological than computational and will help build numerical-modeling skills — a useful technical upgrade for Erin. Priority date passed but the post says it remains open until filled, so a fast, well-pitched email to lamme1r@cmich.edu (CV + brief interest letter + transcript) is worthwhile. Verify current availability before investing in a long application.',
    badge: 'Strong fit',
    pills: ['Wetland biogeochemistry', 'Water quality modeling', 'Funded MS', 'Midwest'],
    metaLine: 'Funded MS · stipend + tuition · open until filled · start Aug 2026',
    cycle: 'current',
    deadline_kind: 'rolling',
    region: 'Midwest & Great Plains',
    links: [{ href: 'https://web.cobleskill.edu/fishwildlifejobs/2026/04/03/wetland-modeling-m-s-research-assistant-central-michigan-university/', label: '🔗 Fish & Wildlife Jobs Board posting' }],
    status: SWEEP_STATUS
  },
  /* ── 4. Iowa State University — PhD Soil Biogeochemistry (Huang Lab) ── */
  {
    title: 'Iowa State University — Funded PhD, Soil Biogeochemistry & Ecosystem Ecology (Huang Lab)',
    org:   'Ames, IA · Dept. of Ecology, Evolution & Organismal Biology / Agronomy',
    type:  'Graduate Program',
    cat:   'Funded Graduate Programs',
    src:   'erin_programs.html',
    src_label: 'Funded Graduate Programs',
    deadline: 'Rolling — review begins immediately; ISU Fall cycle deadline Dec 15, 2026 if not filled sooner',
    start: 'Fall 2026 (earliest) or Spring/Fall 2027',
    body:  'Funded PhD with Dr. Wenjuan Huang investigating soil carbon and nutrient cycling in natural and managed ecosystems, combining field measurements, lab incubations, mechanistic models, and machine learning to understand plant–microbial–mineral interactions affecting soil C persistence and water quality.',
    desc:  'Reach-leaning but realistic: the lab explicitly tries to recruit students from a range of backgrounds and ties soil biogeochemistry directly to water-quality outcomes, which aligns with Erin’s Pigeon River sediment lead-contamination capstone. PhD requires confidence and likely a stats refresh (she has one B+ stats class), but the methods-mix (field + lab + modeling) means a strong field/lab applicant can lean on those strengths. Apply by emailing CV, cover letter, and two references in one PDF to wjhuang@iastate.edu — first contact only, no formal app fee committed yet.',
    badge: 'Reach / review — PhD is a step up; worth a no-cost exploratory email',
    pills: ['Soil biogeochemistry', 'Water quality', 'Funded PhD', 'Midwest'],
    metaLine: 'Funded PhD · rolling review · contact wjhuang@iastate.edu first',
    cycle: 'current',
    deadline_kind: 'rolling',
    region: 'Midwest & Great Plains',
    links: [{ href: 'https://wjhuangecology.wordpress.com/', label: '🔗 Huang Lab website' }],
    status: SWEEP_STATUS
  },
  /* ── 5. UMass Boston — PhD Remote Sensing & Geospatial (Chen Lab) ── */
  {
    title: 'UMass Boston — Funded PhD, Remote Sensing & Geospatial Analysis (Chen Lab)',
    org:   'Boston, MA · School for the Environment',
    type:  'Graduate Program',
    cat:   'Graduate Programs — Next Cycle',
    src:   'erin_programs.html',
    src_label: 'Funded Graduate Programs',
    deadline: 'Fall 2027 cycle — contact Dr. Shijuan Chen now (Fall 2026 cycle’s Feb 1 deadline passed)',
    start: 'Fall 2027',
    body:  'Funded PhD with Dr. Shijuan Chen applying remote sensing and geospatial analysis to multi-hazard risk, land-use/land-cover change, and machine-learning analysis of Earth observation data. Tuition waiver plus TA/RA stipend through the Environmental Sciences PhD program.',
    desc:  'Pre-recruit lead: the formal Feb 2026 deadline has passed for Fall 2026 entry, but labs in this space often hold open conversations with strong potential applicants for the next cycle. Erin’s applied GIS multi-criteria suitability analysis from undergrad plus her interest in Helene/post-disaster work map naturally onto Chen’s hazard and land-change themes. Send an exploratory email now (CV, transcript, 1-page research interests) to gauge fit before committing to a Fall 2027 application; ask explicitly about funding availability.',
    badge: 'Reach / review — verify fit and 2027 cycle funding via email first',
    pills: ['Remote sensing', 'GIS', 'Land use change', 'Northeast'],
    metaLine: 'Funded PhD (next cycle) · contact-first · Fall 2027 entry',
    cycle: 'next',
    deadline_kind: 'contact-first',
    region: 'Northeast',
    links: [{ href: 'https://www.umb.edu/school-for-the-environment/', label: '🔗 UMass Boston School for the Environment' }],
    status: SWEEP_STATUS
  }
];

NEW_FINDS.forEach(rec => {
  rec.id = nextId();
  data.push(rec);
  console.log('  + ' + rec.id + ' → ' + rec.title.slice(0,70));
});

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + (raw.endsWith('\n')?'\n':''), { encoding: 'utf8' });
console.log('\n✓ ' + NEW_FINDS.length + ' record(s) added. Total: ' + data.length + '. Now run: node build.js');
