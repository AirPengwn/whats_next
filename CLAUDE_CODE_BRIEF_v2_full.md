# What's Next — v2.0 · Full redesign brief for Claude Code

**Status:** ready for Claude Code · **Ships as:** **v2.0 onward** (current live build is v1.03)
**Type:** UI / visual refactor. The product, data, sync, and gating are correct — this changes how the site *looks*, not what it does.
**Source of truth for the target look:** `Mockups.html` (canvas, §01–§09) + `Design Review.html` (the argument for each). When a mockup and prose disagree, **the mockup wins.**

> **Already shipped:** §06 card discipline / the **Fit pill** (see `CLAUDE_CODE_BRIEF_v2.md`). It's listed below for completeness but is done — don't redo it.

---

## ⛔ 0. Hard guardrails — read before every change

- **Pure UI.** Do **not** modify any data schema, `localStorage` key name, JSONbin field, or the primary-device gating. After your changes, an existing user on Erin's primary laptop must see every saved opportunity, application, note, status, reference, professor, and writing sample exactly as before. New UI state (a collapse flag, a view toggle) gets a **new** key namespaced `erin_ui_<thing>_v1`, read with a safe fallback, never added to `BACKUP_MAP`.
- **Don't touch the data pipeline.** No `node build.js`. `opportunities.data.json` / `opportunities.js` / `.opp_snapshot.json` are out of scope.
- **Browse card text is frozen.** The 4 Browse pages (`erin_programs / erin_internships / erin_jobs / erin_service`) are **generated** and carry byte-identical card copy. Restyle **page chrome + chip classes/CSS only**; regenerate via `node _gen_typepages.js` (inputs: `_nav_block.txt`, `_theme_block.txt`, `_ml_block.txt`, `_engine_css.txt`, `_engine_src.txt`) — never hand-edit the 4 HTML files.
- **Keep:** the forest-green dark theme, the four-signal urgency colors (red/amber/teal/blue), the Track/Browse/Write IA, the sync chip, the read-only banner, auto-snapshots, and the priority engine logic. These are good — this brief styles around them, it doesn't replace them.
- **Diff smell test:** if a PR's JS diff is bigger than its CSS diff, you're probably violating a guardrail. Stop and re-read.

One PR per phase; one page per PR in Phase 4.

---

## Phase 1 — Foundations (highest leverage, ~half a day)

### 1.1 · Warm the light theme  — §01
Today's light theme is flat cool grey; dark mode has all the character. Shift the three light greys ~2–3% warm toward parchment and warm the ink. Edit `styles.css` only, in **both** light blocks (`:root` and `html:not(.dark)`):

```css
--bg:#faf6ec;   /* card  (was #FAFAFA) */
--bg2:#f4efe4;  /* subtle (was #F5F5F5) */
--bg3:#ece6d8;  /* page  (was #EEEEEE) */
--t1:#211d16;   /* ink   (was #212121) */
--t2:#46412f;   /* (was #424242) */
--t3:#736c58;   /* (was #757575) */
--bd:rgba(40,30,12,0.13); --bds:rgba(40,30,12,0.24);
```
Do **not** touch the signal-color tokens or the dark blocks. Re-check WCAG AA at 14px after.

### 1.2 · Lead Home with the briefing — §04
`index.html` + `index`'s collapse script. The "What to do this week" dashboard is the reason the site exists and it currently ships **collapsed** under the bio hero and a 19-tile link farm.
- Default the dashboard **open** (flip the `erin_pd_collapsed` default to open; keep the toggle so it can still be collapsed — it's already a device-only UI pref, fine to keep).
- **Remove the full biography hero from Home.** It already lives at `erin_bio.html`; link to it from a single "Profile" entry, don't reprint it.
- **Replace the 19-tile "Navigate to a section" grid** with a slim grouped directory (or drop it — the nav covers it). See `home-after` in the mockup.
- Keep the priority engine (`priority.js`) untouched — only its placement/prominence changes.

### 1.3 · Type-scale floor — §02
`styles.css`. Nothing renders below **12.5px**. Bump every 9–11px instance (group labels at 9px, pills/meta at 10–11px) up half a step; set body to 15–16px; introduce a real 16/19 mid-step. Add a `:focus-visible` ring while you're in here if one isn't present: `outline:2px solid var(--teal-t);outline-offset:2px`.

---

## Phase 2 — The system (a few days)

### 2.1 · Serif-for-documents / sans-for-cabinet — §02
Add Newsreader via `<link>` (`Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..500`) and define `--serif`, keep the system `--fn` as the sans, add `--mono` (IBM Plex Mono) for labels/eyebrows/data. Apply `--serif` to page titles + body on the **document** pages (Home headings, Bio, SOP/Outreach, Materials, Writing, Packet). **Cabinet** pages (My List, Pipeline, Timeline, Applications, Compare, Browse, trackers) stay sans. Labels/eyebrows → mono.

### 2.2 · Two width tokens — §05
`styles.css`. Replace the five ad-hoc page widths (currently 720 / 760 / 820 / 900 / 1000 scattered across pages) with two:
```css
--w-doc:720px;  --w-cab:1080px;
```
Apply `--w-doc` to Home, Bio, SOP/Outreach, Materials, Writing, Packet. Apply `--w-cab` to My List, Compare, Pipeline, Timeline, Applications, the 4 Browse pages, Profs, Refs, Archive. Remove the per-page `style="max-width:…"` overrides.

### 2.3 · Calm the navigation — §03
The nav (defined in `styles.css` `.global-nav` + emitted in each page's header markup; active-state logic in `site.js`). Collapse the 17-link wrapping emoji bar to a single row: **wordmark left · three group tabs (Track / Browse / Write) center · utilities (search, theme, sync, version) right.** The active group highlights. The group's **sub-links move onto the page** as an on-page sub-nav strip (see `nav-after`), not stacked permanently in the header.
- This is the largest chrome change — it touches the header block on every page. Consider centralizing the header into one template/partial if it isn't already, to avoid 20 hand-edits.
- Preserve `site.js`'s active-link logic, the sync chip dock, and the read-only banner insertion point.

### 2.4 · Line-icon set — §07
Drop a single-weight inline-SVG icon set into one shared file (e.g. `icons.js`, or inline in the nav render). Replace every emoji used as a **nav glyph** or **section glyph** with its SVG equivalent (one stroke, inherits text color). **Keep** emoji where they carry feeling: ✨ on NEW pills, 🎯 on "What to do this week". The 20-glyph set in `Mockups.html` §07 is the reference.

### 2.5 · Card discipline / Fit pill — §06  ✅ DONE
Shipped per `CLAUDE_CODE_BRIEF_v2.md`: emphasized pills capped at **three** (urgency · saved · **fit**), everything else neutral; weak/reach fits stay quiet. Listed here only so the phase map is complete.

---

## Phase 3 — Identity finish (~half a day)

- **Warm-theme polish** — verify the parchment holds across every page once §1.1 + §2.x land; fix any card/border that still reads cool.
- **A small wordmark** — optional. A quiet serif mark, 24–28px, beside "What's Next" in the header. Decorative only, no nav function.

---

## Phase 4 — The cabinet pages (one PR each) — §08

Each applies Phases 1–3 plus the page-specific layout in the mockup. Do one end-to-end, ship, then the next.

- **4a · Pipeline** (`erin_pipeline.html`) — keep the funnel summary + 6-column board; give it `--w-cab` so the columns stop being slivers, and more air between cards. Mostly a width/spacing fix. Ref: `Mockups.html` §08 `pipeline`.
- **4b · Timeline** (`erin_timeline.html`) — make a **month calendar** the default view (clustering + quiet weeks visible at a glance); the current chronological list becomes a toggle (store the choice in `erin_ui_timeline_view_v1`). Ref: `timeline`.
- **4c · Compare** (`erin_compare.html`) — a proper **data table**: opportunities as columns, attributes (funding, deadline, location, region, fit, recommenders, status) as rows; chips drive which saved items are compared. Ref: `compare`.
- **4d · Applications** (`erin_applications.html`) — `--w-cab` + a two-column detail: the application left (status pipeline + materials checklist + notes), a **sidebar of linked trackers** right (next deadline, recommenders w/ count, linked materials). Ref: `apps`.
- **4e · Outreach / SOP** (`erin_outreach.html`) — generator/draft promoted above the fold; serif body for the draft itself (document page → `--w-doc` + `--serif`).
- **4f · Bio** (`erin_bio.html`) — already exists; bring it to document width + serif body and make sure Home's Profile link points here.

---

## Dark mode — §09 (verify, don't rebuild)

The two-theme model stays: warm parchment light **+** forest-green dark. Every change above must be checked in **both** themes. The dark tokens already exist; new tokens (`--fit*`, any warm-light additions) need a dark counterpart in the `@media(prefers-color-scheme:dark)` and `html.dark` blocks. `Mockups.html` §09 shows Home, cards, Pipeline, and Applications in dark as the target.

---

## Acceptance test — run on every PR (primary laptop)

1. My List, Applications, Profs, Refs, Materials, Writing, Archive — every saved row/status/note preserved.
2. The primary-device chip still says "primary" (not "view-only"); a secondary device is still read-only and sees the same data.
3. Theme toggle persists across reload; **both** themes pass WCAG AA at 14px+.
4. JSONbin record shape unchanged (`items`, `apps`, `archiveLog`, `profs`, `refs`, `materials`, `writingSamples`).
5. Browse card **text** byte-identical to v1.03 (only chrome/classes/colors changed).
6. No page renders text below 12.5px; document pages read in serif, cabinet pages in sans.

If any data check regresses, the PR is rejected regardless of how good it looks.

---

## Versioning

Tag the line **`2.0`** and bump `WN_VERSION` to `2.0` as these phases land. v2.0 is the new baseline: warm light + forest dark, serif/sans split, two width tokens, calm three-group nav, line icons, three-pill cards. The original v1.x two-pill / grey-theme / 17-link-nav spec is superseded.
