# What's Next — v2.1 · Polish-pass brief for Claude Code

**Status:** ready for Claude Code · **Ships on top of:** build **2.11** (the v2.0 redesign is live and correct)
**Type:** Pure UI polish. This closes the four "finer list" items from the **Design Review (v2.0 re-audit)** — the things that kept the site at A− instead of A. None are structural; the whole brief is an afternoon.
**Source of truth:** `Design Review — v2.0.html` §05 ("What's left"). The original look targets still live in `review2026/Mockups.html`.

> **Out of scope on purpose:** the phone-nav "More" collapse from the re-audit. The site isn't meant for a phone app; the existing <680px collapse is fine. Don't build it.

---

## ⛔ 0. Hard guardrails — unchanged from v2.0, re-read them

- **Pure UI.** Do **not** modify any data schema, `localStorage` key name, JSONbin field, the `app.status` string values, or the primary-device gating. Every change here is CSS or presentational JS. New UI state gets a **new** key namespaced `erin_ui_<thing>_v1`, read with a safe fallback, never added to `BACKUP_MAP`.
- **Don't touch the data pipeline.** No `node build.js`. `opportunities.data.json` / `opportunities.js` / `.opp_snapshot.json` are out of scope. **This matters for Phase A** — see the frozen-emoji note.
- **Browse card text is frozen.** The 4 Browse pages are generated; restyle chrome/classes only, regenerate via `node _gen_typepages.js`, never hand-edit the 4 HTML files.
- **Keep:** the warm-light + forest-dark themes, the four-signal urgency colors, the Track/Browse/Write IA, the compact 3-group nav, the serif/sans/mono split, the `icons.js` line-icon set, the sync chip, and the read-only banner.
- **Diff smell test:** if a PR's JS diff is bigger than its CSS diff, you're probably violating a guardrail. Stop and re-read.

One PR per phase.

---

## Phase A — Finish the emoji sweep

The nav and sub-nav are clean line-SVG now, but a handful of emoji still loiter in the **chrome** (not the data). Finish what Phase 2.4 started: the `icons.js` set is already loaded on every page (`window.WN_ICONS`), so most of this is `el.innerHTML = WN_ICONS.calendar()` swaps.

### A.1 · KEEP these — they carry emotional charge (per the v2.0 brief)
- **✨ on NEW / Updated pills** — `bx-new` spans + the `FRESH` arrays in `erin_mylist.html` and the generated Browse engine. Leave them.
- **🎯 on "What to do this week"** — `index.html` `.pd-title` (≈ line 275, `&#127919;`). This is the one section glyph the brief explicitly keeps. Leave it.

### A.2 · DO NOT TOUCH — frozen Browse-card data
`opportunities.data.json` contains `✨` (in `s-updated` / `s-new` status labels) and `📅` (in deadline-row `label` fields). These render into Browse cards and are **byte-frozen** by the guardrail above. They are out of scope. Do not "clean them up."

### A.3 · CONVERT or DROP these chrome emoji
Replace each with the matching `WN_ICONS` glyph (inherits `currentColor`, 1.5px stroke), or drop it if the surrounding color/label already carries the meaning:

| File · location | Emoji | Action |
|---|---|---|
| `erin_timeline.html` ≈L330 `calTip.innerHTML` | 🔶 (`&#128310;`) | **Drop** — the legend already shows the colors. |
| `erin_applications.html` ≈L263 `.tip` | 🎯 (`&#127919;`) | This is a tip-box section glyph, **not** the dashboard. Convert to `WN_ICONS.clipboard()` or drop. |
| `priority.js` ≈L96 timeline-footer link | 📅 | Convert to `WN_ICONS.calendar()`. |
| `priority.js` ≈L39 deadline action row | 📅 | Convert to `WN_ICONS.calendar()`. |
| `priority.js` ≈L38 urgent action row | ⏳ | **Judgment call** — carries time-pressure feeling. Keep, *or* add a `clock` glyph to `icons.js` and convert. Don't leave it half-converted next to a line-icon 📅. |
| `priority.js` ≈L81, L103 empty states | ✅ | **Judgment call** — "all caught up" is a positive beat. Keep, *or* add a `check` glyph to `icons.js`. |

- **Sweep the rest:** grep the page HTML and `priority.js` for any remaining `.tip` / section-header glyphs (`&#127919;` etc.) and apply the same rule — line icon for structure, keep only where it's genuinely a felt beat.
- `icons.js` currently has no `clock` or `check`; add them (same 18px viewBox, 1.5px stroke) only if you decide to convert ⏳ / ✅. Keep the set single-weight.

**Acceptance:** no emoji remain as a *nav glyph* or *section glyph* anywhere in the chrome; ✨-on-pills and 🎯-on-dashboard survive; `opportunities.data.json` is untouched; both themes still render the icons in `currentColor`.

---

## Phase B — Give the Timeline dots a non-color encoding

`erin_timeline.html`. The month calendar is color-only: a colorblind user can't separate "within 30 days" from "within 90." Add a **shape/size** channel alongside the hue.

- Targets: `.cal-dot` (≈L48) and `.leg-dot` (≈L59), plus the urgency classes `.ld-urgent` (`#e53935`), `.ld-soon` (`#fb8c00`), `.ld-ok`, `.ld-future`.
- Keep the colors. Add a second cue, e.g.:
  - `.ld-urgent` — solid fill, **6px** (largest)
  - `.ld-soon` — solid fill, 5px
  - `.ld-ok` — **hollow ring** (transparent center, 1.5px colored border)
  - `.ld-future` / past — small hollow grey
- Apply the **same** treatment to `.leg-dot` so the legend teaches the shapes, and update the legend labels if helpful (the legend is built at ≈L308–311).
- While here: drop the 🔶 from `calTip` (also covered in Phase A).

**Acceptance:** the calendar is legible in greyscale; legend and calendar dots use the identical shape language; AA contrast unaffected.

---

## Phase C — Calm the Compare selection grid

`erin_compare.html`. The "Choose up to 4" selection grid is heavier than the comparison it produces (same note as the very first audit).

- Once a comparison is active (≥2 items selected and the table rendered), **collapse the selection grid to a compact chip strip** — one chip per selected item with an ✕ to deselect, plus a quiet "Edit selection" / "+ Add" affordance that reopens the full grid.
- On first load (nothing selected) the full grid stays as-is — it's the right call when empty.
- Preserve the existing multi-select logic and the 4-item cap; this is a presentational collapse, not a rewrite. Persist the open/closed state in `erin_ui_compare_picker_v1` if you want it to survive reload (optional; safe-fallback to open).

**Acceptance:** selecting 2+ items shrinks the chooser to a strip and the table becomes the dominant element on the page; deselect/edit still works; no change to which attributes compare.

---

## Phase D — Finish the Apps detail (next-deadline) + consolidate status color

`erin_applications.html`. Two related fixes; ship together.

### D.1 · Add the missing "Next deadline" to the sidebar
The right-hand sidebar already exists and carries **Materials count · Status · Linked contact** (the `.sb-sec` blocks built at ≈L708–712). The one Phase-4d element still missing is the **next deadline**.
- Add a `.sb-sec` (ideally first in the sidebar) labelled **Next deadline**: read `app.deadline`, compute days-remaining, render e.g. `Mar 1, 2027 · 28d`.
- Color it with the existing urgency logic; reuse `.sb-val.sb-ok` and the `.sb-val.sb-past` (line-through) styles that are already defined.
- Read-only field — no new input, no schema change.

### D.2 · Consolidate the status *color*, not the stages
Nine statuses currently wear nearly nine hues (`.ps-*` ≈L68–76 and the `.app-card.status-*` left-borders ≈L95–102). The three cool mid-stages — **Submitted / Under review / Interview** — are indistinguishable, and it's the exact "too many hues" problem the opportunity-card discipline already solved elsewhere.
- **Keep all nine labels and all nine `app.status` string keys** (`notstarted`, `gathering`, … — these are persisted data; do not rename. `STATUS_ORDER` / `STATUS_LABELS` / `STATUS_CSS` keys stay).
- Demote the **six in-progress stages** (`notstarted, gathering, submitted, review, interview, decision`) to **one quiet family** — neutral hairline chip, like `.neutral-chip` in `styles.css`. Position in the arrow sequence already says which stage you're at.
- Reserve saturated **signal color for the three outcomes** that demand a reaction: `accepted` (green), `declined` (red), `waitlisted` (amber). Their left-border accents stay too.
- This is a pure restyle of the `.ps-*` and `.app-card.status-*` rules — no JS logic, no data.

**Acceptance:** the status legend reads as "one quiet pipeline → three loud outcomes"; the mid-stages no longer compete on color; every saved application still shows its correct stage and the card border still flags the three outcomes.

---

## Acceptance test — run on every PR (primary laptop)

1. My List, Applications, Profs, Refs, Materials, Writing, Archive — every saved row / status / note preserved.
2. Primary-device chip still says "primary"; a secondary device is still read-only and sees the same data.
3. Both themes pass WCAG AA at 14px+; the Timeline calendar is legible in greyscale.
4. JSONbin record shape unchanged (`items`, `apps`, `archiveLog`, `profs`, `refs`, `materials`, `writingSamples`); `app.status` values unchanged.
5. Browse card **text** byte-identical to 2.11; `opportunities.data.json` untouched.
6. No emoji remains as a nav/section glyph in the chrome; ✨-on-pills and 🎯-on-dashboard survive.

If any data check regresses, the PR is rejected regardless of how good it looks.

---

## Versioning

Polish pass, not a new baseline — bump `WN_VERSION` one point release per your scheme (these are touch-ups on the v2.0 line). The re-audit's grade target for finishing all four phases is **A−→A**.
