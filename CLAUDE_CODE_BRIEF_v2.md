# What's Next — v2.0 · Card discipline update (add the **Fit** pill)

**Status:** ready for Claude Code · **Ships as:** **v2.0 onward** (current live build is v1.03)
**Type:** small, pure-UI refactor · mostly CSS + a few lines in the shared render engine
**Companion artifacts:** `Design Review.html` (§06) and `Mockups.html` (§06 `card-after`, §09 `dark-card`) — the mockups now show the three-pill rule.

---

## 1. What's changing (and why)

The redesign caps **emphasized (color-filled) pills at two per card** — *urgency* and *saved*. This update raises the cap to **three** and gives the third slot to **Fit**.

Rationale: when Erin triages a long opportunity list, the single most decision-useful signal after "is it urgent?" and "have I saved it?" is "how good a match is it?" — the `badge` fit tier (Exceptional / Strong / Good / Solid / Reach / Weak). Today that tier is buried among the neutral chips. Promoting it to a colored pill is the difference between scanning for fit and reading for it.

**The rule, restated for v2.0:**

> A card may show **up to three emphasized pills — urgency, saved, and fit.** Everything else (category, region, cycle, type, funding, etc.) is a **neutral hairline chip** (border, no fill). Fit uses **one consistent hue** with the tier in the label, so it reads as a single signal, not a rainbow.

**One honesty rule:** a weak fit should not wear a confident badge. Tiers **Exceptional / Strong / Good / Solid → blue fit pill.** Tiers **"Reach" / "Weak fit — review" → stay a neutral (or amber-outline) chip.** A long shot must never look like a strong match.

---

## ⛔ 2. Guardrails (unchanged from the standing brief)

- **Pure UI.** Do not modify any data schema, `localStorage` key, JSONbin field, or the primary-device gating. No data migration — the `badge` field already exists on every opportunity record; we are only restyling how it renders.
- **Browse card text is frozen.** The 4 Browse pages (`erin_programs / erin_internships / erin_jobs / erin_service`) carry golden-gated, byte-identical card text. You may change **chip classes and CSS only** — never the card copy. And these pages are **generated**: edit the engine source and regenerate, do **not** hand-edit the 4 HTML files (see §4).
- **No new build step, no `node build.js`.** This touches static chrome/render code, not the opportunity data pipeline.

---

## 3. Design tokens to add (`styles.css`)

Add a dedicated fit hue so it's distinct from the existing `--blue` (which is used for links and the Browse group label). Put it next to the other accent tokens, in **all three** theme blocks (`:root` / `html:not(.dark)` light, and `@media(prefers-color-scheme:dark)` + `html.dark`).

```css
/* light */
--fit:#2f5f88; --fit-bg:#e2ecf3; --fit-t:#2f5f88;
/* dark  */
--fit-bg:#1e3535; --fit-t:#9ec3dd;
```

Pill class (shared):

```css
.fit-pill{font-size:11px;font-weight:600;padding:2px 9px;border-radius:999px;
  background:var(--fit-bg);color:var(--fit-t);white-space:nowrap;line-height:1.5}
/* weak/reach fits stay quiet, never a confident fill */
.fit-pill.fit-weak{background:transparent;color:var(--t3);border:1px solid var(--bds)}
```

> AA check: verify `--fit-t` on `--fit-bg` passes WCAG AA at 11px/600 in both themes before shipping.

---

## 4. Where to make the render change

The fit/`badge` value is currently emitted as one of the neutral chips. Promote it to the `.fit-pill` and **remove it from the neutral chip group** so it isn't shown twice.

1. **Shared Browse render engine** — `_engine_src.txt` (+ `_engine_css.txt` for the class). Find where the card chips are built (the same place that already renders `.bx-urg` urgency and `.bx-saved`). Add a fit-pill render keyed off the record's `badge`, with the weak-tier branch:
   - tier matches `/exceptional|strong|good|solid|top recommendation/i` → `.fit-pill`, label = short tier ("Exceptional fit", "Strong fit", …).
   - tier matches `/reach|weak/i` → `.fit-pill.fit-weak` (or leave as a neutral chip), label "Reach" / "Review".
   - Exclude the fit value from the neutral-chip list so it appears once.
2. **Regenerate the 4 Browse pages** — `node _gen_typepages.js` (inputs: `_nav_block.txt`, `_theme_block.txt`, `_ml_block.txt`, `_engine_css.txt`, `_engine_src.txt`). Do **not** hand-edit the generated `erin_*.html`.
3. **My List** (`erin_mylist.html`) — saved opportunity cards render here too. Apply the same promote-fit-to-pill change in its card renderer, and demote its category/region/type chips to neutral to match the v2.0 rule.
4. **Audit the colored chips elsewhere** for the broader v2.0 card-discipline pass (Pipeline mini-cards, Compare) — but the *Fit pill* itself only needs to land where the fit/`badge` tier is shown (Browse + My List).

---

## 5. Effort

| Task | Est. |
|---|---|
| `--fit*` tokens + `.fit-pill` CSS (3 theme blocks) | ~30 min |
| Engine render: promote fit, weak-tier branch, de-dupe chip | ~1 hr |
| Regenerate + visually diff the 4 Browse pages | ~30 min |
| My List card renderer parity | ~45 min |
| Contrast/AA check + both-theme screenshots | ~30 min |
| **Total** | **~half a day** |

Diff should be mostly CSS + ~10–20 lines of render logic. If the JS diff is larger than the CSS diff, you're probably touching something the guardrail forbids — stop and re-read §2.

---

## 6. Acceptance test

On Erin's primary laptop, after the change:

1. A Browse card with `badge:"Exceptional…"` shows exactly **three** colored pills — urgency (if dated), saved (if saved), and a **blue Fit pill** — and **no duplicate** fit value among the neutral chips.
2. A card with `badge:"Reach…"` / `"Weak fit — review"` shows the fit as a **neutral/quiet** chip, never a confident blue pill.
3. Category, region, cycle, type, funding are all **neutral hairline chips** (no fill).
4. The four-signal urgency colors (red/amber/teal/blue deadlines) are unchanged.
5. Both themes pass WCAG AA on the new pill at 11px.
6. **Data untouched:** every saved opportunity, note, application, status, reference, and writing sample is exactly as before; the JSONbin record shape is unchanged; the primary-device chip still says "primary."
7. Browse card **text** is byte-identical to v1.03 (only classes/colors changed).

---

## 7. Versioning

This is the first card-discipline change of the redesign line. **Tag the release `2.0`** and treat **v2.0 as the baseline going forward** — the three-pill rule (urgency · saved · fit) is now the canonical card spec; the two-pill rule from the original review is superseded. Update `WN_VERSION` to `2.0` when this and the rest of the §06 card-discipline pass land.
