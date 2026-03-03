
## Root Cause

In `Dashboard.tsx` line 206, the content wrapper has:
```tsx
<div className="p-4 md:p-6 h-[calc(100vh-72px)] overflow-y-auto">
```

This creates a **nested scroll container** inside the page. The result: the outer `<body>` and this inner `div` both scroll independently → janky double-scroll on mobile.

The `TopNavbar` is `sticky top-0 z-40` in `DashboardLayout` — good structure, but the inner scroll container bypasses the body scroll entirely so hide-on-scroll can't work against it.

## Fix

### 1. `Dashboard.tsx` — Remove the inner scroll container
Strip `h-[calc(100vh-72px)] overflow-y-auto` so the content flows naturally into the page body scroll:
```tsx
// Before
<div className="p-4 md:p-6 h-[calc(100vh-72px)] overflow-y-auto">

// After  
<div className="p-4 md:p-6">
```
This lets the body be the single scroll context — the header stays sticky, bottom nav stays fixed, content scrolls behind both.

### 2. `TopNavbar.tsx` — Hide on scroll down, show on scroll up (mobile only)
Add a `useScrollDirection` hook detection inline (or use a ref + scroll listener). On mobile (`md:hidden` equivalent), apply a `translate-y-0` → `-translate-y-full` transition based on scroll direction.

### 3. `MobileBottomNavigation.tsx` — Hide on scroll down, show on scroll up
Same scroll direction logic → apply `translate-y-0` → `translate-y-full` transition on the fixed bottom nav.

### Scroll hide/show logic (shared)
```ts
// Simple pattern — no new file needed, inline in each component
const [hidden, setHidden] = useState(false);
const lastScrollY = useRef(0);

useEffect(() => {
  const handleScroll = () => {
    const currentY = window.scrollY;
    setHidden(currentY > lastScrollY.current && currentY > 80);
    lastScrollY.current = currentY;
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

Apply with Tailwind transition:
```tsx
// TopNavbar wrapper in DashboardLayout:
className={`sticky top-0 z-40 transition-transform duration-300 ${navHidden ? '-translate-y-full' : 'translate-y-0'}`}

// MobileBottomNavigation:
className={`fixed bottom-0 ... transition-transform duration-300 ${navHidden ? 'translate-y-full' : 'translate-y-0'}`}
```

## Files to Change

| File | Change |
|---|---|
| `src/pages/Dashboard.tsx` | Remove `h-[calc(100vh-72px)] overflow-y-auto` from inner wrapper |
| `src/components/dashboard/DashboardLayout.tsx` | Add scroll-direction listener, apply hide/show to sticky top nav wrapper |
| `src/components/mobile/MobileBottomNavigation.tsx` | Add scroll-direction listener, apply hide/show translate to fixed bottom nav |
