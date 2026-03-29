

# Fix Dashboard Horizontal Overflow on Desktop

## Root Cause

The dashboard layout uses CSS Grid with `grid-cols-[320px_1fr]`, but the right column (`section`) and its nested grid children lack `min-w-0`. In CSS Grid, a `1fr` track won't shrink below its content's minimum intrinsic width unless children explicitly set `min-w-0`. On desktop, the combined width of the analytics stats grid, certification card, and "Who's Interested" section exceeds the available space, pushing content past the viewport edge.

The `DashboardLayout` wrapper also lacks `overflow-x` clipping as a safety net.

## Changes

### 1. `src/pages/Dashboard.tsx`
- Add `min-w-0` to the outer grid container and the right-column `<section>` element
- Add `overflow-x-clip` to the top-level content wrapper

```
Before: <div className="w-full pt-4 md:pt-6">
After:  <div className="w-full pt-4 md:pt-6 overflow-x-clip">

Before: <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
After:  <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 min-w-0">

Before: <section>
After:  <section className="min-w-0">
```

### 2. `src/components/dashboard/overview/OverviewTab.tsx`
- Add `min-w-0` to the inner 3-column grid and its `lg:col-span-2` child to prevent the analytics card's 4-stat row from forcing width

```
Before: <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
After:  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-w-0">

Before: <div className="lg:col-span-2 h-full">
After:  <div className="lg:col-span-2 h-full min-w-0">
```

### 3. `src/components/dashboard/DashboardLayout.tsx`
- Add `overflow-x-clip` to the outermost layout div as a final safety net

```
Before: <div className="flex min-h-screen w-full bg-[rgba(253,248,242,1)] flex-col">
After:  <div className="flex min-h-screen w-full bg-[rgba(253,248,242,1)] flex-col overflow-x-clip">
```

## Files

| File | Action |
|---|---|
| `src/pages/Dashboard.tsx` | Add `overflow-x-clip` + `min-w-0` to grid and section |
| `src/components/dashboard/overview/OverviewTab.tsx` | Add `min-w-0` to inner grid + col-span-2 child |
| `src/components/dashboard/DashboardLayout.tsx` | Add `overflow-x-clip` to root wrapper |

