
# LANSA -- Application State Report
## Vision, Current Status, and Path to MVP

---

## 1. WHAT IS LANSA

Lansa is a career platform for the Curacao market serving three user types:

- **Job Seekers (Opportunity Seekers):** Build professional profiles, browse job listings, get AI-enhanced resumes, earn certifications, and discover career opportunities.
- **Employers:** Create organizations, post jobs, browse/swipe candidates, manage applications, and invite team members.
- **Mentors:** Upload educational video content, build profiles, and monetize through tiered subscriptions (Free / Starter / Pro).

The platform is monetized through:
- Certification exam fees for job seekers (XCG 25-50 per attempt)
- Tiered subscriptions for employers (candidate browsing access)
- Tiered subscriptions for mentors (video upload limits + promotional features)

Currency: XCG (Caribbean Guilder)

---

## 2. WHAT IS BUILT (Current State)

### Authentication and Routing
- Email/password signup and login -- WORKING
- Password reset flow -- WORKING
- Role-based route guards (job_seeker, employer, mentor) -- WORKING
- Onboarding enforcement before dashboard access -- WORKING
- Admin route with separate layout and guard -- WORKING

### Onboarding
- User type selection (4 paths: job seeker, create org, join org, mentor) -- WORKING
- Job seeker onboarding with career path segmentation (student, visionary, entrepreneur, freelancer, business) -- WORKING
- Employer/organization onboarding -- WORKING
- Mentor onboarding -- WORKING
- Join organization via invitation flow -- WORKING
- AI-generated onboarding insight card -- WORKING

### Job Seeker Dashboard
- Dashboard layout with top navbar and role-specific navigation -- WORKING
- Overview tab with profile card, discovery preview, recommended actions -- WORKING
- Growth Card system (AI-powered career growth cards) -- WORKING
- Job feed (/jobs) with card-based listings, filters, and detail panel (Sheet on desktop, Drawer on mobile) -- WORKING (logo fix just deployed)
- Legacy job feed (/jobs/legacy) -- EXISTS but secondary
- Profile editor with sections: About Me, Skills, Experience, Education, Achievements, Languages, Professional Goals, Biggest Challenge -- WORKING
- AI enhancement for About Me, Skills, and Professional Goals -- WORKING (just fixed)
- Profile sharing via public URL and QR code -- WORKING
- Content Library (mentor videos) -- WORKING
- Resources page -- EXISTS
- Notifications page -- EXISTS
- Profile designer (color palette/theme customization) -- WORKING

### Employer Dashboard
- Organization overview with stats (active jobs, applications, candidates viewed) -- WORKING
- Job posting dialog/wizard -- WORKING
- Job management tab -- WORKING
- Applications sheet with applicant profiles -- WORKING
- Candidate browsing with desktop split-panel layout (GSAP animations) and mobile swipe deck -- WORKING
- AI-generated match summaries for candidates -- WORKING
- Organization settings page -- WORKING
- Organization member invitation system -- WORKING
- Company logo upload -- WORKING
- Mobile employer dashboard with Lansa branding -- WORKING

### Mentor Dashboard
- Mentor profile form -- WORKING
- Video upload and management -- WORKING
- Subscription panel showing tier comparison (Free/Starter/Pro) -- WORKING (UI only, no payment)
- Approval banner (admin approval gate) -- WORKING
- Content Library integration -- WORKING

### Admin Panel
- User management -- EXISTS
- Organization management -- EXISTS
- Content management -- EXISTS
- Mentor management -- EXISTS
- Analytics, trends, historical data -- EXISTS
- Pricing management -- EXISTS
- Support, documents, updates -- EXISTS
- Settings -- EXISTS

### Shared Infrastructure
- Supabase auth, database, edge functions, storage
- 45+ edge functions deployed
- i18n setup (internationalization)
- Hotjar analytics, cookie consent
- Add-to-home-screen prompt (PWA-like)
- Announcement banner system
- GSAP animation library throughout

---

## 3. WHAT IS INCOMPLETE OR HIDDEN

These features have infrastructure but are explicitly hidden from users or not production-ready:

| Feature | Status | Detail |
|---|---|---|
| Resume Editor | HIDDEN from UI | Component-based builder exists, but PDF/JPEG export is broken across templates. Only Professional template has a dedicated export version. Other templates have sizing/rendering issues. |
| Certification Exam | HIDDEN from UI | Full exam flow, question system, and reflection report exist. No payment gateway. "Get Certified" button removed from profile and dashboard. |
| Story Builder | HIDDEN from UI | Tab exists but was explicitly removed from dashboard navigation. |
| Hire Rate Progress | HIDDEN from UI | Component exists with AI scoring logic but was removed from dashboard as incomplete. |
| Recommended Actions | HIDDEN from UI | Component exists on dashboard but was hidden per user request. |

---

## 4. WHAT IS POORLY IMPLEMENTED

### User Journey Issues

**A. Job Seeker Journey Gaps**
- No clear "what to do next" guidance after onboarding completes. Users land on a dashboard with Growth Cards but no structured onboarding-to-action path.
- Profile completion has no progress indicator visible on the dashboard (the progress hook exists but is not prominently surfaced).
- Discovery/Opportunity Discovery page exists but its purpose and relationship to the job feed is unclear -- two separate pages for similar goals.
- Job application status tracking exists but is not surfaced prominently to users.

**B. Employer Journey Gaps**
- No payment system for employer subscriptions (tiered candidate browsing access is planned but not implemented).
- Job posting has no preview-before-publish flow that mirrors what seekers see.
- No notification system for new applications (the notification infrastructure exists but employer-specific notifications are not connected).

**C. Mentor Journey Gaps**
- No payment processing for subscription tiers. The UI shows XCG 30/month and XCG 75/month but clicking upgrade does nothing.
- Admin approval gate exists but the admin panel's mentor approval workflow may not be fully connected.
- External upsell link feature (for Starter/Pro tiers) is in the data model but unclear if it renders in the Content Library for seekers.

### Data Infrastructure Issues

**A. Table Fragmentation**
- `job_listings` (deprecated) and `job_listings_v2` coexist. The legacy table caused a critical bug where the `fetch-job-feed` edge function was querying the wrong table.
- `job_applications` and `job_applications_v2` similarly coexist.
- `companies` table has `logo_url` columns that are all NULL -- the actual logos live on `organizations`. This caused the logo display bug just fixed.
- `UserAnswers` type in code only lists `job_seeker | employer` for `user_type` but the system supports `mentor` as a third type, creating a type mismatch.

**B. Public Profile Sync**
- `user_profiles_public` table exists for shareable profiles but requires a trigger update to aggregate certifications from `user_profile_certifications`. This was flagged but may not be resolved.
- Professional title synchronization between private editor and public profile has had issues (system-generated vs user-set titles).

**C. Edge Function Inconsistencies**
- `fetch-job-feed` was using ANON key (just fixed to SERVICE_ROLE_KEY), while `fetch-learning-job-feed` already used SERVICE_ROLE_KEY. Inconsistent patterns across functions.
- Some edge functions use OpenAI directly (OPENAI_API_KEY), others use the Lovable AI Gateway. No unified AI strategy.
- 45+ edge functions with no clear naming convention or documentation. Many appear to be one-off AI features (ai-90day-planner, ai-clarity-critic, ai-power-mirror, ai-profile-stylist, ai-skill-reframer) whose status and integration is unclear.

### System Infrastructure Issues

**A. Duplicate/Parallel Systems**
- Two job feed pages: `/jobs` (LearningJobFeed) and `/jobs/legacy` (JobFeed) with separate edge functions, components, and data flows.
- `BiggestChallengeSection.tsx` and `BiggestChallengeWithAI.tsx` -- two components for the same concept in different locations (about/ vs sidebar/).
- `ProfessionalGoalWithAI.tsx` in sidebar alongside the main profile sections -- unclear separation of concerns.

**B. Resume Export**
- PDF export is broken across most templates. Only the Professional template has a dedicated export version.
- JPEG export is hardcoded for only one template.
- HTML templates use CSS mm units instead of pixel-perfect A4 sizing.
- react-pdf templates cannot export as JPEG.
- This is a core free-user feature that is completely non-functional.

**C. AI Implementation**
- No unified AI service layer. Each feature calls its own edge function with different patterns.
- Some AI features work (profile enhancement, match summaries, growth cards), others are unclear (story builder, 90-day planner, clarity critic, power mirror).
- The "one enhancement per edit" rule is purely client-side state that resets on page reload -- no persistence.

---

## 5. PROMISES VS REALITY BY USER TYPE

### Job Seekers

| Promise | Reality |
|---|---|
| Build a professional profile | DELIVERED -- full profile editor with sections |
| AI-enhanced profile content | DELIVERED -- just fixed for all sections |
| Browse job listings | DELIVERED -- working with filters and detail panels |
| Apply to jobs | DELIVERED -- application system functional |
| Get certified to stand out | NOT DELIVERED -- exam exists but is hidden, no payment |
| Build and export resumes | NOT DELIVERED -- editor exists but export is broken |
| Share profile via link/QR | DELIVERED -- public profile working |
| Career coaching / AI coach | PARTIAL -- Growth Cards exist, but Story Builder and Hire Rate hidden |
| Content Library (learning) | DELIVERED -- mentor videos visible |

### Employers

| Promise | Reality |
|---|---|
| Create organization | DELIVERED |
| Post job listings | DELIVERED |
| Browse/swipe candidates | DELIVERED -- desktop split-panel + mobile swipe |
| AI match summaries | DELIVERED |
| Manage applications | DELIVERED |
| Invite team members | DELIVERED |
| Organization branding (logo) | DELIVERED |
| Tiered subscription access | NOT DELIVERED -- no payment system |
| Certified-only candidate pools | NOT DELIVERED -- certification system hidden |

### Mentors

| Promise | Reality |
|---|---|
| Upload educational videos | DELIVERED |
| Tiered subscription monetization | NOT DELIVERED -- UI shows tiers, no payment processing |
| External upsell link | UNCLEAR -- data model supports it, rendering unverified |
| Promotional appearances | NOT DELIVERED -- no promotion system visible |
| Admin approval workflow | PARTIAL -- banner exists, admin flow unclear |

---

## 6. CRITICAL PATH TO MVP

Priority items to reach a presentable MVP, ordered by impact:

### Must-Have (Blocking MVP)

1. **Payment Integration** -- Without payments, neither certification exams, employer subscriptions, nor mentor tiers generate revenue. This is the single biggest gap. Stripe or a local payment provider must be integrated.

2. **Resume PDF Export Fix** -- This is a core promise to free users. All templates must export cleanly to PDF. JPEG is secondary.

3. **Certification Exam Unhide + Payment Gate** -- The exam infrastructure works. Wire it to payment, unhide the button, and make certified badges visible to employers.

4. **Deprecate Legacy Tables** -- Remove or migrate away from `job_listings` and `job_applications` (v1). The coexistence creates bugs.

### Should-Have (Strengthens MVP)

5. **Employer Notifications** -- Employers need to know when someone applies. Basic email or in-app notification on new application.

6. **Profile Completion Guidance** -- A visible progress bar or checklist on the dashboard showing what's incomplete (bio, skills, experience, etc.).

7. **Public Profile Certification Sync** -- Ensure certifications earned show on the shareable public profile.

8. **Unified AI Strategy** -- Consolidate AI calls through the Lovable AI Gateway. Remove OpenAI dependency where possible. Document which AI features are active vs experimental.

### Nice-to-Have (Polish for MVP)

9. **Clean Up Duplicate Pages** -- Remove `/jobs/legacy`, consolidate the two job feed systems.

10. **Story Builder Decision** -- Either finish it or remove it entirely. Currently it's dead code.

11. **Hire Rate / Recommended Actions** -- Either bring back with improvements or permanently remove.

12. **Admin Panel Polish** -- Ensure mentor approval, content moderation, and user management flows are complete end-to-end.

---

## 7. TECHNICAL DEBT SUMMARY

- 45+ edge functions with no documentation or clear active/deprecated status
- Deprecated v1 database tables still referenced in some code paths
- `UserAnswers` TypeScript type does not include `mentor` as a user_type
- Mixed AI provider strategy (OpenAI API vs Lovable AI Gateway)
- Client-side only usage gating for AI (resets on reload)
- Resume export architecture needs complete rework per template
- Two parallel job feed systems with separate edge functions
- Console.log statements in production App.tsx (lines 68-69)
