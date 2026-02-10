
# Next Sprint: Resume Export Completion + Subscription Payment Wiring

## Priority 1: Complete Resume PDF Export Fixes (Track 3 Remaining)

### 1.1 Fix remaining HTML export templates
The Classic and Logos templates already received text-shift compensation. Three templates still need it:

- **CreativeTemplateExport.tsx** -- Reduce lineHeight from current value to ~1.45, add negative marginTop on heading elements
- **ModernTemplateExport.tsx** -- Same pattern
- **TimelineTemplateExport.tsx** -- Already has lineHeight 1.5 but needs heading margin compensation

Each fix is a small CSS adjustment (2-4 lines per template) following the exact pattern already applied to ClassicTemplateExport.

### 1.2 Create unified resumeExportService.ts
A single service that:
- Accepts a template name + PDFResumeData
- Routes HTML templates (Classic, Creative, Logos, Modern, Professional, Timeline) through html2canvas + jsPDF
- Routes react-pdf templates (Academic, Minimal) through @react-pdf/renderer blob generation
- Handles off-screen rendering: mounts the export template in a hidden container, captures it, then cleans up
- Returns a downloadable file

### 1.3 Improve EditorToolbar export
The current implementation captures whatever `[data-resume-canvas]` points to. This works for the component-based editor but does not integrate with the template preview system. Update to:
- Use the unified export service when a template is selected
- Fall back to canvas capture for the freeform editor

---

## Priority 2: Wire Subscription Panels to Payment System

### 2.1 MentorSubscriptionPanel.tsx
Currently shows tier cards (Free / Starter at XCG 30 / Pro at XCG 75) with "Upgrade" buttons that do nothing. Changes:
- Import and use `usePayment` hook
- On "Upgrade" click, call `create-payment` with `type: 'mentor_subscription'` and the selected plan
- Show PaymentModal with tier-specific pricing
- On payment completion, update the `mentor_subscriptions` table tier
- In test mode (no Sentoo key), auto-complete as already implemented

### 2.2 Employer Subscription UI
The employer dashboard needs a subscription panel. Changes:
- Create or update an employer subscription component showing tiered access (Basic / Premium)
- Wire upgrade buttons to `create-payment` with `type: 'employer_subscription'`
- Gate candidate browsing features behind active subscription status
- Show PaymentModal with employer-specific pricing

### 2.3 Shared PaymentModal enhancements
The current PaymentModal is hardcoded for certification exams (XCG 25, exam-specific copy). Generalize it:
- Accept `paymentType` prop (certification, mentor_subscription, employer_subscription)
- Dynamic pricing display based on type
- Dynamic benefit list based on type
- Reuse across all three payment flows

---

## Priority 3: Legacy Table Deprecation (if time permits)

### 3.1 Audit v1 table references
Search all edge functions and frontend code for references to `job_listings` (not v2) and `job_applications` (not v2). Document every reference.

### 3.2 Migration plan
- Update any remaining code paths to use v2 tables exclusively
- Add database views or redirects if needed for backward compatibility
- Mark v1 tables as deprecated with a migration comment

---

## Files to Change

| File | Change |
|---|---|
| `src/components/pdf/templates/CreativeTemplateExport.tsx` | Text-shift compensation (lineHeight + marginTop) |
| `src/components/pdf/templates/ModernTemplateExport.tsx` | Text-shift compensation |
| `src/components/pdf/templates/TimelineTemplateExport.tsx` | Heading margin compensation |
| `src/services/resumeExportService.ts` | New unified export routing service |
| `src/components/resume-editor/EditorToolbar.tsx` | Integrate unified export service |
| `src/components/certification/PaymentModal.tsx` | Generalize for multiple payment types |
| `src/components/mentor/MentorSubscriptionPanel.tsx` | Wire upgrade buttons to payment flow |
| `src/hooks/usePayment.ts` | Support subscription payment types |
| New: `src/components/employer/EmployerSubscriptionPanel.tsx` | Employer subscription UI with payment |
| Employer dashboard page | Add subscription tab/panel |

## Implementation Order
1. Template text-shift fixes (quick wins, 3 files)
2. Unified export service + editor integration
3. Generalize PaymentModal for all payment types
4. Wire MentorSubscriptionPanel to payments
5. Create and wire EmployerSubscriptionPanel
6. Legacy table audit (if time permits)
