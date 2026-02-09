

## Phase 2: Mentor User Type, Dashboard, and Pricing Tiers

### Overview
Introduce "Mentor" as a new user type in Lansa for teachers, coaches, and organizations who upload educational video content and link to their external platforms. Mentors get a dedicated dashboard, tiered pricing in XCG (Caribbean Guilder), and the ability to manage their own video content with limits based on their subscription tier.

### What Gets Built

#### 1. Database: Mentor Infrastructure

**A. Add `mentor` to `app_role` enum**
Extend the existing `app_role` enum to include `'mentor'`, following the same pattern as `'business'` and `'student'`.

**B. New table: `mentor_profiles`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Auto-generated |
| user_id | uuid | References auth.users, unique |
| display_name | text | Public name shown on content |
| bio | text | Short description |
| mentor_type | enum ('teacher', 'coach', 'organization') | What kind of mentor |
| external_url | text | Link to their external platform/courses |
| profile_image | text | Avatar URL |
| created_at / updated_at | timestamps | Auto-managed |

**C. New table: `mentor_subscriptions`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Auto-generated |
| user_id | uuid | References auth.users, unique |
| tier | enum ('free', 'starter', 'pro') | Subscription level |
| price_xcg | numeric | 0, 30, or 75 |
| started_at | timestamp | When subscription began |
| expires_at | timestamp | Nullable for free tier |
| is_active | boolean | Default true |
| created_at | timestamp | Auto-managed |

**D. Extend `content_videos` table**
Add columns to support mentor-uploaded content:
- `mentor_id` (uuid, nullable) -- links video to the mentor who uploaded it
- `external_link` (text, nullable) -- mentor's upsell link shown on video detail
- `is_promoted` (boolean, default false) -- for Pro tier promotional appearances

**E. RLS Policies**
- Mentors can INSERT/UPDATE/DELETE their own videos (where `mentor_id = auth.uid()`)
- Mentors can only INSERT videos if within their tier's video limit (enforced via a database function)
- Published mentor videos are visible to all authenticated users
- Mentor profiles are publicly readable

#### 2. Subscription Tier Limits (enforced server-side)

| Tier | Videos | External Link | Promotional | Price |
|------|--------|---------------|-------------|-------|
| Free | 1 | No | No | XCG 0 |
| Starter | 3 | Yes | No | XCG 30/month |
| Pro | Unlimited | Yes | Yes | XCG 75/month |

A database function `check_mentor_video_limit(user_id)` will validate insert permissions based on the mentor's active subscription tier and current video count.

#### 3. User Type Flow Updates

**A. `CareerPathSegmentation` component**
- Add a new "Mentor" career path card (currently not in the list)
- Uses a distinct icon (e.g., `GraduationCap` or `Users`) and description
- Not marked as "Coming Soon" -- fully functional

**B. `UserStateProvider` updates**
- Add `'mentor'` to the `userType` union type alongside `'job_seeker'` and `'employer'`
- Mentor users get routed to `/mentor-dashboard` after onboarding

**C. `RequireUserType` guard**
- Update the `allowedTypes` union to include `'mentor'`

**D. Mentor onboarding flow**
A simple 2-step onboarding after selecting the Mentor path:
1. **Profile setup**: Display name, bio, mentor type (teacher/coach/organization), profile image upload
2. **Tier selection**: Show the 3 tiers with pricing, default to Free

#### 4. Mentor Dashboard (`/mentor-dashboard`)

A completely separate dashboard from job seekers and employers with these sections:

**Header**: Mentor name, tier badge, video count / limit indicator

**Tabs/Sections**:
- **My Videos**: List of mentor's uploaded videos with add/edit/delete. Shows remaining upload slots based on tier.
- **Upload Video**: YouTube link or native upload form (reuses existing `VideoForm` pattern but scoped to mentor)
- **My Profile**: Edit mentor display name, bio, external link, profile image
- **Subscription**: Current tier, upgrade options, tier comparison table

**Desktop**: Sidebar nav with these sections
**Mobile**: Bottom tab or top tab navigation

#### 5. Content Library Integration

On the user-facing `/content` page:
- Mentor-uploaded videos appear alongside admin-uploaded videos
- Mentor videos show the mentor's name and a "Mentor" badge (distinct from YouTube/Uploaded badges)
- If mentor has an `external_link` and is on Starter/Pro tier, show a "Visit Mentor" button in the video detail panel
- Pro tier mentors get a subtle "Featured" highlight on their video cards

#### 6. Routing

| Route | Guard | Component |
|-------|-------|-----------|
| `/mentor-dashboard` | `RequireUserType(['mentor'])` | MentorDashboard |
| `/mentor-dashboard/upload` | `RequireUserType(['mentor'])` | MentorVideoUpload |
| `/mentor-dashboard/profile` | `RequireUserType(['mentor'])` | MentorProfileEdit |
| `/mentor-dashboard/subscription` | `RequireUserType(['mentor'])` | MentorSubscription |

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/MentorDashboard.tsx` | Main mentor dashboard with tabs |
| `src/components/mentor/MentorVideoList.tsx` | Mentor's own video management |
| `src/components/mentor/MentorVideoUpload.tsx` | Upload form scoped to mentor |
| `src/components/mentor/MentorProfileForm.tsx` | Edit mentor profile |
| `src/components/mentor/MentorSubscriptionPanel.tsx` | Tier display and upgrade UI |
| `src/components/mentor/MentorOnboarding.tsx` | 2-step mentor onboarding flow |
| `src/components/mentor/TierBadge.tsx` | Reusable tier badge component |
| `src/hooks/useMentorProfile.ts` | CRUD hooks for mentor profile |
| `src/hooks/useMentorSubscription.ts` | Subscription query/mutation hooks |
| `src/hooks/useMentorVideos.ts` | Mentor's video CRUD with limit checks |

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add mentor routes with guards |
| `src/contexts/UserStateProvider.tsx` | Add `'mentor'` to userType union, route mentor users correctly |
| `src/components/auth/RouteGuards.tsx` | Add `'mentor'` to `RequireUserType` allowedTypes |
| `src/components/auth/DefaultRoute.tsx` | Route mentors to `/mentor-dashboard` |
| `src/components/onboarding/CareerPathSegmentation.tsx` | Add Mentor career path option |
| `src/pages/Onboarding.tsx` | Handle mentor onboarding flow |
| `src/hooks/useContentVideos.ts` | Update queries to include mentor info |
| `src/components/content/VideoCardList.tsx` | Show mentor badge on mentor videos |
| `src/components/content/VideoDetail.tsx` | Show mentor info and external link |
| `src/pages/ContentLibrary.tsx` | Fetch mentor profile data alongside videos |
| SQL migration | New tables, enum values, RLS policies, functions |

### Technical Details

- **Tier enforcement**: A `check_mentor_video_limit` SECURITY DEFINER function counts the mentor's published videos and compares against tier limits. This is called in an RLS INSERT policy on `content_videos` for mentor uploads.
- **Subscription management**: Phase 2 uses manual tier assignment (no payment gateway yet). Admins can change tiers via the admin panel. Payment integration (Stripe/local gateway for XCG) would be Phase 3.
- **Mentor type enum**: `CREATE TYPE public.mentor_type AS ENUM ('teacher', 'coach', 'organization')`
- **Subscription tier enum**: `CREATE TYPE public.subscription_tier AS ENUM ('free', 'starter', 'pro')`
- **Video ownership**: `content_videos.mentor_id` is nullable. NULL = admin-uploaded, non-null = mentor-uploaded. This preserves the existing admin video system.
- **External link visibility**: Only shown if mentor is on starter/pro tier AND has set an external_link.

### What's NOT in This Phase

- Payment gateway integration (Stripe, local XCG payment processor)
- Automatic subscription renewal/expiry
- Mentor analytics (views, engagement metrics)
- Mentor verification/approval workflow by admins
- Mentor search/discovery page

These would be planned as Phase 3 enhancements.

