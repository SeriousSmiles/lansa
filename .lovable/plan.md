
## Three problems to fix

### 1. Width containment — certification pages render outside DashboardLayout
The `Certification.tsx` page renders `CertificationDashboard`, `ExamFlow`, and `ReflectionReport` directly — no `DashboardLayout` wrapper. So the `max-w-[1440px]` from `DashboardLayout` never applies.

**Fix**: Wrap all three views in `Certification.tsx` with a shared layout shell — a `div` that mirrors the dashboard's container: `w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8`. This keeps things uniform with the rest of the app without re-routing through DashboardLayout (which would add the top nav and sidebar, changing the UX).

Both `CertificationDashboard` and `ReflectionReport` already have `py-12 px-4 max-w-4xl mx-auto` inside. The outer max-w-[1440px] in Certification.tsx will constrain the page width, while the inner `max-w-4xl` keeps content readable. This matches the image: full-width page background, content centered at ~800px.

### 2. Fit content on desktop without scrolling
The `CertificationDashboard` has several spacing-heavy elements:
- `py-12` outer padding → reduce to `py-6`
- `mb-12` header → reduce to `mb-6`
- `mb-12` stats grid → reduce to `mb-6`
- `gap-8` sector grid → reduce to `gap-4`
- `p-8` sector cards → reduce to `p-6`
- `mt-12` bottom CTA card → can be removed entirely (it adds scroll without value)
- `mb-6 text-4xl md:text-5xl` title → reduce title to `text-3xl`

This will fit the full dashboard on a typical 1080p screen without scroll.

### 3. Download button is broken — invalid HTML nesting
`PDFDownloadLink` renders an `<a>` tag. Inside it, we render `<Button>` which renders a `<button>`. **A `<button>` inside an `<a>` is invalid HTML** — browsers silently break click events. This is why the download does nothing.

**Fix**: Replace the inner `<Button>` with a styled `<div>` that looks identical to the button. Use `asChild` or just style a `<div className="...button styles...">`. The `PDFDownloadLink` `<a>` will still handle the click and trigger the download.

### Files to edit

| File | Change |
|---|---|
| `src/pages/Certification.tsx` | Wrap all views in `max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8` container |
| `src/components/certification/CertificationDashboard.tsx` | Reduce all spacing to eliminate need to scroll; remove bottom CTA card |
| `src/components/certification/ReflectionReport.tsx` | Reduce `py-12` to `py-6`, reduce `mb-*` values |
| `src/components/certification/CertificateDownloadButton.tsx` | Replace inner `<Button>` with styled `<div>` to fix invalid HTML nesting that breaks download |
