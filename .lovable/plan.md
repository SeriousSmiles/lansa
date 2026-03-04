
## Two separate concerns from the two images

### Image 1 — Certification Dashboard (`/certification`)

**Issues to fix:**

1. **Orange "Download" button style mismatch** — `CertificateDownloadButton` renders its own hardcoded `buttonPrimary` class (`bg-primary text-primary-foreground hover:bg-primary/90`) but with inline string classes instead of using the `Button` component. It renders as a `<PDFDownloadLink>` with manual classes. The "Start Exam" / "Retake Exam" button correctly uses `<Button variant="primary">` which has the full box-shadow treatment. The Download button's manual class string misses all the inset shadows that make it look embossed — it looks flat. **Fix**: Replace the manual class strings in `CertificateDownloadButton.tsx` with the `buttonVariants` utility so it matches exactly.

2. **Button height mismatch** — Download button is `h-11` (size lg), Retake Exam button `h-11` too but they appear different because the CertificateDownloadButton uses `px-8 text-base` while layout wraps them in `flex-col sm:flex-row`. They need to be `size="lg"` equivalents. **Fix**: Align both to consistent sizing using the shared Button styles.

3. **Background gradient** — The page uses `min-h-screen bg-gradient-to-br from-background via-background to-primary/5` which fills the full viewport. The reference image shows all content inside a centered card with a subtle raised shadow. **Fix**: Change the layout in `CertificationDashboard.tsx` to remove the full-page gradient and instead wrap the content in a centered surface card (`bg-card rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.04)]`). No scroll needed means the container will be naturally sized.

---

### Image 2 — Seeker Dashboard (`/dashboard`) — Masonry grid

**Issue:** The "Who's Interested in You" section renders below the analytics/certification grid as a separate full-width row (`space-y-6` stacking). In the reference image it sits **beside** the analytics card (same height, flush), forming a 3-column masonry-like layout where:
- Col 1-2: Analytics card (tall) 
- Col 3: Certification card (same height as analytics)
- Col 3 continues: "Who's Interested" list sits right underneath the certification card, at the same height zone as the analytics card

**Fix in `OverviewTab.tsx`**: Restructure the grid so `WhoIsInterestedSection` is moved inside the 3-column grid as a continuation of the right column, stacked below `CertificationCard`. This creates the visual masonry where the right column has two stacked items (Certification + Who's Interested) and the left column has one tall Analytics card.

```text
┌──────────────────────────┬──────────────────┐
│                          │  CertificationCard│
│  StudentAnalyticsCard    ├──────────────────┤
│                          │ WhoIsInterested  │
└──────────────────────────┴──────────────────┘
```

---

### Files to edit

| File | Change |
|---|---|
| `src/components/certification/CertificateDownloadButton.tsx` | Replace manual class string with `buttonVariants({ variant: "primary", size: "lg" })` import |
| `src/components/certification/CertificationDashboard.tsx` | Remove full-page gradient bg, wrap content in a centered card tile. Keep inner padding, remove `min-h-screen`. |
| `src/components/dashboard/overview/OverviewTab.tsx` | Move `WhoIsInterestedSection` into the right column of the 3-col grid, stacked below `CertificationCard`, so both columns are the same visual height |
