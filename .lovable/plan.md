

# Fix CV Parser and Rebuild with Lovable AI

## Problem Diagnosis

Two issues are causing the CV parser to fail:

### Issue 1: Edge function not registered in config.toml
The `parse-cv-railway` edge function is not listed in `supabase/config.toml`. Without a config entry, the function may not deploy or may reject requests due to JWT verification defaults.

### Issue 2: Railway microservice dependency
The current flow calls an external Railway microservice at `https://mcb-ai-parser-1-production.up.railway.app/upload`. If that service is down, unreachable, or has changed its API, parsing fails silently. This is an external dependency outside your control.

There is also a second unused edge function (`parse-cv-resume`) that uses OpenAI directly for vision-based parsing, but it's not wired up to the frontend -- the frontend only calls `parse-cv-railway`.

---

## Solution: Replace Railway with Lovable AI

Replace the external Railway dependency with the built-in Lovable AI gateway. The approach:

1. **Client-side PDF-to-image conversion** -- already implemented in `CVUploadModal.tsx` using `pdfjs-dist`. This code converts PDF pages to JPEG base64 images. Currently unused in the Railway flow.

2. **New edge function `parse-cv`** -- sends those images to Lovable AI (Gemini vision model) for structured extraction. No external dependencies.

3. **Update `cvDataService.ts`** -- switch from sending a FormData file to sending base64 image arrays.

---

## Implementation Steps

### Step 1: Create new edge function `parse-cv`
A single edge function that:
- Receives `{ imageDataUrls: string[], fileName: string, userId: string }`
- Calls `https://ai.gateway.lovable.dev/v1/chat/completions` with `google/gemini-2.5-flash` (vision-capable, fast, cost-effective)
- Uses the extraction prompt already written in `parse-cv-resume/index.ts` (proven to work)
- Stores results in `user_resumes` table
- Returns structured `CVAnalysisResult` with extractedData, suggestions, and metadata
- Handles 429/402 rate limit errors gracefully

### Step 2: Update `cvDataService.ts`
- Replace `uploadAndParseCV` to:
  1. Convert file to images client-side using the existing `convertFileToImages` function from `CVUploadModal.tsx`
  2. Call `supabase.functions.invoke('parse-cv', { body: { imageDataUrls, fileName, userId } })`
  3. Return the same `CVAnalysisResult` shape

### Step 3: Extract and share the image conversion utility
- Move `convertFileToImages` from `CVUploadModal.tsx` into a shared utility (e.g., `src/utils/pdfToImages.ts`) so both the modal and the service can use it

### Step 4: Update CVUploadModal.tsx
- Remove the Railway-specific log message
- Use the updated `CVDataService.uploadAndParseCV` (which now handles conversion internally)

### Step 5: Register in config.toml
- Add `[functions.parse-cv]` with `verify_jwt = false` (auth validated in code)

### Step 6: Clean up
- The old `parse-cv-railway` and `parse-cv-resume` functions can remain for now but won't be called

---

## Technical Details

### Edge Function: `supabase/functions/parse-cv/index.ts`
- Uses `LOVABLE_API_KEY` (already configured as a secret)
- Model: `google/gemini-2.5-flash` (supports vision, fast, cheap)
- System prompt: reuses the proven extraction prompt from `parse-cv-resume`
- Stores parsing record in `user_resumes` table with `parsing_source: 'lovable-ai'`
- Cross-references with `user_profiles` and `user_answers` for gap analysis and suggestions
- Returns rate limit errors (429/402) to client for proper toast display

### Files Modified
- `src/services/cvDataService.ts` -- new image-based upload flow
- `src/components/onboarding/cv/CVUploadModal.tsx` -- import shared utility, remove Railway references
- `supabase/config.toml` -- add `[functions.parse-cv]`

### New Files
- `supabase/functions/parse-cv/index.ts` -- Lovable AI vision-based parser
- `src/utils/pdfToImages.ts` -- shared PDF-to-image conversion utility

### No Database Changes Required
- Uses existing `user_resumes`, `user_profiles`, `user_answers` tables
- No RLS changes needed

