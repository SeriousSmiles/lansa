
## Certificate PDF Download — Full Plan

### What this builds
A real, beautiful A4 Landscape PDF Certificate downloadable from the `ReflectionReport` page (the post-exam results screen) using `@react-pdf/renderer` — the same engine already used for resume PDFs in this project. No new dependencies needed.

### Certificate design
A4 Landscape (842 × 595pt). Two-zone layout:

```
┌─────────────────────────────────────────────────────────────────────┐
│  LEFT ACCENT BAR (dark)  │         MAIN CERTIFICATE BODY            │
│  ┌──────────────────┐    │                                           │
│  │  LANSA SVG SEAL  │    │  This certifies that                     │
│  │  (custom badge)  │    │  ── FULL NAME ──                         │
│  │                  │    │  has successfully completed               │
│  │  ● SCORE: 88%    │    │  OFFICE SECTOR PROFESSIONAL CERTIFICATION│
│  │  ● Level badge   │    │                                           │
│  └──────────────────┘    │  Category Scores (4 mini bars)           │
│                           │                                           │
│                           │  ── AI Summary (1-2 lines) ──           │
│                           │                                           │
│                           │  Issued: Jan 2026  │ Code: XXXX-YYYY     │
│                           │  Verify at lansa.online/verify/CODE      │
└─────────────────────────────────────────────────────────────────────┘
```

**The SVG Badge** (real SVG paths, no icon libraries):
- Outer ring with tick marks (like a compass rose / seal)
- Inner circle with "LANSA" wordmark
- Sector label arc text around the ring
- Star/diamond accent at top
- Color: gold/amber for Standard, purple gradient for High Performer

### Data on the certificate
- Candidate full name (from `user_profiles`)
- Sector name (Office / Service / Technical / Digital)
- Level (Certified / High Performer)
- Total score %
- Category scores: Mindset, Workplace Intelligence, Performance Habits, Applied Thinking
- AI summary text (first 200 chars)
- Date issued
- Verification code
- Verify URL: `lansa.online/verify/[code]`

### Files to create/edit

| File | Action |
|---|---|
| `src/components/pdf/templates/pdf/CertificateDoc.tsx` | New — the `@react-pdf/renderer` Document for the certificate |
| `src/components/certification/CertificateDownloadButton.tsx` | New — button component that fetches profile + builds the PDF |
| `src/components/certification/ReflectionReport.tsx` | Replace `handleDownloadCertificate` alert stub with real button |

### How it works
1. User clicks "Download Certificate" on the ReflectionReport page
2. `CertificateDownloadButton` already has `result` + `certification` data passed as props
3. It fetches the user's `name` from `user_profiles` (already available in the parent component via `userId`)
4. Renders `<PDFDownloadLink>` from `@react-pdf/renderer` wrapping `CertificateDoc`
5. Browser downloads `lansa-certificate-[sector].pdf`

### SVG Badge approach in react-pdf
`@react-pdf/renderer` supports SVG via `<Svg>`, `<Path>`, `<Circle>`, `<G>`, `<Text>` from the same package. The badge will be:
- A `<Svg>` component embedded in the PDF (not an image file)
- Outer decorative ring using `<Circle>` with dashed stroke
- 12 tick marks using `<Line>` elements in a loop pattern (defined as path data)
- Central circle with "LANSA" text
- Sector name below
- Gold/amber color scheme for Standard, amber-to-deep-gold for High Performer
- A checkmark path at the top of the ring

This is a real SVG design with geometric precision — not an icon library component.
