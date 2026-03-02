
## Fix: Swipe + overflow-y-auto Coexistence

### Root Cause (Precise)

The `SwipeableContainer` sets `touchAction: 'pan-y'` on its outer div. This tells the browser "vertical scroll is allowed, horizontal is mine." However, the inner `overflow-y-auto` div inside `EnhancedCandidateCard` creates a **nested scroll container**. On mobile browsers, when a touch starts inside a nested scrollable element, the browser routes the pointer stream to that inner scroll context first — the outer `SwipeableContainer` only receives the event after the inner scroller decides it doesn't want it (which it does, because it's `overflow-y-auto`).

The result: horizontal drags started on the content body are consumed by the inner scroll context before `SwipeableContainer.onPointerMove` can classify them as horizontal and take over.

### The Right Solution: Pointer Event Capture

The fix is to use **`setPointerCapture`** aggressively in `SwipeableContainer.onPointerDown`. This is already called on `e.target` — but `e.target` is the inner scrollable div, so the capture is on the wrong element.

The fix: call `containerRef.current.setPointerCapture(e.pointerId)` (on the **SwipeableContainer's own element**) instead of `(e.target as HTMLElement).setPointerCapture(e.pointerId)`. Once pointer capture is set on the outer container, ALL subsequent `pointermove` and `pointerup` events route to it directly — the inner scroll context is bypassed for the duration of the gesture.

This is the standard Web platform mechanism for exactly this use case (drag handles inside scrollable containers).

**Before:**
```ts
(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
```

**After:**
```ts
containerRef.current?.setPointerCapture(e.pointerId);
```

With this change, the `SwipeableContainer` captures the pointer stream immediately on `pointerdown`, regardless of which child element was touched. The `onPointerMove` fires on the outer container, can detect horizontal vs vertical intent, and if vertical (scroll), it can **release** the capture to hand it back to the browser:

```ts
if (!isHorizontalSwipe.current) {
  isDragging.current = false;
  containerRef.current?.releasePointerCapture(e.pointerId); // Give scroll back to browser
  return;
}
```

This way:
- Horizontal drag → SwipeableContainer keeps capture → card swipes
- Vertical drag → SwipeableContainer releases capture → inner `overflow-y-auto` scrolls normally

The card content stays `overflow-y-auto`, the AI match insight is fully visible, and swipe works from anywhere on the card.

### Changes Required

**File: `src/components/mobile/SwipeableContainer.tsx`**

Two changes:
1. In `onPointerDown`: replace `(e.target as HTMLElement).setPointerCapture?.(e.pointerId)` with `containerRef.current?.setPointerCapture(e.pointerId)`
2. In `onPointerMove`: after detecting vertical intent (`isHorizontalSwipe.current === false`), add `containerRef.current?.releasePointerCapture(e.pointerId)` before returning — this hands vertical scroll back to the native browser/inner scroll context

**File: `src/components/mobile/employer/EnhancedCandidateCard.tsx`**

Revert line 117: change `overflow-hidden` back to `overflow-y-auto` on the inner content div. The AI match insight will be fully visible again and scrollable when content overflows.

### Why This Is Better Than The Previous Approach

The previous fix (`overflow-hidden`) solved the symptom by killing the competing scroll context entirely — but at the cost of content visibility. The pointer capture approach solves the actual problem at the Web platform level: who owns the pointer stream. It's the standard pattern used by drag-and-drop libraries (react-dnd, dnd-kit) to handle drag handles inside scrollable containers.

### Files to Change

| File | Change |
|---|---|
| `src/components/mobile/SwipeableContainer.tsx` | Capture pointer on container, release on vertical intent |
| `src/components/mobile/employer/EnhancedCandidateCard.tsx` | Revert `overflow-hidden` → `overflow-y-auto` on line 117 |
