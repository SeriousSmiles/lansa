# Lansa app-wide modern redesign (desktop, tablet, phone)

Keep: Urbanist/Public Sans fonts, Lansa orange, blue, deep navy, peach, logo. Everything else (layout, element styling, colour usage) follows the selected Mobbin screens. Not published.

## Selected references (Mobbin, web)
- App shell: Upwork home (slim icon rail + main column + right profile/progress rail), Threads (centred single feed column, floating compose), Gumloop (quiet "Welcome back" home with two activity lists).
- List + detail: Mercor "Explore opportunities" (search, filter chips, card list left, sticky detail with step progress right), Twenty company record (grouped fields left, tabs centre, side record), Square team members (table + slide-over detail).
- Side sheets: incident.io (dimmed list, right detail drawer with status chips).
- Empty states: Meetup and GetYourGuide (one warm illustration, one sentence, one primary action), Plane invites.
- Phone: keep the saved "Lansa Inspo" iOS collection (Bumble, Handshake, pillowtalk, Plenty of Fish) already used.

## Visual system changes
- Warm off-white canvas, white rounded cards (16-20px), hairline borders instead of heavy shadows, one coloured accent per screen.
- Colour use: orange only for primary actions and active states; blue for links/info; navy for headings and dark promo banners; peach for identity/hero bands. No grey/purple fills.
- Tablet (768-1279): icon rail + content, detail opens as a right drawer. Desktop (1280+): rail + content + contextual right rail or split detail.
- Consistent page header (title, short subtitle, one primary button), filter chip row, list row and status chip components.

## Painted illustrations
Generate ~10 painted, warm, people-first illustrations (diverse Caribbean professionals) for: empty feed, empty jobs/saved, no applicants, empty inbox, no notifications, learning/resources, certification, onboarding welcome, employer home promo, 404/not allowed. Stored as local assets, used through one `Illustration` empty-state component.

## Phases (all in this request)
1. Shared foundation: tokens, app shell (rail/sidebar, top bar, right rail), PageHeader, FilterChips, ListRow, DetailDrawer, EmptyState + illustrations.
2. Seeker: Dashboard home, Feed, Jobs/Discovery (Mercor split view), Profile, Notifications, Chat, Resources/Content library, Certification, Card, Resume entry.
3. Employer: Home, Jobs + applicants (split/drawer), Browse candidates, Organization settings (Twenty/Square grouped layout), Inbox.
4. Auth + misc: Login, Signup, Forgot/Reset password, Onboarding wide layout, Pricing, Help, 404/Not allowed, Mentor dashboard, Admin surface styling only.
5. QA: 390 / 768 / 1280 / 1440 Playwright captures with isolated fixtures, fix overflow, contact sheet to /mnt/documents/lansa-redesign.png.

## Technical notes
- Presentation-only: no data, permission, route or RLS changes; existing tested models untouched; run existing tests.
- Styles live in global semantic tokens and the shared .ee-* primitives so seeker/employer stay in sync; AGENTS.md rule updated.
- Public homepage hero is kept as is.
