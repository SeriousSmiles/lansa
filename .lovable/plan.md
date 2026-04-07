

# Update Pricing Model Across Platform

## Business Rules (from user)

**Professionals (Students & Employees)**
- Platform is **100% free** — profile, CV, job discovery, messaging
- Only paywall: **XCG 25 for 2 exam attempts** per certification
- No Pro tier exists yet — mark as "Coming Soon"
- No freelancer/entrepreneur/visionary path yet — remove or mark "Coming Soon"

**Employers**
- **No free plan** — employer access is paid only
- Currently in **open beta**: cherry-picked pilot companies get free access (limited time)
- Single paid tier with commitment-based pricing:
  - **3 months**: XCG 150/month
  - **6 months**: discounted (e.g. XCG 125/month — save 17%)
  - **12 months**: discounted (e.g. XCG 100/month — save 33%)
- All plans include: unlimited swipes, AI summaries, priority listings, analytics, certified candidates

## Files to Change

### 1. `src/pages/Pricing.tsx`

**Professionals tab:**
- Keep "Free" card with updated features: AI profile, CV generation, job discovery, messaging, mentor content
- Add a line: "Certification exams: XCG 25 per exam (2 attempts included)"
- Rename "Pro" card to "Coming Soon" — keep the features listed but gray them out, CTA becomes "Join Waitlist"
- Remove any freelancer/entrepreneur language

**Businesses tab:**
- Remove the "Basic / Free" tier entirely
- Replace with a single plan card showing **commitment-based pricing toggle** (3mo / 6mo / 12mo)
- Default to 3-month view: XCG 150/month
- Show savings badge on 6mo and 12mo options
- Features: unlimited swipes, job posting wizard, in-app messaging, certified candidates, AI summaries, priority listings, analytics, dedicated support
- Add an "Open Beta" banner: "Selected companies are piloting Lansa for free. Contact us to apply."

**Comparison table:**
- Professionals: update to Free vs Coming Soon
- Businesses: single column (all features included), or remove comparison table for businesses since there's only one tier

**FAQ updates:**
- Update "Is Lansa really free?" → clarify certification paywall
- Update XCG answer (it's Caribbean Guilder, ANG — not Eastern Caribbean Dollar)
- Update cancellation FAQ for commitment-based model
- Update swipes FAQ (no free tier anymore)

### 2. `src/components/for-business/slides/PricingSlide.tsx`

- Remove the Basic/Free card
- Show a single employer plan with a **3-column commitment picker** (3mo / 6mo / 12mo)
- Each column shows the monthly price and total commitment
- Highlight 6mo or 12mo as "Best Value"
- Add open beta callout: "Piloting with select companies — contact us"
- Update headline from "Start Free. Scale When Ready." to something like "Built for Hiring. Priced for Commitment."
- Detail sheet content updated accordingly

### 3. `src/components/employer/EmployerSubscriptionPanel.tsx`

- Remove "Basic / Free" plan
- Update Premium price from XCG 75 to XCG 150
- Add commitment duration selector (3mo / 6mo / 12mo) with savings display
- Update PaymentModal metadata to pass correct amounts

## Pricing Table (for reference)

| Commitment | Monthly Price | Total | Savings |
|---|---|---|---|
| 3 months | XCG 150 | XCG 450 | — |
| 6 months | XCG 125 | XCG 750 | Save 17% |
| 12 months | XCG 100 | XCG 1,200 | Save 33% |

*Note: The 6mo and 12mo discount percentages are estimated. Please confirm the exact pricing if different.*

