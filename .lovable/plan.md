
## Two changes needed

### 1. Container width fix — both certification pages
Both `CertificationDashboard` and `ReflectionReport` currently use `max-w-7xl` / `max-w-6xl` which spans very wide on large screens. Change both to `max-w-4xl` for a properly centered, readable layout. The ExamFlow page likely needs the same check.

### 2. Per-exam download button on CertificationDashboard
The dashboard already fetches `cert_results` (sector, pass_fail, created_at). It needs to also fetch `cert_certifications` for passed sectors, then show a "Download Certificate" button on each passed sector card alongside the "Retake Exam" button.

**Data to load additionally in `CertificationDashboard`:**
- Query `cert_certifications` filtered by `user_id` for all sectors
- Map `result_id` → certification record per sector (we need `result_id` from `cert_results` to cross-reference)

**Sector card UI when passed:**
```
┌──────────────────────────────────────┐
│  ✓ Certified  [score ring]           │
│                                      │
│  [Download Certificate] [Retake]     │
│  Last attempt: Jan 2026              │
└──────────────────────────────────────┘
```
The download button reuses the existing `CertificateDownloadButton` component. Since `CertificateDownloadButton` expects a full `CertResult` object, we'll need to also fetch the full `cert_results` row (add `id` to the select query) so we can pass it correctly.

### Files to edit

| File | Change |
|---|---|
| `src/components/certification/CertificationDashboard.tsx` | Constrain max-width to `max-w-4xl`, fetch full result `id` + certifications per sector, add download button to passed sector cards |
| `src/components/certification/ReflectionReport.tsx` | Constrain max-width to `max-w-4xl` |
| `src/components/certification/CertificateDownloadButton.tsx` | Accept optional `compact` prop for smaller button variant on cards |

The `ExamFlow` page itself is full-screen by design (exam UX) so we leave it alone.
