
# Three-Track MVP Sprint: Certification + Payment + Resume Export

## Track 1: Unhide and Activate the Certification System

### Current State
- The `/certification` route is fully functional with 4 sector exams (Office, Service, Technical, Digital)
- Routes are already registered in App.tsx and protected by RequireUserType
- CertificationCard component exists on the dashboard but navigation to it may be suppressed
- The onboarding page should link directly to this same `/certification` flow
- `lansa_certified` flag in `user_certifications` table tracks certification status
- `cert_certifications` table stores per-sector results with verification codes
- Employers already filter candidates by `lansa_certified = true AND verified = true`
- Public profile sync trigger already includes `user_profile_certifications` data
- BUT: the `lansa_certified` flag in `user_certifications` is separate from `cert_certifications` -- these need to sync when a user passes an exam

### Changes Required

**1.1 Ensure CertificationCard is visible on the dashboard**
- File: `src/components/dashboard/overview/OverviewTab.tsx`
- Verify `CertificationCard` is rendered (not commented out)
- If hidden, unhide it so seekers see "Get Certified" / "View Dashboard" on their Overview tab

**1.2 Add "Get Certified" CTA to onboarding completion**
- File: `src/components/onboarding/` (the seeker completion step)
- After onboarding completes, show a prominent card linking to `/certification`
- This uses the same 4-sector system -- no separate assessment

**1.3 Sync certification pass to `user_certifications.lansa_certified`**
- Currently the exam writes to `cert_results` and `cert_certifications`, but nothing sets `user_certifications.lansa_certified = true`
- Create a database trigger: when a row is inserted into `cert_certifications` with `pass_fail = true`, upsert into `user_certifications` setting `lansa_certified = true` and `verified = true`
- This makes the certified badge automatically appear in employer browsing (discoveryService already filters on this)

**1.4 Add Lansa Certified badge to candidate cards**
- File: `src/components/discovery/SwipeDeck.tsx` and `src/components/discovery/desktop/SplitPanelBrowser.tsx`
- The `DiscoveryProfile` type needs a `lansa_certified` field
- Render a green "Lansa Certified" badge on candidate cards when `lansa_certified === true`
- File: `src/services/discoveryService.ts` -- ensure certification status is included in the profile data returned

**1.5 Add certification badge to shared public profiles**
- File: `src/pages/SharedProfile.tsx` (or the shared profile components)
- Check `user_profiles_public.lansa_certified` or check `user_certifications` table
- Display a verified certification badge with sector name and score
- The sync trigger already includes `user_profile_certifications` data in `user_profiles_public.certifications`

**1.6 Payment gate before exam (see Track 2)**

---

## Track 2: Sentoo Payment Integration Architecture

### Sentoo Overview
Sentoo is a Caribbean A2A (Account-to-Account) payment gateway. The flow is:
1. Merchant creates a payment request via REST API
2. Customer is redirected to their bank's online/mobile banking
3. Customer authorizes the payment in their secure bank environment
4. Sentoo sends a webhook/callback confirming payment success
5. Funds settle immediately to merchant bank account

Key facts:
- Supports XCG, AWG, USD currencies
- Works with MCB Curacao, Banco di Caribe, CMB, Orco Bank, WIB, and others
- Pricing: 1% per transaction, capped at $1.50
- No monthly fees, no contractual period
- API docs are private (provided after Merchant Agreement signing)

### Architecture Plan (Pre-API-Docs)

Since you're in the process of signing up, we will build the complete payment infrastructure with a clean abstraction layer. Once you receive the Sentoo Merchant Key and API docs, we simply implement the adapter.

**2.1 Database: Payment tables**

New migration creating:
```
payments (
  id uuid PK,
  user_id uuid FK,
  payment_type text ('certification_exam' | 'employer_subscription' | 'mentor_subscription'),
  amount_cents integer,
  currency text DEFAULT 'XCG',
  status text ('pending' | 'processing' | 'completed' | 'failed' | 'refunded'),
  provider text DEFAULT 'sentoo',
  provider_payment_id text,
  provider_metadata jsonb,
  metadata jsonb, -- e.g. { sector: 'office' } for exams
  created_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz
)

subscriptions (
  id uuid PK,
  user_id uuid FK,
  plan_type text ('employer_basic' | 'employer_premium' | 'mentor_starter' | 'mentor_pro'),
  status text ('active' | 'cancelled' | 'expired' | 'past_due'),
  current_period_start timestamptz,
  current_period_end timestamptz,
  amount_cents integer,
  currency text DEFAULT 'XCG',
  created_at timestamptz,
  cancelled_at timestamptz
)
```

RLS policies: users can read their own payments/subscriptions. Insert/update only via edge functions (service role).

**2.2 Edge function: `create-payment`**

Handles one-time payments (certification exams):
- Receives: `{ type: 'certification_exam', sector: 'office', amount: 2500 }` (amount in cents, 25 XCG)
- Creates a `payments` record with status 'pending'
- Calls Sentoo API to create payment request (placeholder until API docs received)
- Returns: `{ payment_id, redirect_url }` -- redirect_url sends user to bank authorization

**2.3 Edge function: `payment-webhook`**

Receives callbacks from Sentoo when payment completes:
- Validates the webhook signature (Sentoo authentication)
- Updates payment status to 'completed'
- For certification payments: unlocks the exam for the user (stores in `payment_unlocks` or checks payment status before allowing exam start)

**2.4 Edge function: `manage-subscription`**

Handles recurring subscriptions:
- Create, cancel, check status
- Since Sentoo may not support automatic recurring billing, the subscription system will:
  - Track subscription periods manually
  - Send reminder emails before period end
  - Require user to manually renew (re-authorize payment) each period
  - This matches the "we might have to build the automatic system ourselves" requirement

**2.5 Frontend: Payment flow for certification**
- When user clicks "Start Exam" on CertificationDashboard, check if they have an active payment for that sector
- If no payment: show a payment modal with price (25 XCG), Sentoo button
- On click: call `create-payment` edge function, redirect to Sentoo/bank
- On return: verify payment status, allow exam start
- File changes: `src/components/certification/CertificationDashboard.tsx` -- add payment check before `handleStartExam`

**2.6 Frontend: Subscription UI for employers and mentors**
- Employer dashboard: update subscription panel with real payment buttons
- Mentor dashboard: connect tier upgrade buttons to payment flow
- Both use the same `create-payment` / `manage-subscription` edge functions

**2.7 Sentoo adapter pattern**

All Sentoo-specific API calls go through a single file:
```
supabase/functions/_shared/sentoo-client.ts
```

This file exports:
- `createPayment(amount, currency, description, returnUrl, webhookUrl)`
- `getPaymentStatus(paymentId)`
- `validateWebhook(headers, body)`

When you receive the API docs, we only need to fill in this one file. Everything else is already wired up.

---

## Track 3: Resume PDF Export Fix

### Current State
- 6 HTML export templates exist: Classic, Creative, Logos, Modern, Professional, Timeline
- Professional also has a multi-page variant
- 3 react-pdf templates: Academic, Minimal, Professional
- `HTMLToPDFGenerator` uses html2canvas + jsPDF to capture HTML templates
- HTML templates use pixel-perfect A4 sizing (2480x3508px at 300 DPI)
- The Professional template has extensive html2canvas text-shift compensation hacks
- The `useHTMLPDFGeneration` hook hardcodes template IDs (`pdf-resume-template` or `pdf-resume-export-container`)
- The Resume Editor (`ResumeEditorLayout`) has `handleExport` as a TODO stub

### Core Problems
1. **Resume Editor export is a TODO** -- the `EditorToolbar.tsx` export buttons log to console and do nothing
2. **Template selection is not connected to export** -- `useHTMLPDFGeneration` always looks for element ID `pdf-resume-template`, but doesn't know which template the user selected
3. **react-pdf templates work differently** -- they use `@react-pdf/renderer` and generate PDFs natively (no html2canvas), but the export flow doesn't route to them
4. **html2canvas text shifting** -- the Professional template has negative margin hacks, but other templates don't, causing inconsistent output

### Fix Strategy

**3.1 Unified export service**

Create `src/services/resumeExportService.ts` that:
- Accepts template name and resume data
- Routes to the correct export method:
  - HTML templates (Classic, Creative, Logos, Modern, Professional, Timeline) -> html2canvas + jsPDF
  - react-pdf templates (Academic, Minimal, Professional) -> `@react-pdf/renderer` blob generation
- Each HTML export template already has pixel-perfect 2480x3508 sizing -- this is correct

**3.2 Fix html2canvas rendering for all HTML templates**

Apply the same text-shift compensation pattern from ProfessionalTemplateExport to all HTML export templates:
- `ClassicTemplateExport.tsx` -- add lineHeight reduction and negative margins
- `CreativeTemplateExport.tsx` -- same
- `LogosTemplateExport.tsx` -- same
- `ModernTemplateExport.tsx` -- same
- `TimelineTemplateExport.tsx` -- same

These are small CSS adjustments per template (reduce lineHeight from 1.6 to ~1.5, add -6px to -12px marginTop on headings).

**3.3 Fix react-pdf export path**

The `reactPdfFactory.tsx` already has the routing. Create a unified function:
- Import `pdf()` from `@react-pdf/renderer`
- Generate a blob directly from the react-pdf Document component
- Download it as PDF
- No html2canvas needed -- react-pdf generates native PDF

**3.4 Wire the Resume Editor export**

Update `EditorToolbar.tsx`:
- Replace the TODO `handleExport` with actual export logic
- Call the unified export service with current template + data
- Show loading state during generation

**3.5 Template rendering for export**

The export templates need to be rendered off-screen in the DOM for html2canvas to capture them. Create a hidden container component that:
- Mounts the selected HTML export template with the user's data
- Gives it the correct element ID
- Triggers html2canvas capture
- Unmounts after export completes

This pattern already exists partially (the `pdf-resume-template` ID convention) but needs to be formalized for all templates.

---

## Files to Change Summary

### Track 1 -- Certification
| File | Change |
|---|---|
| `src/components/dashboard/overview/OverviewTab.tsx` | Ensure CertificationCard is rendered |
| `src/components/onboarding/` (completion step) | Add "Get Certified" CTA linking to /certification |
| New migration | Trigger: cert_certifications insert -> upsert user_certifications.lansa_certified |
| `src/services/discoveryService.ts` | Include lansa_certified in profile data |
| `src/components/discovery/SwipeDeck.tsx` | Render certified badge on cards |
| `src/components/discovery/desktop/SplitPanelBrowser.tsx` | Render certified badge on desktop cards |
| `src/pages/SharedProfile.tsx` | Display certification badge on public profile |

### Track 2 -- Payment
| File | Change |
|---|---|
| New migration | Create `payments` and `subscriptions` tables with RLS |
| `supabase/functions/_shared/sentoo-client.ts` | Sentoo API adapter (placeholder) |
| `supabase/functions/create-payment/index.ts` | New edge function for payment creation |
| `supabase/functions/payment-webhook/index.ts` | New edge function for payment callbacks |
| `supabase/functions/manage-subscription/index.ts` | New edge function for subscriptions |
| `src/components/certification/CertificationDashboard.tsx` | Payment gate before exam start |
| `src/components/certification/PaymentModal.tsx` | New payment UI component |
| `src/hooks/usePayment.ts` | New hook for payment state management |
| `src/components/dashboard/employer/SubscriptionPanel.tsx` | Wire real payment buttons |
| `src/components/dashboard/mentor/MentorSubscriptionPanel.tsx` | Wire real payment buttons |

### Track 3 -- Resume Export
| File | Change |
|---|---|
| `src/services/resumeExportService.ts` | New unified export routing service |
| `src/components/pdf/templates/ClassicTemplateExport.tsx` | Add text-shift compensation |
| `src/components/pdf/templates/CreativeTemplateExport.tsx` | Add text-shift compensation |
| `src/components/pdf/templates/LogosTemplateExport.tsx` | Add text-shift compensation |
| `src/components/pdf/templates/ModernTemplateExport.tsx` | Add text-shift compensation |
| `src/components/pdf/templates/TimelineTemplateExport.tsx` | Add text-shift compensation |
| `src/components/resume-editor/EditorToolbar.tsx` | Replace TODO with real export logic |
| `src/hooks/useHTMLPDFGeneration.tsx` | Support template selection parameter |
| `src/components/resume-editor/ExportContainer.tsx` | New hidden render container for export |

---

## Implementation Order

1. **Track 1 first** (Certification unhide + badge sync) -- purely frontend/DB, no external dependency
2. **Track 2 database + architecture** (Payment tables, edge functions with placeholder Sentoo adapter) -- ready to wire when API docs arrive
3. **Track 3** (Resume export fixes) -- independent, can be done in parallel
4. **Track 2 completion** (Sentoo adapter fill-in) -- blocked on receiving API docs from Sentoo

This order maximizes what we can ship immediately while the Sentoo merchant agreement processes.
