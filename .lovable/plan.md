

# Fix PDF Generation Failures

## Root Causes Found

Three distinct bugs are causing the PDF generation to fail silently after showing "Generating...":

### Bug 1: Invalid `border` shorthand in ProfessionalDoc.tsx

`@react-pdf/renderer` does not support CSS shorthand for borders. Two lines in `ProfessionalDoc.tsx` use the invalid format:

```text
border: '4px solid #FFFFFF'           --> line 28
border: '1px solid rgba(...)          --> line 106
```

These must be split into separate `borderWidth`, `borderStyle`, and `borderColor` properties.

### Bug 2: Invalid `fontWeight: 'medium'` across 5 templates

`@react-pdf/renderer` with the built-in Helvetica font only supports `'normal'` and `'bold'` as fontWeight values. The value `'medium'` (used ~10 times across ClassicDoc, CreativeDoc, LogosDoc, ModernDoc, and TimelineDoc) causes the renderer to crash.

All instances of `fontWeight: 'medium' as any` must be changed to `fontWeight: 'normal'`.

### Bug 3: Template name not passed to `useHTMLPDFGeneration`

In `PDFDownloadDialog.tsx`, when templates with `engine: 'html'` are selected, the download call is:
```text
await generateHTMLPDF(pdfData);   // no template parameter!
```

The `generateHTMLPDF` function signature accepts template as the 4th argument, defaulting to `'professional'`. So selecting Classic, Modern, Creative, Timeline, or Logos all silently generate the Professional template instead.

Additionally, the template registry still marks these 5 templates as `engine: 'html'` even though `useHTMLPDFGeneration` now routes through the react-pdf pipeline. The registry should be updated so all templates use `engine: 'react-pdf'`.

## Fix Plan

### Step 1: Fix ProfessionalDoc.tsx border shorthand (2 locations)

Replace:
- `border: '4px solid #FFFFFF'` with `borderWidth: 4, borderColor: '#FFFFFF'`
- `border: '1px solid rgba(255, 255, 255, 0.2)'` with `borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)'`

### Step 2: Fix fontWeight: 'medium' across all templates

Replace every `fontWeight: 'medium' as any` with `fontWeight: 'normal'` in:
- ClassicDoc.tsx (3 instances)
- CreativeDoc.tsx (4 instances)
- LogosDoc.tsx (1 instance)
- ModernDoc.tsx (1 instance)
- TimelineDoc.tsx (1 instance)

### Step 3: Update template registry to use react-pdf engine for all templates

Change `engine: 'html'` to `engine: 'react-pdf'` for: professional, modern, creative, classic, timeline, logos. Update their `component` references to point to the new `pdf/` Doc files.

### Step 4: Fix PDFDownloadDialog template routing

Update the download handler so the selected template name is passed correctly to whichever generation hook is called. With all templates on `engine: 'react-pdf'`, the routing simplifies to always using `generateReactPDF(pdfData, selectedTemplate)`.

## Files to Change

| File | Change |
|---|---|
| `src/components/pdf/templates/pdf/ProfessionalDoc.tsx` | Fix 2 border shorthands |
| `src/components/pdf/templates/pdf/ClassicDoc.tsx` | Fix 3 fontWeight: 'medium' |
| `src/components/pdf/templates/pdf/CreativeDoc.tsx` | Fix 4 fontWeight: 'medium' |
| `src/components/pdf/templates/pdf/LogosDoc.tsx` | Fix 1 fontWeight: 'medium' |
| `src/components/pdf/templates/pdf/ModernDoc.tsx` | Fix 1 fontWeight: 'medium' |
| `src/components/pdf/templates/pdf/TimelineDoc.tsx` | Fix 1 fontWeight: 'medium' |
| `src/components/pdf/templateRegistry.ts` | Set all templates to engine: 'react-pdf' |
| `src/components/pdf/PDFDownloadDialog.tsx` | Simplify routing to always use react-pdf with correct template |

