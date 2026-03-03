
## Root Problems Identified

From the screenshot and code audit, there are 4 distinct issues:

### 1. Send Button — Invisible Icon When Idle
The empty-state button uses `bg-muted text-muted-foreground`. In this theme, `--muted` is a mid-gray and `--muted-foreground` is darker gray — the icon is nearly invisible. Fix: use `bg-[#E8E4DF] text-[#9E9087]` (warm light gray, visible icon) for idle state. Active stays orange.

### 2. Input Bar — Spacing & Visual Weight
The `ChatInput` wrapper `px-3 py-2` is too tight vertically. The textarea has `p-0` creating alignment issues. The whole footer container `px-6 py-4` needs to match. Fix: `px-4 py-3` on wrapper, `py-2` min-height on textarea, proper `gap-3`.

### 3. Message Bubble Spacing — Too Cramped
`space-y-0.5` and `mt-1` between same-sender bubbles is only 2-4px — bubbles visually merge. Fix: `space-y-1` for same sender, `mt-3` for group changes (was `mt-4`). Bubbles also need slightly more padding: `px-4 py-3` (was `py-2.5`).

### 4. Mobile Thread Background — Inconsistent Surface
`MobileChatThread` uses `bg-background` on the outer div and scroll area. The header/footer are `bg-card/90` but the message area is pure white — doesn't match the warm `#FDF8F2` brand surface. Fix: outer div `bg-[#F4F1ED]` (warm message area tint), keep bubbles white as tiles.

### 5. Mobile Header — Backdrop Blur Over Wrong Surface
`bg-card/90 backdrop-blur-md` on the header looks muddy because `--card` is white but with partial opacity. Fix: `bg-white border-b border-border/40` — solid, clean, no blur.

---

## Changes Per File

### `ChatInput.tsx`
- Idle button: `bg-[#EDE9E4] text-[#9E9087]` (warm gray, icon clearly visible)
- Active button: `bg-[#F2713B] text-white` — no change
- Wrapper: `px-4 py-3 gap-3` (more breathing room)
- Textarea: `min-h-[36px]` for better vertical centering
- Button: `h-9 w-9` → `h-10 w-10` (more prominent, easier tap)

### `MobileChatThread.tsx`
- Outer div: `bg-[#F4F1ED]` (warm surface, not stark white)
- Header: `bg-white` solid, remove `backdrop-blur-md`, keep `border-b`
- Input footer: `bg-white` solid, remove `backdrop-blur-md`
- Message area scroll: `px-4 py-5 space-y-1` (was `py-4 space-y-0.5`)

### `MobileChatBubble.tsx`
- Same-sender margin: `mt-1` (was fine)
- Group change margin: `mt-3` (was `mt-4`, slightly tighter)
- Bubble padding: `px-4 py-3` (was `py-2.5`)

### `MessageBubble.tsx` (desktop)
- Bubble padding: `px-4 py-3` (was `py-2.5`)
- Group change margin: `mt-3` (was `mt-4`)

### `ChatThreadView.tsx`
- Message area: `px-6 py-6 space-y-1` (was `py-5 space-y-1` — slight increase)

No structural changes — only targeted padding, color, and spacing fixes.
