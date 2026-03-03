
## Understanding the Full Flow

The current "Who's Interested in You" section shows employer cards with a "Swipe Back" CTA that navigates to the discover tab. This is wrong for several reasons:
1. The metaphor is wrong — candidates shouldn't "swipe back", they should **respond to interest**
2. There's no context about WHY this employer is interesting (what job do they have open?)
3. There's no ability to open a chat directly from here
4. When a match already exists (mutual swipe → chat thread created), the card should surface that thread

The user wants:
- **Notification-style cards** — feel like an "alert" someone is interested
- **CTA: "Review"** → opens a drawer showing the employer's profile + their open job listings
- **Context label**: shows whether employer Liked or Super Interested (nudge)
- **Open Chat button** inside the drawer (only if a mutual match/thread exists already, OR create one on demand)
- **Email to employer** when candidate opens chat — notifying them of the mutual match

---

## What Needs to Be Built

### 1. New `EmployerInterestDrawer` component
A bottom drawer (mobile) / side sheet (desktop) that opens when "Review" is clicked, showing:
- Employer avatar, name, title, company name
- Interest type badge (Liked / Super Interested)
- Their open job listings fetched from `job_listings_v2` filtered by `created_by = employer_id`
- "Open Chat" button at the bottom — navigates to the existing match thread or creates a new one and notifies the employer

### 2. Redesigned `WhoIsInterestedSection` cards
Transform from mini profile cards → notification-style cards:
- Softer card with a left accent border (green for liked, amber for nudge)
- Notification icon + "expressed interest in your profile"
- Interest type label with icon
- Date/time of interest (relative: "2 days ago")
- Single full-width "Review" CTA button (replaces "Swipe Back")

### 3. Chat thread resolution logic in the drawer
When "Open Chat" is clicked:
- Check `matches` table for `(user_a = candidateId AND user_b = employerId) OR (user_a = employerId AND user_b = candidateId)`
- If match exists → check `chat_threads` for the thread → navigate to `/chat/{threadId}`
- If no match yet → create a swipe (`direction: 'right'`), which triggers the DB match creation → then find the new thread

### 4. Email notification to employer when chat is opened
When the candidate clicks "Open Chat", invoke `send-chat-email` edge function with:
- `user_id`: employer's user_id
- `notification_type`: `match_created` (already has an email template)
- `action_url`: `/chat/{threadId}`

This satisfies the requirement: "sends email notification to the business that chat has been opened by mutual match/interest."

---

## Files to Change

| File | Change |
|---|---|
| `src/components/dashboard/WhoIsInterestedSection.tsx` | Full redesign — notification cards, "Review" CTA |
| `src/components/dashboard/EmployerInterestDrawer.tsx` | New file — drawer with employer profile + jobs + Open Chat |

### `WhoIsInterestedSection.tsx` — New card design

```
┌─────────────────────────────────────────────────────┐
│ [green accent border]                               │
│  [Avatar]  Acme Corp                    2 days ago  │
│            Marketing Manager                        │
│            ♥ Liked your profile                     │
│                                                     │
│  [           Review →           ]                   │
└─────────────────────────────────────────────────────┘
```

### `EmployerInterestDrawer.tsx` — Drawer content

```
┌──────────────────────────────────────┐
│  [Cover banner]                      │
│  [Avatar] Employer Name              │
│           Company · Title            │
│           ♥ Liked / ⚡ Super Interest│
│  ──────────────────────────────────  │
│  Open Positions (2)                  │
│  ┌────────────────────────────────┐  │
│  │ Marketing Manager · Full-time  │  │
│  │ Remote · $50k–$70k             │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Content Writer · Part-time     │  │
│  └────────────────────────────────┘  │
│  ──────────────────────────────────  │
│  [      Open Chat & Connect      ]   │
└──────────────────────────────────────┘
```

The "Open Chat & Connect" button:
1. Calls `candidateDiscoveryService.handleSwipe('right', employer)` if no match exists yet — this creates the match and chat thread via the existing DB trigger
2. Queries `chat_threads` to find the thread where both users are participants
3. Calls `send-chat-email` edge function to notify the employer
4. Navigates to `/chat/{threadId}`

No DB migrations needed — reuses existing `swipes`, `matches`, `chat_threads`, and `job_listings_v2` tables.
