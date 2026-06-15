/* ─────────────────────────────────────────────────────────────────────
   _ingest_sweep_jun15.js — June 15, 2026 sweep ingestion.
   10 verified new opportunities (TAMUK Xi Lab dup excluded — already
   item-092). Status "✨ New — June 15, 2026" auto-expires 21 days.
   Run: node _ingest_sweep_jun15.js
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');

const FILE = 'opportunities.data.json';
const raw  = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);

const SWEEP_STATUS = { kind: 's-new', label: '✨ New — June 15, 2026' };

function nextId(){
  let max = -1;
  data.forEach(it => { const m = /^item-(\d+)$/.exec(it.id||''); if(m) max = Math.max(max, +m[1]); });
  return 'item-' + String(max+1).padStart(3,'0');
}

const NEW_FINDS = [
  /* ── 1. WSP California (top rec, urgent) ─────────────────────────── */
  {
    title: 'Watershed Stewards Program (WSP) Corpsmember — Year 33 Cohort',
    org:   'California Conservation Corps / AmeriCorps · Statewide CA placement sites',
    type:  'Service / Corps', cat: 'Service & Fellowships',
    src:   'erin_service.html', src_label: 'Service & Fellowships',
    deadline: 'Tuesday, June 23, 2026 (full application packets due)',
    start: 'October 5, 2026 — 10.5-month term ending August 19, 2027',
    body:  'California AmeriCorps program placing recent grads at host sites along coastal CA to monitor anadromous salmonid populations, conduct habitat restoration, water-quality monitoring, and community education. Monthly stipend ~$2,904-$2,967 plus $10,000 education award and medical insurance.',
    desc:  'Excellent on-ramp for Erin: structured AmeriCorps role with mentor placements at agencies (CDFW, NMFS, RCDs, watershed councils), heavy on stream/watershed fieldwork plus a built-in cohort. Salmonid focus complements her Pigeon River sediment work, and CA placements span coastal, redwood-belt, and Sierra streams. Time-sensitive — applications close in 8 days. Requires watching the WSP informational video before applying (passcode needed). Phone interviews follow June; site interviews July 9-27.',
    badge: 'Top recommendation',
    pills: ['Water quality', 'Restoration', 'Fisheries', 'AmeriCorps', 'West Coast'],
    metaLine: 'AmeriCorps · ~$2,904/mo + $10k ed award · apply by Jun 23',
    cycle: 'current', deadline_kind: 'fixed', deadline_date: '2026-06-23',
    region: 'West Coast / Pacific',
    links: [{ href: 'https://ccc.ca.gov/wp-content/uploads/2026/04/WSP_2026_ApplicationProcess_040326_ADA.pdf', label: '🔗 WSP 2026 Application Process (CCC)' }],
    status: SWEEP_STATUS
  },
  /* ── 2. OSU Murray Lab — vernal pools/seeps GIS MS (strong, contact-first) ── */
  {
    title: 'Oklahoma State University — MS Assistantship, Vernal Pool & Seep Wetland Mapping (Murray Lab)',
    org:   'Stillwater, OK · Natural Resource Ecology & Management',
    type:  'Graduate Program', cat: 'Funded Graduate Programs',
    src:   'erin_programs.html', src_label: 'Funded Graduate Programs',
    deadline: 'Original deadline Apr 24, 2026 passed — contact PI Dr. Bryan Murray re: late application or next cohort',
    start: 'January 1, 2027 (Spring 2027 cohort)',
    body:  'Two-year MS assistantship developing a geospatial framework — remote sensing, multi-criteria modeling, ground-truthing — to map ephemeral vernal pools and seep wetlands across SE Oklahoma in support of state SGCN conservation planning. $24,000/yr stipend plus full tuition waiver and health insurance.',
    desc:  'Strong fit for Erin\'s GIS suitability-analysis training and wetland interests — this is essentially a GIS-and-wetlands thesis. Bachelor\'s-only entry, GPA >3.0 satisfied (3.731). The posted deadline has passed but PI Dr. Bryan Murray fills these on rolling basis when unfilled — worth emailing now with cover letter, CV, and references. Stillwater is mid-cost, OSU has an established wetlands lab footprint.',
    badge: 'Strong fit — contact PI about late application',
    pills: ['Wetlands', 'GIS / remote sensing', 'Ephemeral wetlands', 'Midwest'],
    metaLine: 'Funded MS · $24k/yr + tuition · contact PI directly',
    cycle: 'current', deadline_kind: 'contact-first',
    region: 'Midwest & Great Plains',
    links: [{ href: 'https://eeb.uconn.edu/2026/03/24/m-s-assistantship-vernal-pool-and-seep-wetland-mapping-in-eastern-oklahoma/', label: '🔗 UConn EEB cross-posting (Murray Lab MS)' }],
    status: SWEEP_STATUS
  },
  /* ── 3. TAMU Randklev — freshwater mussels MS/PhD (top rec, rolling) ── */
  {
    title: 'Texas A&M Natural Resources Institute — Funded MS/PhD, Freshwater Mussels & Water Quality (Randklev & Lopez)',
    org:   'College Station, TX · Rangeland, Wildlife & Fisheries Mgmt',
    type:  'Graduate Program', cat: 'Funded Graduate Programs',
    src:   'erin_programs.html', src_label: 'Funded Graduate Programs',
    deadline: 'Rolling — Summer/Fall 2026 or Spring 2027 starts; apply now',
    start: 'Summer/Fall 2026 or Spring 2027',
    body:  'Fully funded assistantships in Dr. Charles Randklev & Dr. Roel Lopez\'s freshwater mussel ecology group. PhD focuses on how water quality drives mussel growth/survival in Trinity & central TX rivers; MS focuses on field surveys across east/central Texas. PhD ~$35k/yr × 4 yrs; MS ~$32k/yr × 2 yrs (stipend + tuition).',
    desc:  'Mussels are sentinel taxa for the exact kind of stream-quality work Erin did on the Pigeon River. The MS track (field-survey heavy) is the better fit — bachelor\'s + interest sufficient, no MS prerequisite. Apply by emailing a single PDF (cover letter + 3 references) to BOTH PIs. Texas A&M NRI is a top-tier shop with strong industry pipeline.',
    badge: 'Top recommendation',
    pills: ['Water quality', 'Fisheries / mollusks', 'Stream ecology', 'Southwest'],
    metaLine: 'Funded · MS ~$32k/yr or PhD ~$35k/yr · rolling',
    cycle: 'current', deadline_kind: 'rolling',
    region: 'Southwest',
    links: [{ href: 'https://www.nku.edu/~boycer/gradopps.html', label: '🔗 Boyce grad-opportunities cross-posting (Randklev/Lopez)' }],
    status: SWEEP_STATUS
  },
  /* ── 4. SUNY-ESF Arsenault & Farrell — fish/wetland hydroperiod (exceptional) ── */
  {
    title: 'SUNY-ESF — Funded MS/PhD, Fish & Wetland Ecology (Arsenault & Farrell)',
    org:   'Syracuse, NY · Dept. of Environmental Biology / Aquatic & Fisheries Science',
    type:  'Graduate Program', cat: 'Funded Graduate Programs',
    src:   'erin_programs.html', src_label: 'Funded Graduate Programs',
    deadline: 'Rolling — contact PIs first; SUNY-ESF official grad deadline Jan 15, 2027 for Fall 2027',
    start: 'Fall 2026 or Spring/Fall 2027',
    body:  'Fully funded MS or PhD co-advised by Dr. Emily Arsenault and Dr. John Farrell, studying how seasonal hydroperiod shapes energy flow and food webs in wetlands used by juvenile Northern Pike (St. Lawrence River system). Skills built: stable isotope analysis, otolith microchemistry, fish & wetland ecology.',
    desc:  'Combines wetland hydrology with fisheries — exactly Erin\'s intersecting interests. Field season May-Oct at Thousand Islands & Cranberry Lake biological stations; academic year in Syracuse. New NY Sea Grant funded ($217k) so resources are fresh. Bachelor\'s-direct PhD or MS both open. Email both PIs with CV + statement of interest before applying through the grad school.',
    badge: 'Exceptional fit',
    pills: ['Wetlands', 'Fisheries', 'Food webs / isotopes', 'Northeast'],
    metaLine: 'Funded MS or PhD · contact Arsenault + Farrell first · field at Thousand Islands',
    cycle: 'current', deadline_kind: 'contact-first',
    region: 'Northeast',
    links: [{ href: 'https://sites.google.com/view/arsenaultlab/people', label: '🔗 Arsenault Lab @ SUNY-ESF (contact page)' }],
    status: SWEEP_STATUS
  },
  /* ── 5. SIU Carbondale — watershed MS (strong, rolling) ── */
  {
    title: 'Southern Illinois University Carbondale — Funded MS, Watershed Science (Soils, Water & Nutrient Dynamics)',
    org:   'Carbondale, IL · School of Forestry & Horticulture',
    type:  'Graduate Program', cat: 'Funded Graduate Programs',
    src:   'erin_programs.html', src_label: 'Funded Graduate Programs',
    deadline: 'Rolling — review continues until filled; positions begin Summer/Fall 2026',
    start: 'Summer or Fall 2026',
    body:  'Two 2-year MS graduate research assistantships on the SIUC Watershed Science team focused on water, soils, and nutrient dynamics in agricultural watersheds. Full tuition waiver plus minimum $22,000/yr stipend.',
    desc:  'Good fit for Erin\'s soil/biogeochemistry interest paired with her GIS skills. Ag-watershed nutrient work is bread-and-butter for state agencies and consulting — strong career pivot platform. Carbondale is low cost of living. Contact prospective advisor before submitting the SIU grad application; positions still open as of latest listserv refresh.',
    badge: 'Strong fit',
    pills: ['Soil science', 'Watershed', 'Biogeochemistry', 'Midwest'],
    metaLine: 'Funded MS · $22k+/yr + tuition · rolling · 2 positions',
    cycle: 'current', deadline_kind: 'rolling',
    region: 'Midwest & Great Plains',
    links: [{ href: 'https://siu.edu/admissions/graduate/academics/', label: '🔗 SIU grad academics (program landing)' }],
    status: SWEEP_STATUS
  },
  /* ── 6. SCA Alaska NWI Wetland Intern (top rec, rolling, fills AK gap) ── */
  {
    title: 'SCA / USFWS GIS Wetland Intern — National Wetland Inventory (Alaska)',
    org:   'Student Conservation Association / US Fish & Wildlife Service · Anchorage, AK',
    type:  'Internship', cat: 'Internships',
    src:   'erin_internships.html', src_label: 'Internships',
    deadline: 'Rolling — open until filled (apply now)',
    start: '2026 (flexible start, ~26-week placement)',
    body:  'SCA Individual Placement supporting USFWS National Wetland Inventory (NWI) updates for Alaska: geospatial data management, field validation, attribution and functional classification of wetlands, merging legacy inventories into NWI-compatible deliverables.',
    desc:  'Direct match for Erin\'s GIS suitability-analysis training applied to wetlands at agency scale — a portfolio-grade project at a federal NWI shop. SCA provides housing/stipend/AmeriCorps ed award. Alaska placement covers the AK/HI/Territories region she\'s been weak on. Open to recent grads; no 2+ year experience requirement.',
    badge: 'Top recommendation',
    pills: ['GIS / remote sensing', 'Wetlands', 'NWI / federal', 'Alaska'],
    metaLine: 'SCA IP · USFWS NWI · housing+stipend+ed award · rolling',
    cycle: 'current', deadline_kind: 'rolling',
    region: 'Alaska, Hawaii & Territories',
    links: [{ href: 'https://www.thesca.org/serve/position/gis-wetland-intern/po-00732710', label: '🔗 SCA Position PO-00732710' }],
    status: SWEEP_STATUS
  },
  /* ── 7. Stantec Houston wetland delineator (reach, 5+yr) ── */
  {
    title: 'Environmental Scientist (Wetland Delineation) — Field Lead',
    org:   'Stantec · Houston, TX · Environmental Services',
    type:  'Career Position', cat: 'Career Positions',
    src:   'erin_jobs.html', src_label: 'Career Positions',
    deadline: 'July 31, 2026',
    start: 'Rolling — once hired',
    body:  'Field-lead wetland delineation role with Stantec\'s Houston environmental services group, supporting USACE Section 404 permitting, regulatory reports, and field crews across the Texas Gulf Coast.',
    desc:  'Reach — the "Field Lead" language usually implies 2+ years experience. Worth applying as an entry-level alternative if Stantec has a parallel Wetland Scientist I track in the same office. Posted June 8 on NAWM board. Stantec is one of the largest employers of recent grads in environmental consulting and runs structured early-career paths in the Gulf region.',
    badge: 'Reach / review — Field Lead likely needs 2+ yrs; ask about Wetland Scientist I alt',
    pills: ['Wetland delineation', 'Permitting', 'Consulting', 'Southwest'],
    metaLine: 'Career · Houston TX · apply by Jul 31 · 2+ yrs likely',
    cycle: 'current', deadline_kind: 'fixed', deadline_date: '2026-07-31',
    region: 'Southwest',
    links: [{ href: 'https://stantec.jobs/houston-tx/environmental-scientist-wetland-delineation-field-lead/EE45BAB873D84A08B23C03B99C4834C5/job/', label: '🔗 Stantec posting (Houston)' }],
    status: SWEEP_STATUS
  },
  /* ── 8. Hamer Environmental WA — wetland tech (good fit, PNW gap-filler) ── */
  {
    title: 'Wetland Technician — Eastern Washington & PNW field work',
    org:   'Hamer Environmental · Northeast Washington (field-based)',
    type:  'Career Position', cat: 'Career Positions',
    src:   'erin_jobs.html', src_label: 'Career Positions',
    deadline: 'July 31, 2026',
    start: 'Summer 2026 (immediate)',
    body:  'Wetland technician role with Hamer Environmental supporting wetland delineations, vegetation surveys, and regulatory documentation across NE Washington and PNW project sites.',
    desc:  'Solid bachelor\'s-level field role — exactly the kind of post-grad consulting position Erin\'s resume points at, in a region (Pacific Northwest) where she\'s currently under-represented in our coverage. Posted June 9 on NAWM board. Small firm so application goes directly through careers email.',
    badge: 'Good fit',
    pills: ['Wetland delineation', 'Field technician', 'Consulting', 'Pacific NW'],
    metaLine: 'Career · NE Washington · apply by Jul 31',
    cycle: 'current', deadline_kind: 'fixed', deadline_date: '2026-07-31',
    region: 'West Coast / Pacific',
    links: [{ href: 'https://www.hamerenvironmental.com/careers', label: '🔗 Hamer Environmental careers' }],
    status: SWEEP_STATUS
  },
  /* ── 9. SCA Chase Lake WMD ND — Prairie Pothole wetlands (strong, rolling, 4 slots) ── */
  {
    title: 'SCA Internships — Chase Lake Wetland Management District (4 positions)',
    org:   'Student Conservation Association / US Fish & Wildlife Service · Woodworth, ND · Prairie Pothole Region',
    type:  'Internship', cat: 'Internships',
    src:   'erin_internships.html', src_label: 'Internships',
    deadline: 'Rolling — open until filled',
    start: 'Summer 2026',
    body:  'Four SCA Individual Placements at USFWS Chase Lake WMD in the Prairie Pothole Region. Work includes collection and management of refuge/district real property and infrastructure using ArcGIS applications, GPS devices, and other geospatial tools across thousands of acres of prairie wetlands.',
    desc:  'Tight fit for GIS + wetland combination, and the Prairie Pothole is the single most important wetland system in North America for waterfowl — would round out Erin\'s regional and ecosystem experience nicely. Bachelor\'s eligible, AmeriCorps benefits, housing typically provided in Woodworth. Four slots = realistic odds.',
    badge: 'Strong fit',
    pills: ['GIS', 'Wetlands', 'USFWS', 'Prairie Pothole'],
    metaLine: 'SCA IP · USFWS Prairie Pothole · 4 positions · rolling',
    cycle: 'current', deadline_kind: 'rolling',
    region: 'Midwest & Great Plains',
    links: [{ href: 'https://careers.wildlife.org/job/sca-summer-internship/82043528/', label: '🔗 TWS Careers — SCA Chase Lake posting' }],
    status: SWEEP_STATUS
  },
  /* ── 10. Wilkinson Ecological MA Coastal Processes (good fit, NE coastal gap) ── */
  {
    title: 'Coastal Processes Specialist — Cape Cod estuaries & barrier beaches',
    org:   'Wilkinson Ecological Design · Orleans, MA',
    type:  'Career Position', cat: 'Career Positions',
    src:   'erin_jobs.html', src_label: 'Career Positions',
    deadline: 'Rolling (no posted close date) — posted June 4, 2026 on NAWM board',
    start: 'Rolling — once hired',
    body:  'Coastal-processes role at a small ecological-restoration design firm on outer Cape Cod, supporting living-shoreline, salt-marsh, and dune restoration projects across Massachusetts coastal sites.',
    desc:  'Good NE coastal-marine exposure for Erin, who has freshwater wetland experience but limited coastal/marine on her resume. Small firm so role is broad — fieldwork, design, permitting, GIS. No experience requirement specified; entry-level candidates with relevant degree typically welcome. Worth a direct outreach since posting is light on detail.',
    badge: 'Good fit',
    pills: ['Coastal / marine', 'Restoration', 'Salt marsh', 'Northeast'],
    metaLine: 'Career · Cape Cod · rolling',
    cycle: 'current', deadline_kind: 'rolling',
    region: 'Northeast',
    links: [{ href: 'https://www.wilkinsonecological.com/jobs', label: '🔗 Wilkinson Ecological careers' }],
    status: SWEEP_STATUS
  }
];

NEW_FINDS.forEach(rec => {
  rec.id = nextId();
  data.push(rec);
  console.log('  + ' + rec.id + ' → ' + rec.title.slice(0,68));
});

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + (raw.endsWith('\n')?'\n':''), { encoding: 'utf8' });
console.log('\n✓ ' + NEW_FINDS.length + ' record(s) added. Total: ' + data.length + '. Now run: node build.js');
