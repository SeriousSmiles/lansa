# Resume Export Engine v2 — Vector, Server-Rendered, Design-Parity

## Goal
Replace the current html2canvas raster pipeline with a **vector-first, server-rendered** export engine that produces pixel-perfect PDFs (and DOCX) matching the live Resume Editor exactly — with real design personalization powered by the same React templates the editor renders.

## Confirmed decisions
1. **Rendering host: self-hosted Puppeteer worker** (max control, lowest per-export cost, own the fonts and Chromium version).
2. **Scope for Phase 1: 3 highest-value templates only** — `Professional`, `Modern`, `Logos`. The other 5 (`Classic`, `Creative`, `Timeline`, `Minimal`, `Academic`) stay on the current path behind a feature flag until Phase 3.
3. **DOCX is in scope now** — shipped alongside PDF in Phase 2.

## What changes for the user
- "Export" produces a true vector PDF (selectable text, ATS-parseable, ~50–200 KB instead of 5–20 MB).
- New export formats: **PDF**, **PDF/A-1b** (archival), **DOCX**, PNG @2x, JPEG.
- Editor personalization (fonts, colors, density, section order, photo treatment, icon set) round-trips into the export with zero drift.
- Deterministic output — same result on any device, any browser.

---

## Architecture

```text
┌────────────────────────────────┐
│  Resume Editor (React, live)   │
│  <ResumeDocument tokens=…>     │
└──────────────┬─────────────────┘
               │ same component tree
┌──────────────▼─────────────────┐
│  /resume/print/:token (app)    │  signed, short-lived, auth'd
│  Renders <ResumeDocument> with │
│  @page CSS + bundled fonts     │
└──────────────┬─────────────────┘
               │
┌──────────────▼─────────────────┐
│  export-resume (Edge Function) │  auth + rate limit + cache lookup
└──────────────┬─────────────────┘
               │ HTTPS + shared secret
┌──────────────▼─────────────────┐
│  Puppeteer Worker (Fly.io)     │  Chromium + bundled fonts
│  ├─ PDF  (page.pdf, vector)    │
│  ├─ PDF/A  (Ghostscript pass)  │
│  ├─ PNG/JPEG (page.screenshot) │
│  └─ DOCX (docx lib, same tokens)│
└──────────────┬─────────────────┘
               │
┌──────────────▼─────────────────┐
│  Supabase Storage + resume_exports cache │
└─────────────────────────────────┘
```

---

## Phased delivery

### Phase 1 — Foundations (no user-visible change)
- Introduce `<ResumeDocument>`: one React component driven by a typed `DesignTokens` contract (colors, typography, spacing scale, density, section order, photo shape, icon set, "Powered by Lansa" toggle).
- Migrate `Professional`, `Modern`, `Logos` to render through `<ResumeDocument>`. Editor preview and export component become the same file.
- Add declarative pagination: `@page { size: A4; margin: … }`, `break-inside: avoid` on section blocks, running footer with page number.
- Self-host brand fonts (Urbanist, Public Sans, one display face) as `@font-face` with `font-display: block`. Same font files bundled in the worker container.

### Phase 2 — Server render pipeline + DOCX
- **Puppeteer worker service** (new repo/deploy target on Fly.io):
  - Node + `puppeteer-core` + bundled Chromium, fonts baked into the image.
  - `POST /render` accepts `{ url, format, options }`, verifies a shared secret, returns the binary.
  - Formats: `pdf` (via `page.pdf({ printBackground: true, preferCSSPageSize: true })`), `pdf-a` (Ghostscript post-process), `png`, `jpeg`, `docx` (via `docx` npm library reading the same `DesignTokens` — separate code path, not HTML→DOCX).
  - Concurrency cap, per-request timeout, memory recycle after N renders.
- **Signed print route** `/resume/print/:token` in the app:
  - Token is a short-lived JWT (5 min) signed with `RESUME_PRINT_SECRET`, embeds `user_id` + `design_hash`.
  - Route hydrates the exact editor state from `design_json` and renders `<ResumeDocument>` at A4 size.
- **`export-resume` edge function** (replace placeholder):
  - Validates auth, computes design hash, checks `resume_exports` cache.
  - On miss: mints print-token, calls worker with `https://app-url/resume/print/:token`, uploads binary to Storage, writes cache row, returns signed URL.
- **`useResumeExport` hook**: unchanged signature, now returns the real vector URL.
- **`EditorToolbar` export menu**: add DOCX, PDF/A entries. Remove the direct-html2canvas path in favor of `useResumeExport` for the 3 migrated templates.

### Phase 3 — Personalization unlocked (editor UI)
Now that the engine is vector, expose in the Resume Editor's Properties Panel:
- **Typography** — 6 curated font pairs, variable-weight slider (300–900), tracking, leading, heading scale ratio.
- **Color** — full palette editor with WCAG contrast validation, gradient header toggle, duotone photo treatment.
- **Layout** — grid switcher (1-col ATS / 2-col sidebar / 2-col header-strip / timeline), density (compact/comfortable/spacious), section drag-reorder persisted to `design_json`.
- **Personalization** — photo shape (circle/squircle/rounded/none), QR code to public profile, Lansa badge toggle, draft watermark.
- **Iconography** — Lucide / Phosphor / none, rendered as inline SVG.
- **Migrate remaining 5 templates** into `<ResumeDocument>`; retire html2canvas path.

---

## Technical notes

- **Why self-hosted Puppeteer over managed API:** full control of Chromium version, bundled fonts (no OS drift), no per-export marginal cost at scale, ability to add PDF/A and DOCX passes in the same worker. Fly.io machine ~$5/mo idle, autoscales.
- **DOCX strategy:** do **not** convert HTML→DOCX (lossy, unreliable). The worker has a dedicated DOCX renderer that consumes the same `DesignTokens` + resume data and emits a Word doc via the `docx` npm library — different layout primitives, same content and design system. Section structure, fonts, colors, and section order stay in sync because both readers consume the same token contract.
- **Security:** print token is single-use, 5-min TTL, bound to `user_id` + `design_hash`; worker validates a shared `RENDER_SHARED_SECRET`; print route refuses unauthenticated hits; worker is not publicly indexed.
- **Caching:** existing `resume_exports` table keyed by `file_hash` (SHA-256 of `design_json + options`) — 90%+ of re-downloads become free.
- **Rollback:** the html2canvas path stays behind a `EXPORT_ENGINE_V2` flag for one release; instant revert per template if regressions appear.
- **Font licensing:** confirm Urbanist + Public Sans redistribution terms before baking into the worker container (both are OFL, so fine).

## Secrets required
- `RESUME_PRINT_SECRET` — JWT signing key for print tokens (generated).
- `RENDER_SHARED_SECRET` — shared secret between edge function and worker (generated).
- `RENDER_WORKER_URL` — public URL of the deployed Puppeteer worker.

## Deliverables
1. `<ResumeDocument>` + `DesignTokens` contract; `Professional`, `Modern`, `Logos` migrated.
2. Bundled fonts + `@page` CSS on migrated templates.
3. `/resume/print/:token` signed print route.
4. Puppeteer worker service (Dockerfile, Fly.io config, `/render` endpoint, PDF + PDF/A + PNG + JPEG + DOCX).
5. Real `export-resume` edge function wired to the worker with cache + Storage upload.
6. `EditorToolbar` export menu updated (PDF, PDF/A, DOCX, PNG, JPEG); html2canvas removed for the 3 migrated templates.
7. Phase 3 editor personalization UI (typography, color, layout, personalization, icons) + remaining 5 templates migrated.
