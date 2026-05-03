# Make Chat Ambient — Quick Messaging Across the Portal

Currently `/chat` is a destination page. Users have to leave whatever they were doing, load the full inbox, pick a thread, reply, then navigate back. This violates the doctrine for **Desktop = Strategic Mode**: messaging should be a *companion surface*, not a context switch.

This plan keeps `/chat` intact for deep conversation work, but layers three lighter-weight surfaces on top so seekers (and employers) can keep momentum.

---

## Three new surfaces

### 1. Inbox view inside the Portal Context Panel (right drawer)

Extend `useDashboardPanel` with a new `"inbox"` view alongside `profile | ai | insights | activity`. Opens the existing right Sheet, shows the thread list, and lets the user pick a thread to read/reply **without leaving the page**.

- New component `PortalInboxPanel.tsx` rendered inside `PortalContextPanel` when `view === "inbox"`.
- Two internal states: list view (recent threads) and thread view (messages + composer).
- Reuses `useChatThreads`, `chatService`, and the existing `ChatInput` + `MessageBubble` so behavior, RLS, and realtime stay identical.
- "Open full inbox" footer link → navigates to `/chat`.

### 2. Messages tile/widget on the Portal dashboard

Add a compact **Messages** card inside the right column of `PortalShell` (under Today's Focus, above Recent activity, or as a small tile in `PortalDistricts`). Shows:

- Top 3 most recent threads with avatar, name, last-message preview, unread dot, relative time.
- Unread total badge in the header.
- Click a row → opens the inbox panel directly on that thread.
- "View all" → opens inbox panel in list mode.

Empty state: "No conversations yet — connect with employers to start."

### 3. Global quick-reply trigger in `PortalRail`

The rail already has a Messages icon with an unread badge. Change its behavior:

- **Click** = open the inbox panel (drawer) in list mode — no navigation.
- **Cmd/Ctrl+K → "Messages"** stays as a route to `/chat` for the full screen.
- A small "Open full page" affordance inside the panel for users who prefer the dedicated layout.

Result: messaging is one click away from any portal page (dashboard, profile, jobs, resources) without losing scroll position or filters.

---

## Mobile

Per the doctrine, mobile is **Reactive / Momentum Mode** — `/chat` already works well there as a full-bleed inbox. We will **not** add a drawer on mobile. Instead:

- Keep the existing `MobileChatInbox` route.
- Add a small "Recent messages" strip on the mobile dashboard (top 2 threads + unread count) that taps straight into a thread. This shortens the path from "open app → reply" to two taps.

---

## Legacy mode

The Legacy toggle continues to bypass all of the above. When `portalV2 === false`, `/chat` renders the original `DesktopChatLayout` exactly as today, and no widgets are injected. Nothing about RLS, services, or realtime changes.

---

## Files & technical notes

- `src/components/dashboard/portal/useDashboardPanel.ts` — add `"inbox"` to `PanelView`; optional `threadId` field for deep-linking into a specific conversation.
- `src/components/dashboard/portal/inbox/PortalInboxPanel.tsx` — new. List + thread view, uses `useChatThreads`, `chatService.markThreadRead`, `ChatInput`, `MessageBubble`. ~250 lines.
- `src/components/dashboard/portal/PortalContextPanel.tsx` — register the inbox view, widen sheet to `sm:max-w-[520px]` only when `view === "inbox"` for breathing room on the message list.
- `src/components/dashboard/portal/messages/PortalMessagesCard.tsx` — new. Compact 3-thread preview card; reused on dashboard. ~120 lines.
- `src/components/dashboard/portal/PortalShell.tsx` — insert `PortalMessagesCard` into the right column (between `TodaysFocus` and the Recent activity section).
- `src/components/dashboard/portal/PortalRail.tsx` — change Messages click handler to call `openPanel("inbox")` instead of `navigate('/chat')`. Keep right-click / middle-click / focused keyboard nav routing to `/chat` for power users.
- `src/components/mobile/dashboard/MobileMessagesStrip.tsx` — new. Top 2 threads + unread count; taps into `/chat/:threadId`.
- `src/pages/Chat.tsx` — unchanged.
- No DB / RLS / edge-function changes. No new hooks for chat — reusing `useChatThreads`, `useUnreadChatCount`, and `chatService`.

### UX guarantees

- Visibility of system status: unread dot + "delivered" tick stay identical across surfaces.
- User control: every panel surface has "Open full page" → `/chat`, plus close.
- Recognition over recall: avatars and names match the existing chat layout.
- No competing CTAs: the inbox panel surfaces only Reply + Open full thread.
- Realtime: panel and dashboard widget subscribe via the same hooks, so a new message updates everywhere simultaneously.

### Out of scope (intentionally)

- Notifications/push behavior — already handled.
- Group threads — none today.
- Reactions / typing indicators — separate effort.
- Employer dashboard messages widget — same pattern can be applied later; this plan focuses on seeker portal first per your instruction.

---

## Rollout order

1. Extend `useDashboardPanel` and add `PortalInboxPanel`.
2. Wire the rail Messages icon to open the panel.
3. Add `PortalMessagesCard` to `PortalShell`.
4. Add `MobileMessagesStrip` to mobile dashboard.
5. Manual QA: legacy mode off and on, unread sync, sending a message from the panel, deep-link from card to thread.

After approval I'll implement in this order and report back with file diffs.
