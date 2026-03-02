
## Two Fixes: Swipe Content Area + Email Branding Overhaul

---

### Fix 1 — Swipe Not Working from Card Content Area

**Root cause:**

In `EnhancedCandidateCard.tsx`, the content body has two compounding problems:

1. `overflow-y-auto` on the inner scroll container (line 117) creates a new scroll context that intercepts pointer events before `SwipeableContainer` can determine horizontal vs vertical intent. The browser sees a scrollable container and routes touch events to it.

2. `onClick={handleContentTap}` on the content wrapper means tapping opens the drawer correctly, but the pointer events during a drag gesture are being absorbed by the nested `overflow-y-auto` div, not propagating up to `SwipeableContainer`.

**Fix:**

In `EnhancedCandidateCard.tsx`, change the inner scrollable div (`overflow-y-auto`) to have `pointer-events: none` during active swipe drags. The approach: use a CSS `touch-action` override — the inner div should have `touch-action: pan-y` which tells the browser to allow vertical scroll but delegate horizontal pan events up the tree.

However, the real fix is to remove `overflow-y-auto` from the card body since the card is already sized by the outer container — content should not need an inner scroll context on the card face itself (scrolling happens inside the detail drawer). Replace `overflow-y-auto` with `overflow-hidden` so the card content clips cleanly and no scroll context competes with the swipe handler.

Also add `draggable={false}` and `onPointerDown={(e) => e.stopPropagation()}` should be **removed** from any child elements — currently `handleContentTap` is on a div that uses `onClick` only, so the `onPointerDown` from `SwipeableContainer` should correctly bubble through. The issue is specifically the `overflow-y-auto` scroll interception.

**Files changed:**
- `src/components/mobile/employer/EnhancedCandidateCard.tsx` — change `overflow-y-auto` → `overflow-hidden` on the inner content scroll div (line 117). Card face should not be independently scrollable; full profile scroll is in `CandidateDetailSheet`.

---

### Fix 2 — Email Templates: Proper HTML, Lansa Logo, Dark Mode Safe

**Current state:**
- All 9 email templates use inline `<style>` blocks which are partially ignored by email clients (Gmail strips `<style>`, Outlook ignores most CSS).
- No Lansa logo — just the text "Lansa" in the footer.
- Headers use CSS gradients which are fine, but the logo area is absent.
- Dark mode email clients (Apple Mail, iOS Mail) can invert colors — a white text logo on a colored background is safe, but a dark background with white text can get double-inverted.

**Approach:**

Refactor ALL email templates to use **fully inlined styles** (no `<style>` block dependency for critical layout), and add a **Lansa wordmark** in the header. The wordmark will be rendered as styled HTML text in a colored pill — no external image required, making it zero-dependency and dark-mode safe.

Key dark mode rules applied:
- All header backgrounds use solid hex colors (not `transparent`) on a colored div — dark mode inversion won't affect white text on a colored background since the background is explicit
- Logo uses `<!--[if !mso]>` conditional comment pattern where needed
- Footer background is explicitly `#f9fafb` (light gray) with `color: #6b7280` — safe for dark mode inversion since email clients target `background: white` → dark, not explicit grays
- The outer `<body>` background is explicitly `#f3f4f6` (light page wrapper) to give context

**Logo treatment (dark mode safe):**

```html
<!-- Logo pill: white text on brand blue — dark mode won't re-invert colored backgrounds -->
<div style="display:inline-block; background:#1a56db; border-radius:6px; padding:4px 12px; margin-bottom:12px;">
  <span style="color:#ffffff; font-size:18px; font-weight:800; letter-spacing:-0.5px; font-family:Arial,sans-serif;">LANSA</span>
</div>
```

This is placed at the TOP of every header section. Since it uses an explicit background color (not `transparent`), dark mode email clients will not invert it.

**Email template improvements per type:**

| Template | Header Color | Logo Pill Color | Key Structural Improvement |
|---|---|---|---|
| Invitation | Blue `#1a56db` | White on blue | Add role info table |
| Join Request | Blue `#1a56db` | White on blue | Add requester info table |
| Approval | Green `#10b981` | White on green | Cleaner layout |
| Rejection | Neutral `#374151` | White on dark | Add Lansa pill |
| Segment Change | Dynamic | White on dynamic | Better tip list |
| Chat Request | Blue `#1a56db` | White on blue | Note box retained |
| Chat Accepted | Blue `#1a56db` | White on blue | Highlight box |
| New Message | Dark `#1f2937` | White on dark | Message quote box |
| Employer Interest | Green `#10b981` | White on green | CTA improvement |
| Employer Nudge | Amber `#f59e0b` | White on amber | Priority badge |
| Match Created | Purple `#7c3aed` | White on purple | Match names box |

**All styles converted to fully inline** to maximize email client compatibility (critical for Gmail which strips `<style>` blocks entirely).

---

### Files to Change

| File | Change |
|---|---|
| `src/components/mobile/employer/EnhancedCandidateCard.tsx` | Change `overflow-y-auto` → `overflow-hidden` on inner content div |
| `supabase/functions/_shared/emailTemplates.ts` | Rewrite all 9 template functions with fully inlined styles + Lansa logo pill + dark mode safe structure |

---

### Technical Notes

- The swipe fix is a single-line change but is the root cause of the content area not being draggable.
- Email templates keep the same exported function signatures and data interfaces — zero breaking changes to the edge function or DB triggers.
- No external image URLs or CDN dependencies added — the logo is pure HTML/CSS, meaning it works even if images are blocked by the email client.
- All `<style>` blocks are removed from templates; every style property is applied as an inline `style=""` attribute for maximum compatibility across Gmail, Outlook, Apple Mail, and mobile clients.
