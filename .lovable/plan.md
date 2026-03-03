
## Problem

On mobile, `MobileChatThread` uses `h-screen` on the outer container, but the bottom nav bar overlaps the input box, and on iOS the virtual keyboard pushes content. The issue is the layout doesn't account for the mobile bottom nav (which sits at z-100) and the browser chrome/keyboard.

The fix is to use `100dvh` (dynamic viewport height) instead of `h-screen`, add proper `env(safe-area-inset-*)` padding, and ensure the structure is a true fixed-header + fixed-footer + scrollable-middle layout — exactly like WhatsApp.

## Root Cause

`MobileChatThread` line 36: `h-screen` doesn't account for:
1. The mobile bottom navigation bar overlapping the input
2. iOS Safari browser chrome at top/bottom
3. Virtual keyboard resizing the viewport

## Fix

**`src/components/chat/mobile/MobileChatThread.tsx`** — one targeted change:

```
// Outer container: use dvh + flex + overflow-hidden
<div className="flex flex-col bg-[#F4F1ED]" style={{ height: '100dvh' }}>

// Header: no longer needs sticky — it stays fixed at top naturally in flex column
<div className="flex items-center gap-2 px-3 pb-3 border-b ... flex-shrink-0"
  style={{ paddingTop: 'env(safe-area-inset-top, 12px)' }}>

// Messages: flex-1 + overflow-y-auto (replace ScrollArea which adds a wrapper)
<div className="flex-1 overflow-y-auto">
  <div className="px-4 py-5 space-y-1">
    ...
  </div>
</div>

// Input: flex-shrink-0, no sticky needed
<div className="px-4 py-3 border-t ... flex-shrink-0"
  style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}>
```

This gives:
- Header: fixed height at top (flex-shrink-0)
- Messages: fills remaining space (flex-1 overflow-y-auto) — scrollable
- Input: fixed height at bottom (flex-shrink-0)

`100dvh` dynamically adjusts when the keyboard opens on iOS/Android, keeping the input always visible at the bottom — exactly the WhatsApp pattern.

No changes needed to desktop `ChatThreadView` or `MobileChatInbox` — the issue is isolated to the mobile thread view.
