
## Root Cause Analysis

The pipeline has **two distinct failure points**:

### Problem 1: `pdfjs-dist` v5 — empty `workerSrc` throws
`pdfToImages.ts` line 17 sets `workerSrc = ''`. In pdfjs v5, empty string is **invalid** and throws before any page is rendered. The fix is to point it to the real worker file using Vite's `new URL()` syntax.

### Problem 2: `parse-cv` edge function — NOT redeployed after last edit
The edge function code looks correct but may be running a stale version. The `imageDataUrls` payload from client can also be very large (8 pages × ~200KB JPEG = ~1.6MB base64), which can silently fail at the Supabase edge function request body size limit or the AI gateway.

### Problem 3: No request timeout / size guard on client
The user's PDF (John Stephens Resume, a real-world 2-page resume) needs to work. We should reduce max pages from 8 → 4 and reduce scale from 1.5 → 1.2 to keep payloads manageable while still giving the AI clear images.

---

## Fix Plan

### 1. Fix `src/utils/pdfToImages.ts`
- Change `workerSrc = ''` → `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()`
- Remove `useWorkerFetch: false` and `isEvalSupported: false` (fake-worker flags, no longer needed)
- Reduce max pages: `8` → `4`
- Reduce scale: `1.5` → `1.2` (smaller payload, still AI-readable)
- Reduce JPEG quality: `0.75` → `0.7`

### 2. Redeploy `parse-cv` edge function
The edge function code is correct. It needs to be redeployed to pick up the latest version in production. Add a payload size check — if `imageDataUrls` total base64 size exceeds ~4MB, throw a clear error rather than silently timing out.

### 3. Add progress messaging in `CVLoadingProgress`
The "silent cancel" feeling happens because there's no stage feedback. Add stage text: "Reading your CV…" → "Sending to AI…" → "Extracting your data…" so users know it's working.

---

## Files to Change

| File | Change |
|---|---|
| `src/utils/pdfToImages.ts` | Fix workerSrc, reduce scale/pages/quality |
| `supabase/functions/parse-cv/index.ts` | Add payload size guard, redeploy |
| `src/components/onboarding/cv/CVLoadingProgress.tsx` | Add timed stage messages for better UX |
