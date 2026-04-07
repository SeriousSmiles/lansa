

# Deepen Industry Insight Slide with Multi-Input + AI

## The Problem
Each industry currently asks ONE question and returns a hardcoded formula response. It feels generic and doesn't demonstrate Lansa's AI capabilities.

## The Solution
Turn each industry into a **multi-step intake form** (3-4 contextual questions) that feeds into a **Lovable AI edge function** to generate a truly personalized hiring analysis. This serves double duty: the insight is actually useful AND it showcases Lansa's AI before signup.

## New User Flow
1. User sees industry-specific questions (3-4 inputs, not just 1)
2. User fills them in (mix of sliders, selects, and text inputs)
3. Clicks "Analyze My Situation"
4. Loading state with "Lansa AI is analyzing your hiring data..."
5. AI returns a personalized multi-part response: headline stat, analysis paragraph, and a concrete recommendation tied to Lansa

## Industry Input Redesign

**Retail**: hires/year (slider), avg hourly wage (slider), biggest turnover stage (select: first week / first month / first 90 days), what screening do you use today (select: interviews only / references / skills tests / none)

**Hospitality**: peak season months (select), positions to fill (slider), current lead time weeks (select), biggest staffing pain (select: no-shows / skill mismatch / last-minute quits / training time)

**Tech**: team size (slider), % CV match (slider), primary roles hiring (select: frontend / backend / fullstack / data / devops), current vetting method (select: take-home / live coding / CV only / agency)

**Healthcare**: facility type (select), verification timeline (select), positions per quarter (slider), compliance concern level (select: low / moderate / high / critical)

**Finance**: candidates per hire (slider), avg time-to-fill weeks (slider), seniority level (select: junior / mid / senior / exec), screening bottleneck (select: volume / quality / compliance / speed)

**Other**: company size (select), biggest frustration (select), roles hiring for (text input), how many hires per year (slider)

## Files to Change

### 1. New Edge Function: `supabase/functions/b2b-industry-insight/index.ts`
- Accepts: `{ industry, inputs }` (no auth required -- public B2B tool)
- Uses `LOVABLE_API_KEY` to call Lovable AI Gateway
- System prompt: "You are Lansa's hiring intelligence engine. Given this employer's industry and situation data, produce a JSON response with: `headline_stat` (bold number/percentage), `headline_label` (what the stat means), `analysis` (2-3 sentences contextualizing their situation), `recommendation` (1-2 sentences on how Lansa specifically solves this). Be specific to their numbers, not generic."
- Uses tool calling to extract structured JSON output
- Returns the structured response
- `verify_jwt = false` in config.toml for this function

### 2. Rewrite: `src/components/for-business/slides/IndustryInsightSlide.tsx`
- Replace single-question config with multi-field config per industry
- New state machine: `collecting` -> `loading` -> `result`
- During `collecting`: render 3-4 inputs in a compact form layout (stacked on mobile, 2-col on desktop)
- During `loading`: animated skeleton with "Lansa AI is analyzing..." text + sparkle icon
- During `result`: AI-generated headline stat + analysis + recommendation, with "Powered by Lansa AI" badge and "Try again" button
- Call edge function via `supabase.functions.invoke('b2b-industry-insight', { body: { industry, inputs } })`

### 3. Minor: `supabase/config.toml`
- Add `[functions.b2b-industry-insight]` with `verify_jwt = false`

## Technical Details
- Uses `LOVABLE_API_KEY` (already provisioned) with `google/gemini-3-flash-preview` for fast responses
- Tool calling for structured output (headline_stat, headline_label, analysis, recommendation)
- No auth required -- this is a public lead-magnet tool
- Error fallback: if AI fails, show a static industry-specific insight (current behavior) with a note that AI is temporarily unavailable
- Mobile: inputs stack single-column, result view scrollable within the slide

