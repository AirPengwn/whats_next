/* ─────────────────────────────────────────────────────────────────────
   _ingest_sweep_jun8.js — June 8, 2026 sweep ingestion.
   8 verified new opportunities across 6 regions. Status="✨ New — June 8, 2026"
   auto-expires 21 days. Run: node _ingest_sweep_jun8.js
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs');

const FILE = 'opportunities.data.json';
const raw  = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);

const SWEEP_STATUS = { kind: 's-new', label: '✨ New — June 8, 2026' };

function nextId(){
  let max = -1;
  data.forEach(it => {
    const m = /^item-(\d+)$/.exec(it.id||'');
    if(m) max = Math.max(max, +m[1]);
  });
  return 'item-' + String(max+1).padStart(3,'0');
}

const NEW_FINDS = [
  /* 1. CDI Iowa — Conservation Wetland Specialist (Career, Midwest) */
  {
    title: 'Conservation Wetland Specialist — USDA private-lands wetland restoration',
    org:   'Conservation Districts of Iowa · West Union, IA',
    type:  'Career Position',
    cat:   'Career Positions',
    src:   'erin_jobs.html', src_label: 'Career Positions',
    deadline: 'Apply by June 15, 2026 (open until filled)',
    start: 'Rolling — immediate start once hired',
    body:  'Permanent entry-level position restoring and protecting wetlands on private Iowa farmland through USDA conservation programs in partnership with NRCS and Iowa DNR.',
    desc:  'Erin would work directly with landowners on wetland easements, restoration design support, management plans, and monitoring — exactly the kind of applied field+policy work that builds on her capstone and GIS background. Job is explicitly entry-level (0–1 yr) and lists a BS in conservation/natural resources as preferred. Pay is modest ($18.47/hr) but it\'s permanent with benefits, professional development, and mentorship from senior specialists. Apply by emailing cover letter, resume, and three references (PDF) to dien@cdiowa.org. Federal security clearance required (USDA partner).',
    badge: 'Strong fit',
    pills: ['Wetlands restoration', 'USDA / NRCS', 'Entry-level career', 'Midwest'],
    metaLine: 'Permanent · $18.47/hr · USDA partner · apply by Jun 15',
    cycle: 'current', deadline_kind: 'fixed', deadline_date: '2026-06-15',
    region: 'Midwest & Great Plains',
    links: [{ href: 'https://www.conservationjobboard.com/job-listing-conservation-wetland-specialist-west-union-iowa/5525589291', label: '🔗 Conservation Job Board listing' }],
    status: SWEEP_STATUS
  },
  /* 2. Riparia Environmental WA — Restoration Field Tech (Internship, West Coast) */
  {
    title: 'Environmental Restoration Field Technician — wetland & habitat restoration crew',
    org:   'Riparia Environmental (MacKay Sposito subsidiary) · Fife, WA',
    type:  'Internship',
    cat:   'Internships',
    src:   'erin_internships.html', src_label: 'Internships',
    deadline: 'Apply by July 3, 2026',
    start: 'Summer/fall 2026 (seasonal, schedule varies)',
    body:  'Seasonal Pacific Northwest field tech role doing wetland and upland restoration — native plantings, invasive/noxious weed control (including herbicide app), and site upkeep across WA/OR/ID/CA projects.',
    desc:  'A hands-on entry-level seasonal role with a regional environmental consultancy — solid resume-builder for restoration ecology and a way to break into PNW work. Pay is $22–$26/hr depending on experience, and full-time employees get benefits (medical/dental/vision, 401k match, PTO). Labor-intensive: bending, squatting, carrying 30–40 lb loads (up to 90 occasional). Good fit for Erin\'s restoration ecology and wetlands interests, and a route into the West Coast region. Apply through Riparia\'s career page; entry-level (0–1 yr) acceptable.',
    badge: 'Good fit',
    pills: ['Restoration ecology', 'Wetlands', 'Native plants', 'Pacific NW'],
    metaLine: 'Seasonal · $22–26/hr · Fife WA · apply by Jul 3',
    cycle: 'current', deadline_kind: 'fixed', deadline_date: '2026-07-03',
    region: 'West Coast / Pacific',
    links: [{ href: 'https://riparia.applytojob.com/apply/XqISOjZS5C/Environmental-Restoration-Field-Technician', label: '🔗 Riparia Environmental careers' }],
    status: SWEEP_STATUS
  },
  /* 3. GBI / USFWS Moapa Valley NWR Restoration Tech (Internship, Southwest) */
  {
    title: 'Restoration Technician — Moapa Valley NWR (USFWS partnership)',
    org:   'Great Basin Institute / USFWS · Moapa Valley, NV',
    type:  'Internship',
    cat:   'Internships',
    src:   'erin_internships.html', src_label: 'Internships',
    deadline: 'Apply by June 24, 2026',
    start: 'Summer 2026 (temporary)',
    body:  'Temporary field tech with Great Basin Institute supporting USFWS habitat restoration at Moapa Valley NWR in southern Nevada — work on threatened desert spring/wetland ecosystems.',
    desc:  'Entry-level (0–1 yr) GBI placement at one of the Mojave\'s most ecologically distinctive refuges — the Moapa dace and warm-spring wetlands. Good fit for Erin\'s wetland and environmental-justice interests, and gives Southwest regional spread plus a USFWS resume line. Pay is $17.75/hr (temporary). GBI typically provides housing or housing stipend; verify in posting. Apply through Conservation Job Board / GBI portal.',
    badge: 'Solid fit',
    pills: ['Wetlands', 'USFWS', 'Restoration', 'Southwest'],
    metaLine: 'Temporary · $17.75/hr · NV desert wetlands · apply by Jun 24',
    cycle: 'current', deadline_kind: 'fixed', deadline_date: '2026-06-24',
    region: 'Southwest',
    links: [{ href: 'https://www.conservationjobboard.com/category/wetland-jobs', label: '🔗 Conservation Job Board · GBI listing' }],
    status: SWEEP_STATUS
  },
  /* 4. EDR — Seasonal Field Tech (Career, Northeast) */
  {
    title: 'Seasonal Field Technician — wetland delineation & ecological surveys',
    org:   'EDR (Environmental Design & Research, DPC) · Syracuse NY / Hershey PA / Columbus OH',
    type:  'Career Position',
    cat:   'Career Positions',
    src:   'erin_jobs.html', src_label: 'Career Positions',
    deadline: 'Contact-first — review begins immediately; verify with EDR HR',
    start: 'Summer 2026, ongoing',
    body:  'Seasonal field technician supporting wetland delineations and ecological surveys across EDR\'s three Northeast/Midwest offices, paying $21.63–$26.44/hr.',
    desc:  'Posted June 5, 2026 on the Texas A&M Natural Resources Job Board. EDR is a respected environmental + landscape-architecture firm with offices in Syracuse, Hershey, and Columbus — this seasonal role is a typical first-job-in-consulting entry point. Wetland delineation experience is one of the most marketable skills in environmental consulting, and Erin\'s BS background fits the hire profile. Hourly pay is strong for a seasonal role. Reach out to EDR HR (edrdpc.com/our-firm/career-opportunities) directly; deadline not posted publicly. Gives Northeast spread.',
    badge: 'Strong fit',
    pills: ['Wetland delineation', 'Consulting', 'Field surveys', 'Northeast'],
    metaLine: 'Seasonal · $21.63–26.44/hr · NY/PA/OH · contact EDR HR',
    cycle: 'current', deadline_kind: 'contact-first',
    region: 'Northeast',
    links: [{ href: 'https://jobs.rwfm.tamu.edu/search/?keywords=EDR&sort-by=PostingDate', label: '🔗 Texas A&M Natural Resources Job Board' }],
    status: SWEEP_STATUS
  },
  /* 5. CCMI / MN DNR Elbow Lake — Habitat Enhancement Crew (Service, Midwest) */
  {
    title: 'Habitat Enhancement Crew Member — prairie/wetland restoration with MN DNR',
    org:   'Conservation Corps Minnesota & Iowa / MN DNR Wildlife · Elbow Lake, MN',
    type:  'Service / Corps',
    cat:   'Service & Fellowships',
    src:   'erin_service.html', src_label: 'Service & Fellowships',
    deadline: 'Rolling — contact CCMI; posted June 5, 2026',
    start: 'Summer/fall 2026',
    body:  'AmeriCorps habitat crew member with MN DNR Wildlife, working on prairie, wetland, and forest habitat enhancement projects in west-central Minnesota.',
    desc:  'Posted June 5, 2026 on Texas A&M\'s job board with pay $25.95–$29.93/hr — high for a corps placement. The crew supports MN DNR construction, restoration, and enhancement on public lands. Good Midwest regional spread for Erin, plus hands-on prairie/wetland restoration experience that complements her watershed background. Apply through Conservation Corps Minnesota & Iowa.',
    badge: 'Good fit',
    pills: ['Wetlands & prairie', 'AmeriCorps', 'Restoration', 'Midwest'],
    metaLine: 'AmeriCorps · $25.95–29.93/hr · MN DNR · rolling',
    cycle: 'current', deadline_kind: 'rolling',
    region: 'Midwest & Great Plains',
    links: [{ href: 'https://conservationcorps.org/updates-stories/habitat-enhancement-crew-member-mn-department-of-natural-resources-elbow-lake-mn/', label: '🔗 Conservation Corps MN & IA posting' }],
    status: SWEEP_STATUS
  },
  /* 6. Stewards / USFWS Region 4 — LiDAR Monitoring Tech (Service, Southeast) */
  {
    title: 'LiDAR Monitoring Technician — USFWS Region 4 (AmeriCorps placement)',
    org:   'Stewards Individual Placement (Conservation Legacy) / USFWS · Crawfordville, FL',
    type:  'Service / Corps',
    cat:   'Service & Fellowships',
    src:   'erin_service.html', src_label: 'Service & Fellowships',
    deadline: 'Rolling — applications reviewed as received',
    start: 'Rolling start, 2026 service term',
    body:  'AmeriCorps individual placement with USFWS in the Florida panhandle using LiDAR data to monitor refuge habitat and inform management.',
    desc:  'A rare GIS/remote-sensing-forward corps placement — directly leverages Erin\'s GIS coursework and multi-criteria suitability work. AmeriCorps benefits include living stipend plus education award on completion. Southeast region (Apalachicola/St. Marks NWR area). Good resume signal for an eventual federal Pathways or grad school remote-sensing track. Apply via Conservation Legacy portal; positions fill on rolling basis so apply early.',
    badge: 'Strong fit',
    pills: ['GIS & remote sensing', 'USFWS', 'Habitat monitoring', 'Southeast'],
    metaLine: 'AmeriCorps · LiDAR · USFWS · rolling',
    cycle: 'current', deadline_kind: 'rolling',
    region: 'Southeast & Appalachia',
    links: [{ href: 'https://stewardslegacy.org/open-positions', label: '🔗 Stewards Individual Placement open positions' }],
    status: SWEEP_STATUS
  },
  /* 7. Utah State University PhD — Mule Deer (Grad, Mountain West) */
  {
    title: 'Utah State University — Funded PhD, Landscape Fitness & Migratory Connectivity (Mule Deer)',
    org:   'Logan, UT · Wildland Resources (with BYU & Utah DWR)',
    type:  'Graduate Program',
    cat:   'Funded Graduate Programs',
    src:   'erin_programs.html', src_label: 'Funded Graduate Programs',
    deadline: 'Apply by August 31, 2026',
    start: 'Fall 2026 or Spring 2027',
    body:  'Four-year fully funded PhD studying mule deer energetics and migratory connectivity across Utah landscapes — $28,000/yr stipend plus tuition waiver.',
    desc:  'Posted June 5, 2026. Heavy fieldwork plus GIS/spatial analysis component — solid match for Erin\'s GIS and ecology interests, and gives Mountain West regional spread. Mule deer focus is somewhat outside her core wetland/water themes, so it\'s a stretch on subject fit but a strong package: 4 years funding, tuition waiver, applied state-agency partnership (Utah DWR). Worth a reach application if she wants to develop wildlife/GIS skills in big-landscape ecology. Contact USU Wildland Resources or the listed PI through jobs.rwfm.tamu.edu.',
    badge: 'Reach / review — wildlife focus outside core themes but strong GIS + funding fit',
    pills: ['Wildlife ecology', 'GIS & remote sensing', 'Landscape connectivity', 'Mountain West'],
    metaLine: 'Funded PhD · $28k/yr · 4 yrs · apply by Aug 31',
    cycle: 'current', deadline_kind: 'fixed', deadline_date: '2026-08-31',
    region: 'Mountain West',
    links: [{ href: 'https://jobs.rwfm.tamu.edu/', label: '🔗 Texas A&M NR Job Board (search USU mule deer)' }],
    status: SWEEP_STATUS
  },
  /* 8. LSU Entomology — PhD Conservation Ecology (Grad, Southeast) */
  {
    title: 'Louisiana State University — Funded PhD, Conservation Ecology (Entomology)',
    org:   'Baton Rouge, LA · Department of Entomology',
    type:  'Graduate Program',
    cat:   'Funded Graduate Programs',
    src:   'erin_programs.html', src_label: 'Funded Graduate Programs',
    deadline: 'Apply by October 15, 2026',
    start: 'Spring 2027',
    body:  'Funded PhD in LSU\'s Entomology Dept with a conservation-ecology focus — assistantship $30,667/yr with non-resident tuition waiver and standard benefits.',
    desc:  'Posted on the Texas A&M Natural Resources Job Board in early June 2026. Although housed in Entomology, the project is conservation-ecology framed — good for Erin if she\'s open to insect-pollinator or aquatic-insect angles on ecosystem health (a real growth area in EJ/restoration work). LSU\'s Baton Rouge programs give her another Southeast option to pair with the LSU WABL/Coastal records she\'s already considering. Reach out to potential advisors before applying — funding is tied to specific faculty.',
    badge: 'Reach / review — verify specific advisor + project fit before applying',
    pills: ['Conservation biology', 'Ecology', 'Entomology', 'Southeast'],
    metaLine: 'Funded PhD · $30,667/yr · non-res tuition waiver · apply by Oct 15',
    cycle: 'current', deadline_kind: 'fixed', deadline_date: '2026-10-15',
    region: 'Southeast & Appalachia',
    links: [{ href: 'https://www.lsu.edu/agriculture/entomology/programs/doctorate.php', label: '🔗 LSU Entomology PhD program' }],
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
