
# Lansa In-App Mutual Consent Chat System — Full Implementation Plan

## Context Summary

The codebase already has:
- `chat_threads` and `chat_messages` tables (basic structure, no consent gating)
- `matches` table + `create_match_if_mutual` trigger + `create_thread_on_match` trigger
- `notifications` table + `notificationService` with real-time subscriptions
- `swipes` table tracking right/left/nudge directions
- Resend email infrastructure via `_shared/emailService.ts` and `_shared/emailTemplates.ts`
- Existing Supabase secret: `RESEND_API_KEY` (needs new key from user's new Resend account)
- `organizations` + `organization_memberships` tables for employer identity

The key missing pieces: consent-gating before chat, employer identity in messages, email nudges for chat events, and the full chat UI (desktop split-panel + mobile native-style).

---

## Resend Configuration

The existing `RESEND_API_KEY` secret was set up previously. Since the user has a **new Resend account with a new API key**, Phase 1 includes updating the `RESEND_API_KEY` secret in Supabase with the new value. All chat notification emails will use the existing `_shared/emailService.ts` pattern — calling `resend.emails.send()` with `from: "Lansa <noreply@lansa.app>"`.

The new chat email templates will be added to `_shared/emailTemplates.ts` following the same format as the existing invitation/approval templates. No new email infrastructure is needed — the pattern is proven and reused.

---

## How the System Works (User-Facing)

### Pathway A — Employer Initiates (from Browse Candidates)
1. Employer swipes right or presses "Nudge" on a candidate in the browse feed.
2. Instead of silent match creation, a modal prompts the employer to write a brief intro note (optional, max 200 chars): "Tell [Candidate Name] why you're interested."
3. A `connection_requests` record is created. The candidate receives an **in-app notification** + **email nudge**: "[Company Name] wants to connect with you."
4. The candidate taps/clicks the notification → sees the employer's intro note, company name, logo → chooses **Accept** or **Decline**.
5. **On Accept**: A `chat_thread` opens automatically (via DB trigger). Both parties get a notification + email: "Your chat with [Name] is now open." The chat icon appears with an unread badge.
6. **On Decline**: The request is archived silently. Employer sees "Candidate passed" status in their dashboard.

### Pathway B — Candidate Applied to a Job
1. Candidate applies via the job feed. An application record is created.
2. The employer reviews applications in their Employer Dashboard. When they click "Accept Application":
   - This counts as employer consent.
   - A connection request is created and auto-accepted server-side.
   - A chat thread opens immediately.
   - Candidate gets notified: "Your application to [Role] has been accepted — your chat is now open."

### Pathway C — Candidate Initiates (Reverse Browse)
1. A certified candidate can proactively send a connection request to a company (future — same flow as Pathway A in reverse). The intro note becomes: "Why I'd be a great fit for [Company Name]."

---

## Challenges and Solutions

| Challenge | Solution |
|-----------|----------|
| Chat opens without mutual consent | New `connection_requests` table. `chat_threads` only created by a DB trigger when `status = 'accepted'`. Client code can never INSERT directly into `chat_threads` — enforced by RLS (INSERT blocked for authenticated users, only the trigger's `SECURITY DEFINER` function can create threads). |
| Who sent the message — individual or company? | `chat_messages` gets two new columns: `sender_display_name text` (populated client-side as "John at Acme Corp" for employer, or just "Casey" for candidate) and `sender_org_id uuid`. Chat UI renders org name + logo under employer messages. Org reads are safe: `organizations` table allows any authenticated user to read `name`, `logo_url`, `industry` (non-sensitive public info). |
| RLS blocking sender name reads | A `SECURITY DEFINER` view `chat_participants_view` exposes only `user_id`, `name`, `profile_image`, `title`, `organization_name` — no PII. Thread participants can read this view. |
| Notification deep-link to chat | `notifications.action_url` is set to `/chat/{thread_id}` for all chat notification types. The new `/chat/:threadId` route renders directly to that thread. `NotificationItem` component already uses `action_url` for navigation. |
| Mobile must feel native | Dedicated mobile components (no shared desktop code). Full-screen thread list → full-screen thread view (no split panel). iMessage-style bubbles, sticky header, real-time Supabase Realtime channel, 44px+ tap targets, swipe-back navigation feel using React Router history. |
| Email nudges via Resend | New edge function `send-chat-email` using the **new** `RESEND_API_KEY`. Templates added to `_shared/emailTemplates.ts`. Called from DB trigger via `pg_net.http_post` on `notifications` INSERT for types `chat_request_received`, `chat_request_accepted`, `message_received` (rate-limited: max 1 per thread per 15 min). |
| Employer-side permission for accepting requests | Only org members with role `owner`, `admin`, or `manager` can accept/decline connection requests. Enforced via `check_org_membership` RLS function that already exists. |

---

## Database Changes (Phase 1 — Migration)

### New Table: `connection_requests`
```sql
CREATE TABLE public.connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  requester_org_id uuid,                   -- employer's org if employer-initiated
  intro_note text CHECK (char_length(intro_note) <= 200),
  status text NOT NULL DEFAULT 'pending',  -- pending | accepted | declined
  source text NOT NULL DEFAULT 'browse',   -- browse | job_application
  job_listing_id uuid,
  thread_id uuid,                          -- populated on acceptance
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT no_self_request CHECK (requester_id <> recipient_id),
  CONSTRAINT unique_active_request UNIQUE (requester_id, recipient_id)
);
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
```

RLS policies:
- `SELECT`: requester OR recipient can read their own rows
- `INSERT`: any authenticated user (requester_id must equal `auth.uid()`)
- `UPDATE`: only recipient can update `status` and `responded_at`

### Modified: `chat_messages` — employer identity columns
```sql
ALTER TABLE public.chat_messages
  ADD COLUMN sender_display_name text,
  ADD COLUMN sender_org_id uuid;
```

### Modified: `chat_threads` — consent and org context
```sql
ALTER TABLE public.chat_threads
  ADD COLUMN connection_request_id uuid REFERENCES public.connection_requests(id),
  ADD COLUMN org_id uuid,           -- employer's org in this thread
  ADD COLUMN status text DEFAULT 'active'; -- active | archived
```

### New Notification Enum Values
```sql
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'chat_request_received';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'chat_request_accepted';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'chat_request_declined';
```

### DB Trigger: Auto-create thread when request accepted
```sql
CREATE OR REPLACE FUNCTION public.on_connection_request_accepted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_thread_id uuid;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO public.chat_threads (participant_ids, context, connection_request_id, org_id, created_by)
    VALUES (
      ARRAY[NEW.requester_id, NEW.recipient_id],
      'employee',
      NEW.id,
      NEW.requester_org_id,
      NEW.requester_id
    ) RETURNING id INTO v_thread_id;
    
    UPDATE public.connection_requests SET thread_id = v_thread_id, responded_at = now()
    WHERE id = NEW.id;
    
    -- Notify both parties
    INSERT INTO public.notifications (user_id, type, title, message, action_url)
    VALUES 
      (NEW.requester_id, 'chat_request_accepted', 'Connection accepted!', 'Your chat is now open.', '/chat/' || v_thread_id),
      (NEW.recipient_id, 'chat_request_accepted', 'You accepted a connection', 'Your chat is now open.', '/chat/' || v_thread_id);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_connection_request_accepted
  AFTER UPDATE ON public.connection_requests
  FOR EACH ROW EXECUTE FUNCTION public.on_connection_request_accepted();
```

### RLS: Lock thread creation to trigger only
```sql
-- Remove INSERT permission for authenticated users on chat_threads
-- Only the SECURITY DEFINER trigger creates threads
DROP POLICY IF EXISTS "chat_threads_insert" ON public.chat_threads;
-- SELECT/UPDATE remain for participants via is_thread_participant()
```

### New `chat_participants_view` (safe name resolution)
```sql
CREATE OR REPLACE VIEW public.chat_participants_view 
WITH (security_invoker = false) AS
SELECT 
  up.user_id,
  up.name,
  up.profile_image,
  up.title,
  om.organization_id,
  o.name AS organization_name,
  o.logo_url AS organization_logo
FROM public.user_profiles up
LEFT JOIN public.organization_memberships om ON om.user_id = up.user_id AND om.is_active = true
LEFT JOIN public.organizations o ON o.id = om.organization_id;
```

RLS: Thread participants can query this view for their co-participants only (filtered in app-layer by participant_ids).

---

## New Supabase Edge Function: `send-chat-email`

Uses the **new** `RESEND_API_KEY`. Added to `_shared/emailTemplates.ts`:

```typescript
// New template functions:
generateChatRequestEmail(data)       // "Company X wants to connect with you"
generateChatAcceptedEmail(data)      // "Your chat with X is now open"
generateNewMessageEmail(data)        // "You have a new message from X"
```

Rate limiting: `chat_email_log` table tracks last sent time per `(user_id, thread_id)`. Max 1 email per thread per 15 minutes per recipient.

The edge function is triggered by DB trigger on `notifications` INSERT for relevant types — same pattern as the existing `send-segment-email` function using `pg_net.http_post`.

---

## New Services (Phase 2)

### `connectionRequestService.ts`
```typescript
- sendRequest(recipientId, introNote, orgId?, jobListingId?) → ConnectionRequest
- acceptRequest(requestId) → ChatThread
- declineRequest(requestId) → void
- getPendingRequestsForUser() → ConnectionRequest[]  // candidate side
- getPendingSentRequests() → ConnectionRequest[]      // employer side
```

### `chatService.ts`
```typescript
- getThreadsForUser() → ChatThread[]  (with last_message, unread_count, other_party info)
- getMessages(threadId, limit, before?) → ChatMessage[]
- sendMessage(threadId, body) → ChatMessage
- markThreadRead(threadId) → void
- subscribeToThread(threadId, callback) → RealtimeChannel
- subscribeToThreadList(userId, callback) → RealtimeChannel
```

---

## New Routes (App.tsx additions)

```typescript
<Route path="/chat" element={<Guard auth onboarding><Chat /></Guard>} />
<Route path="/chat/:threadId" element={<Guard auth onboarding><Chat /></Guard>} />
```

Both job_seeker and employer types can access `/chat` — it's shared but renders different identity.

---

## File Structure

```text
src/
  pages/
    Chat.tsx                              (NEW — router: desktop vs mobile)
  
  components/
    chat/
      desktop/
        DesktopChatLayout.tsx             (NEW — split panel: thread list + active thread)
        ChatThreadList.tsx                (NEW — left panel: thread previews with unread dots)
        ChatThreadView.tsx                (NEW — right panel: message list + input)
        MessageBubble.tsx                 (NEW — single message, self/other/employer variants)
      mobile/
        MobileChatInbox.tsx               (NEW — full-screen thread list, native-style rows)
        MobileChatThread.tsx              (NEW — full-screen iMessage-style thread view)
        MobileChatBubble.tsx              (NEW — native bubble, Lansa Blue/Orange)
      shared/
        ChatInput.tsx                     (NEW — shared text input + send button)
        ConnectionRequestModal.tsx        (NEW — intro note input + send request)
        ConnectionRequestCard.tsx         (NEW — accept/decline card in notifications)
    
    notifications/
      ConnectionRequestNotification.tsx   (NEW — new notification card type)
  
  services/
    chatService.ts                        (NEW)
    connectionRequestService.ts           (NEW)
  
  hooks/
    useChat.ts                            (NEW — real-time messages for a thread)
    useChatThreads.ts                     (NEW — thread list with unread counts)
    useUnreadChatCount.ts                 (NEW — total unread badge for nav)

supabase/
  functions/
    send-chat-email/
      index.ts                            (NEW edge function)
  migrations/
    [ts]_chat_consent_system.sql          (NEW — all Phase 1 DB changes)
```

---

## Desktop Chat UX (Strategic Mode)

```text
/chat
┌─────────────────────────────────────────────────────┐
│  Messages                            [Mark all read] │
├──────────────────┬──────────────────────────────────┤
│ Thread List      │  Active Thread                   │
│ ─────────────    │  ────────────────────────────    │
│ ● Casey Doran    │  Casey Doran                     │
│   "Thanks for    │  Acme Corp · 2 days ago          │
│   reaching out"  │  ─────────────────────────────   │
│   2m ago  ●●    │        [Hi Casey, we loved...]   │
│                  │                                  │
│  John Nathan     │  [Hi! Thank you for reaching]    │
│   "Sounds good"  │  ─────────────────────────────   │
│   1h ago         │  [    Write a message...    ][→] │
└──────────────────┴──────────────────────────────────┘
```

- Thread list shows avatar, name, org name (employer side), last message preview, timestamp, unread count dot
- Active thread shows full conversation with employer identity context
- Input: text field + send button + Enter to send

## Mobile Chat UX (Reactive Mode)

```text
Thread List → Full-Screen Thread

┌──────────────────┐    ┌──────────────────┐
│  ← Messages      │    │  ← Casey Doran   │
│                  │    │    Acme Corp      │
│  ● Casey Doran   │    │                  │
│    "Thanks for   │ →  │   Hi Casey, we   │
│    reaching out" │    │   loved your...  │
│    2m ago  ●●   │    │                  │
│                  │    │ Thanks! Happy to │
│  John Nathan     │    │ connect.         │
│    "Sounds good" │    │                  │
│    1h ago        │    │ [Type a message] │
│                  │    │                  │
│ [nav bar]        │    │ [nav bar]        │
└──────────────────┘    └──────────────────┘
```

- Thread list = single-column, 60px rows, avatar + name + preview
- Thread view = full-screen, back arrow to thread list
- Bubbles: employer = left-aligned + Lansa Blue, candidate (self) = right-aligned + Lansa Orange
- Sticky header: name + org
- Real-time updates via Supabase Realtime channel

---

## Navigation Integration

**Mobile Bottom Nav** — adds "Messages" as 5th tab with message bubble icon:
```typescript
{ title: "Messages", url: "/chat", icon: MessageCircle, badge: unreadChatCount }
```
Dynamic `unreadChatCount` from `useUnreadChatCount` hook, shows red dot when > 0.

**Desktop** — adds "Messages" link in the existing `DashboardLayout` sidebar/header (same pattern as existing nav links) with unread count badge.

**Notification deep-link** — `NotificationItem` already uses `action_url` for navigation. New notification types (`chat_request_received`, `chat_request_accepted`) set `action_url = '/chat/{thread_id}'` or `'/notifications'` for pending requests.

**`ConnectionRequestCard`** in Notifications page — when a `chat_request_received` notification appears, it renders inline Accept/Decline buttons rather than a generic notification item.

---

## Implementation Phases (Execution Order)

### Phase 1 — DB Foundation + Resend Key Update
1. Update `RESEND_API_KEY` Supabase secret with new key
2. Run migration: `connection_requests` table, alter `chat_messages`/`chat_threads`, new notification types, `on_connection_request_accepted` trigger, `chat_participants_view`
3. Add chat email templates to `_shared/emailTemplates.ts`
4. Deploy `send-chat-email` edge function

### Phase 2 — Services Layer
5. Create `connectionRequestService.ts`
6. Create `chatService.ts`
7. Create `useChat`, `useChatThreads`, `useUnreadChatCount` hooks

### Phase 3 — Chat UI (Desktop)
8. `DesktopChatLayout`, `ChatThreadList`, `ChatThreadView`, `MessageBubble`, `ChatInput`
9. `Chat.tsx` page with device-aware routing (desktop/mobile)

### Phase 4 — Chat UI (Mobile)
10. `MobileChatInbox`, `MobileChatThread`, `MobileChatBubble`
11. Update `MobileBottomNavigation` with Messages tab + unread badge

### Phase 5 — Connection Request Flow
12. `ConnectionRequestModal` (shown after swipe in Browse Candidates)
13. `ConnectionRequestCard` + `ConnectionRequestNotification` in Notifications page
14. Wire `notificationService` to create `chat_request_received` notifications
15. Update `BrowseCandidates` match celebration to trigger the request modal

### Phase 6 — Navigation + Polish
16. Add `/chat` and `/chat/:threadId` routes to `App.tsx`
17. Add Messages link to desktop navigation
18. Wire `useUnreadChatCount` into `NotificationProvider` for global unread state
19. Test end-to-end: employer swipes → request modal → candidate notification email → accept → chat opens on both sides
