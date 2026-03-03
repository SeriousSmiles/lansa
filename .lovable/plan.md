
## What Needs to Change

The screenshot shows the problem clearly: received message bubbles use a dark slate-gray (`bg-muted` which resolves to a dark tone in the current theme). The user wants a clean, light surface-based look — white/near-white tiles with a soft shadow, not colored bubbles for received messages.

### Changes to make

**1. `MessageBubble.tsx` (desktop received bubbles)**
- Change `bg-muted/80 text-foreground` → `bg-white text-foreground shadow-sm border border-border/20` (clean white card tile)
- Self (sent) bubbles keep `#F2713B` orange — that's on-brand and correct

**2. `MobileChatBubble.tsx` (mobile received bubbles)**
- Same: remove `bg-muted` and `bg-[#2B7FE8]` dark blue for received messages
- Use `bg-white text-foreground shadow-sm border border-border/20` for all received bubbles
- Self bubbles keep orange

**3. `ChatThreadView.tsx` (desktop message area background)**
- The `bg-background/60` on the right panel feels slightly off-white — change to clean `bg-[#F8F9FA]` (very light warm gray, tile-friendly surface)
- Thread header and input footer: `bg-white` instead of `bg-card/50`

**4. `DesktopChatLayout.tsx` (outer wrapper)**
- `bg-muted/30` → `bg-[#F0EDE8]` (the app's warm cream base, consistent with the rest of the app which uses `rgba(253,248,242,1)`)
- The chat card border shadow should feel like a clean tile: `shadow-lg` → `shadow-sm border border-border/30`

**5. `ChatInput.tsx` (input bar)**
- `bg-muted/40` → `bg-white border-border/30` for a cleaner tile look

**6. `MobileChatInbox.tsx`**
- `bg-background` outer wrapper → `bg-[rgba(253,248,242,1)]` (app warm cream)
- Header `bg-card/90` → `bg-white`

**Summary of color replacements (project-wide)**

| Element | Before | After |
|---|---|---|
| Received bubble | `bg-muted/80` dark gray | `bg-white shadow-sm border/20` |
| Received employer bubble (mobile) | `bg-[#2B7FE8]` blue | `bg-white shadow-sm border/20` |
| Message area background | `bg-background/60` | `bg-[#F8F9FA]` |
| Desktop outer shell | `bg-muted/30` | `bg-[rgba(253,248,242,1)]` |
| Chat input | `bg-muted/40` | `bg-white` |
| Mobile inbox background | `bg-background` | `bg-[rgba(253,248,242,1)]` |
| Mobile header | `bg-card/90` | `bg-white` |

The sent (self) orange bubble stays — it's on-brand. Only the **received** bubbles and background surfaces change to clean white tiles.

### Files to edit
- `src/components/chat/desktop/MessageBubble.tsx`
- `src/components/chat/mobile/MobileChatBubble.tsx`
- `src/components/chat/desktop/ChatThreadView.tsx`
- `src/components/chat/desktop/DesktopChatLayout.tsx`
- `src/components/chat/shared/ChatInput.tsx`
- `src/components/chat/mobile/MobileChatInbox.tsx`
