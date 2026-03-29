

# Three Audience-Specific Share Cards

## What Changes

Replace the single "Share Lansa" button with a button that opens a **bottom sheet** (mobile) presenting three audience-specific QR card options. Each generates a unique card with a tailored headline and subtitle.

## Card Variants

| Audience | Headline | Subtitle | Share text |
|---|---|---|---|
| **Employers** | "Find the Right Talent, Faster" | "Scan to hire smarter with Lansa" | "Find verified candidates faster with Lansa" |
| **Opportunity Seekers** | "Get Trained. Get Certified. Get Hired." | "Scan to start your journey on Lansa" | "Build your career and connect with local businesses on Lansa" |
| **Mentors & Coaches** | "Grow Your Reach. Train More Talent." | "Scan to join Lansa as a mentor" | "Expand your student pool with warm local leads on Lansa" |

All three cards share the same visual layout (logo → headline → subtitle → QR → URL pill) but with different text. The QR code always points to `https://lansa.online`.

## Implementation

### 1. Refactor `ShareLansaCard.tsx`
- Accept `variant` prop: `'employer' | 'seeker' | 'mentor'`
- Map variant to `{ headline, subtitle, shareText, filename }` internally
- Rest of canvas logic stays identical — just swap the text strings

### 2. Create `ShareLansaMenu.tsx` (new)
- The floating button now opens a small **popover/bottom sheet** with three options:
  - 🏢 "For Employers"
  - 🎯 "For Opportunity Seekers"  
  - 🎓 "For Mentors & Coaches"
- On mobile (390px viewport): use a `Sheet` (bottom) with three tappable rows
- Tapping an option triggers the corresponding `ShareLansaCard` generation
- Clean, minimal UI — Lansa branding, single tap to generate

### 3. Update `Index.tsx`
- Replace `<ShareLansaCard>` with `<ShareLansaMenu>` in the fixed bottom-right position

## Files

| File | Action |
|---|---|
| `src/components/ShareLansaCard.tsx` | Refactor to accept `variant` prop |
| `src/components/ShareLansaMenu.tsx` | New — selection UI (popover/sheet) |
| `src/pages/Index.tsx` | Swap component |

