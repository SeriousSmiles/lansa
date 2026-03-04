
## Two fixes to unblock the download button

### Fix 1 — Wrong column names in user_profiles query (causes 400 → button stays loading forever)
`CertificateDownloadButton.tsx` line 35 queries:
```
.select("full_name, first_name, last_name")
```
The `user_profiles` table has none of these columns — it only has `name`. This returns a 400, `data` is null, and `candidateName` is set to "Professional" (acceptable fallback), BUT the loading state correctly resolves. Actually the real issue is the button state never gets past "Preparing…" because loading stays true until fetchName resolves — and it DOES resolve (to "Professional"). So fix 1 is cosmetic but important: change the query to `.select("name")` and use `data.name`.

### Fix 2 — Invalid font family `Helvetica-Oblique` in CertificateDoc (causes PDF generation to throw, download never triggers)
`@react-pdf/renderer` does NOT accept `Helvetica-Oblique` as a `fontFamily`. The correct approach is:
```js
fontFamily: 'Helvetica',
fontStyle: 'italic',
```
This is the actual blocker — the PDF generation throws `Could not resolve font for Helvetica-Oblique`, so the blob is never created and the download link never activates.

### Files to edit

| File | Change |
|---|---|
| `src/components/certification/CertificateDownloadButton.tsx` | Change `.select("full_name, first_name, last_name")` → `.select("name")` and use `data.name` |
| `src/components/pdf/templates/pdf/CertificateDoc.tsx` | Replace `fontFamily: 'Helvetica-Oblique'` with `fontFamily: 'Helvetica', fontStyle: 'italic'` |
