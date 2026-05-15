## Goal

Make the `view` toggle (For professionals / For employers) drive the entire pricing page narrative — not just the plan card. Each section should speak directly to the active audience with its own headline, subcopy, CTA, and FAQ default.

## Sections that adapt

For every block below, define a small `COPY` map keyed by `view`. No new sections, no new data — only copy, CTA labels, and CTA destinations swap.

1. **Hero (`Band tone="blue"`)**
   - Eyebrow: `Pricing for professionals` / `Pricing for employers`.
   - Headline:
     - pro → "Free for talent. Always." (orange accent on "Always.")
     - biz → "Built for the companies hiring next." (orange accent on "hiring next.")
   - Lede:
     - pro → "Build your profile, prove your skills, and get found by Caribbean employers — at zero cost."
     - biz → "Reach certified, verified Caribbean talent on a commitment that fits your hiring cycle."
   - Tab switcher unchanged.

2. **Comparison band**
   - Eyebrow + Display swap:
     - pro → eyebrow "What you get free", display "Everything you need to get hired."
     - biz → eyebrow "What's in every plan", display "Every hiring tool, one price."

3. **Trust strip (`Band tone="orange"`)**
   - pro → headline "Get certified. Get seen.", lede "One exam unlocks lifetime visibility to employers actively hiring on Lansa.", CTA `Create your free profile` → `/signup`.
   - biz → headline "Hire only verified talent.", lede "Every candidate on Lansa has passed an industry exam, so your shortlist starts qualified.", CTA `Talk to our team` → `/for-business`.

4. **FAQ band**
   - Default `faqFilter` follows `view` (pro → "pro", biz → "biz"). The user can still override via the existing pill row, which stays visible.
   - Use a `useEffect` on `view` to reset `faqFilter` to the matching audience when the user switches tabs.
   - Eyebrow + Display swap:
     - pro → "Questions from professionals" / "Your questions, answered."
     - biz → "Questions from employers" / "Hiring on Lansa, explained."

5. **Tab persistence (small UX upgrade)**
   - Read `?audience=biz|pro` from the URL on mount so deep links land in the right context. Update the param when the tab changes (no full reload). Falls back to `pro`.

## Out of scope

- No data/feature list edits — those already live per-audience.
- No new Bands, no layout changes, no new images.
- SEO `title`/`description`/JSON-LD remain unchanged (FAQ schema still emits all questions).

## Files

- `src/pages/Pricing.tsx` — add `COPY` map, wire each band to `view`, sync `faqFilter` to `view` via `useEffect`, read/write `?audience=` via `useSearchParams`.

## Verification

- Switching tabs updates: hero eyebrow/headline/lede, comparison heading, trust strip headline/lede/CTA, FAQ heading + default filter — all in one click, no page reload.
- Deep link `/pricing?audience=biz` lands on the employer view directly.
- FAQ filter pills still work as a manual override after a tab change.
- No console errors; mobile layout unaffected.
