## Goal

Turn `/certification` from a utilitarian dashboard card into an Awwwards-grade editorial experience that tells the story: *complete your profile → pass a certification → become visible to Curaçao employers → apply to live jobs*. Then make that story persistently present on the main Dashboard via a new image-driven CTA slot that only renders for users who haven't passed any exam.

No IA changes, no new routes, no parallel "modes". Same Portal v2 primitives, same tokens (warm cream canvas, orange/blue/deep-blue, no gray/purple), same Urbanist extralight + Public Sans rhythm as the rest of the dashboard.

---

## Part 1 — Certification Hub redesign

Rebuild `src/components/certification/CertificationDashboard.tsx` (and supporting subcomponents) into a long-form editorial page composed of stacked bands. The page already renders inside `PortalPageShell` from `Certification.tsx`, so we drop the bespoke white card + `min-h-screen` wrapper and lean into full-width bands.

### Page composition (top → bottom)

1. **Editorial hero band** (full-bleed within shell)
   - Tone: `ink` (deep foreground), large portrait/landscape image of a real Curaçao professional.
   - Eyebrow: "Lansa Certification".
   - Headline (Urbanist extralight, 5–6xl, italic accent on tail words via existing `renderEditorialHeadline` pattern): *"Get seen for what you actually bring."*
   - Body: one editorial paragraph linking certification → visibility → live jobs.
   - Inline status chip: "X of 4 sectors certified · highest score Y%" (replaces the 3 small stat cards).
   - Primary CTA: "Start your certification" (scrolls to sector grid). Secondary: "How it works" (scrolls to story band).

2. **"Why certify" story band — 3 chapters**
   A vertical zigzag (`image-left` / `image-right` / `image-left`) of three `BrandImageSlot`-style panels, each a chapter of the narrative:
   - **Chapter 1 — Verified, not assumed.** Why a Lansa cert beats a CV claim. (image: candidate working)
   - **Chapter 2 — Show up where employers look.** Passing flips `lansa_certified=true` → user appears in employer Browse + recommended candidates feeds. (image: employer reviewing)
   - **Chapter 3 — Apply to live listings with weight behind your name.** Certified profiles surface higher and unlock the apply flow on real jobs. (image: someone celebrating an offer)
   Each chapter has eyebrow + extralight headline + 2-line body + small stat or quote.

3. **The 4 sector showcase**
   Replace the current 2×2 utilitarian cards with an editorial sector grid:
   - Asymmetric 12-col layout: 2 large feature cards on top row (Office, Service), 2 standard below (Technical, Digital), or a 2×2 with each card visually distinct.
   - Each card: full-bleed sector imagery (warm-toned, human, on-brand), tone-tinted overlay using existing tokens (orange/blue/deep-blue/cream — not the current Tailwind blue/green/orange/purple gradients which violate the palette rule).
   - Inside: sector name (Urbanist extralight 3xl), 1-line description, score ring only if attempted, status chip (Certified / Try again), and one primary CTA "Start exam · XCG 25" or "Retake".
   - Passed sectors get a serif italic "Certified" mark and the existing `<CertificateDownloadButton>` as a quiet secondary action.
   - Card animation: gsap fade/translate stagger (already in place) tuned for editorial calm (longer duration, smaller offset).

4. **Outcomes band — proof + numbers**
   A wide `ink`-toned strip with 3–4 large stat tiles ("40-question exam · 40s per question", "4 sectors", "XCG 25 once", "Verified badge for life") set in extralight type. Optional small testimonial line.

5. **Closing CTA band**
   `cream` tone, `image-left`, headline like *"Your shortlist starts with one exam."* + primary "Start your certification" CTA. Mirrors the dashboard's closing brand band style.

### Component changes

- Refactor `CertificationDashboard.tsx` into smaller pieces under `src/components/certification/hub/`:
  - `HubHero.tsx`
  - `HubStoryBand.tsx` (renders 3 chapters)
  - `SectorShowcase.tsx` (uses a new `SectorFeatureCard.tsx`)
  - `HubOutcomesBand.tsx`
  - `HubClosingCta.tsx`
- Keep all existing data loading (`loadProgress`, `cert_results`, `cert_certifications`, `PaymentModal`, navigation to `/certification/:sector`) — purely a presentational refactor.
- Remove the `min-h-screen bg-background` white card wrapper and the manual back button (the `PortalPageShell` header handles context).
- Recolor sector accents to brand tokens:
  - office → blue `hsl(215 85% 55%)`
  - service → orange `hsl(14 90% 60%)`
  - technical → deep blue `#191f71`
  - digital → warm cream + orange accent
  No raw Tailwind color classes; expose via inline style or new semantic tokens in `index.css` (e.g. `--sector-office`, `--sector-service`, `--sector-technical`, `--sector-digital`).

### Imagery

- Reuse the `BrandImageSlot` aesthetic. We need 4 sector images + 3 story-chapter images + 1 hero + 1 closing = up to 9 slots. For now wire the components to accept `src` props and render the dashed `Image slot` placeholder when empty (BrandImageSlot already supports this), so the user can drop images in later via the same paste-image flow we've used for the dashboard. We will not auto-generate stock photos.

---

## Part 2 — Persistent Certification CTA on the Dashboard

Add a new conditional `BrandImageSlot`-style block to `PortalShell.tsx` that only renders when the user has zero passed certifications.

### Behavior

- New hook or inline query: count rows in `cert_results` where `user_id = current` and `pass_fail = true`. Reuse Supabase client.
- New component `src/components/dashboard/portal/decor/CertificationCtaSlot.tsx` wrapping `BrandImageSlot` with:
  - `aspect="wide"`, `placement="image-right"`, `tone="accent"` (orange-tinted to stand out from the other slots).
  - eyebrow: "Certify yourself".
  - headline: *"Pass one exam. Show up everywhere employers look."*
  - body: 1 sentence on visibility + applying to live jobs.
  - cta: `{ label: "Start your certification", href: "/certification" }`.
  - `src`: a placeholder for now (dashed slot) so the user can paste an image later, same pattern as the existing slots.
- Hide the block while the count is loading (avoid a flash); render `null` if `passedCount > 0`.

### Placement in `PortalShell.tsx`

Insert it as a new SLOT between `ProfileCompletionCard` and the asymmetric 2-col workspace (~line 60), so it sits in the user's primary scan path right after the profile nudge. This keeps the existing four brand slots intact and adds a fifth that's purpose-driven and conditional.

---

## Technical notes

- All new components use semantic tokens only (`bg-card`, `text-foreground`, `text-primary`, `bg-primary/5`, etc.). Sector accent tints go through new CSS variables added in `index.css` so we don't introduce raw hex in components.
- Keep the existing exam flow (`ExamFlow`, `ReflectionReport`, `PaymentModal`) untouched — this work is purely the hub landing surface + dashboard CTA.
- Animations: use existing `gsap` import already in the dashboard; no new deps.
- Mobile: hub bands stack to single column, sector cards become a vertical stack, hero loses the side image and goes text-first with image below — all handled by the existing `BrandImageSlot` responsive rules and small additions in the new components.
- No changes to routing, RLS, or data model.

---

## Out of scope

- Generating final hero/sector/story imagery (user will paste images into the slots, same flow as dashboard).
- Any change to the exam-taking, payment, or reflection screens.
- Mentor/Employer dashboards.
