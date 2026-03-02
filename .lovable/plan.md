
# Candidate Browser — LinkedIn-Inspired Professional Redesign

## What's Being Fixed & Why

Looking at the screenshot and the code, the current page has these specific problems:

1. **Stats bar takes up valuable vertical space** — 3 stat cards sit above the browser eating ~140px that could be profile content
2. **Left panel is too sparse** — large empty gradient area with no information density; a lot of wasted space below the avatar before skills appear
3. **Right panel tiles look flat** — `bg-muted/30` headers on cards are barely distinguishable from the card body; no visual weight hierarchy
4. **The two panels feel disconnected** — no unified card wrapper around the whole browser, just two floating panels
5. **Sections are too tall with too much padding** — each card has generous padding making the page feel "empty" even when data exists
6. **Skills appear below a divider in a section with no structure** — LinkedIn puts skills as small compact chips directly under the name/title for immediate scanning

## New Layout: LinkedIn-Inspired Professional Design

### Overall Structure

```text
┌─────────────────────────────────────────────────────────────────┐
│  ← Browse Candidates    [Matches: 3] [Swipes today: 12]  [?]   │  ← slim top bar
├─────────────────────────────────────────────────────────────────┤
│  Candidate 6 of 20  ●●●●●○○○○○○○○○○○○○○ (progress bar)        │
├──────────────────────────┬──────────────────────────────────────┤
│                          │  ┌──────────────────────────────────┐│
│  [Cover color banner]    │  │ 📖 About                         ││
│  [Avatar]  Name          │  │ Bio text here...                 ││
│  Title · Location        │  └──────────────────────────────────┘│
│  ─────────────────────── │  ┌──────────────────────────────────┐│
│  🎯 Skills               │  │ 💼 Experience                    ││
│  [TypeScript] [React]... │  │ Senior Dev · Acme Corp           ││
│                          │  │ 2021 – Present                   ││
│  ─────────────────────── │  │ ─────────────────────────────────││
│  ✨ Why This Match        │  │ Junior Dev · Beta Co             ││
│  AI summary paragraph    │  │ 2019 – 2021                      ││
│                          │  └──────────────────────────────────┘│
│  ─────────────────────── │  ┌──────────────────────────────────┐│
│  🏆 Certified badge tile │  │ 🎓 Education                     ││
│                          │  └──────────────────────────────────┘│
│                          │  ┌─────────────┐ ┌──────────────────┐│
│                          │  │ 🌐 Languages│ │ 🏅 Achievements  ││
│                          │  └─────────────┘ └──────────────────┘│
│                          │  ┌──────────────────────────────────┐│
│                          │  │ 🎯 Professional Goals            ││
│                          │  └──────────────────────────────────┘│
├──────────────────────────┴──────────────────────────────────────┤
│           [✗ Pass]      [⚡ Super Interest]    [♥ Interested]   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Changes (LinkedIn-Inspired)

**Left Panel — Identity Card**
- Replace the plain gradient area with a proper cover banner (uses `cover_color` the candidate already has set on their profile) at ~90px tall, with the avatar sitting half-overlapping the banner — exactly like LinkedIn
- Name in `text-xl font-bold`, title in `text-sm text-muted-foreground` (no colored text — LinkedIn style), location with pin icon inline
- Skills immediately below in a tight pill cluster — no section heading needed, just the chips
- AI match summary in a clearly labelled tile with a subtle AI sparkle icon and `bg-primary/5` tint to distinguish it from structural cards
- Bottom: certification status tile — if certified, shows a green "Lansa Certified" tile with checkmark; if not, shows nothing

**Right Panel — Detail Feed**
- Cards have a proper `border border-border` with `shadow-sm` and `rounded-xl`
- Section header rows use `bg-slate-50 dark:bg-muted/40` with the icon + title — slightly more pronounced than the body
- Experience items use a left timeline line (thin vertical bar from top to bottom of items) with filled dot per role — like LinkedIn's timeline
- Education, Languages, Achievements, Professional Goals all follow the same tile grammar
- All sections always render (with graceful empty states using placeholder text) — never leaves holes

**Header & Stats**
- The 3 stat cards are removed from being a full row and compressed into a slim inline strip on the same line as the back button: `← Browse Candidates · 3 matches · 12 swipes today · 20 candidates`
- This recovers ~140px of vertical space for profile content
- Progress bar (thin, `h-1`) replaces the dot navigation — cleaner and more professional
- Candidate counter `6 of 20` remains but is smaller and integrated into the progress row

**Animation**
- Remove GSAP entirely from the panel components — it's been causing the blank-page bug across multiple fix attempts
- Replace with React's built-in `key` prop pattern: when `currentProfile.user_id` changes, React unmounts/remounts the panel with a CSS `animate-in fade-in slide-in-from-bottom-2 duration-300` class — this is deterministic, cannot conflict with itself, and never leaves opacity at 0
- The `candidatePanelAnimations.ts` utility is no longer called from these components (can be kept for future use elsewhere)

## Files to Modify

| File | Change |
|------|--------|
| `src/components/discovery/desktop/LeftPanel.tsx` | Full redesign — cover banner, LinkedIn-style identity block, compact skills, AI tile |
| `src/components/discovery/desktop/RightPanel.tsx` | Full redesign — proper card grammar, timeline experience, always-render sections |
| `src/components/discovery/desktop/SplitPanelBrowser.tsx` | Replace GSAP refs with key-based animation, compress stats into header strip, slim progress bar |
| `src/components/discovery/desktop/ActionButtonBar.tsx` | Minor polish — consistent height, button weights |
| `src/components/dashboard/employer/CandidateBrowseTab.tsx` | Pass stats inline to SplitPanelBrowser as props instead of rendering stat cards |

## What Is NOT Changed

- `discoveryService.ts` — no data layer changes; mock fallback preserved
- Mobile `SwipeDeck` — completely untouched
- `useCandidateNavigation.ts` hook — logic unchanged
- The browse feature, swipe recording, notifications, match detection — all unchanged
- Routing and auth guards — unchanged

## Risk Assessment

| Change | Risk |
|--------|------|
| Removing GSAP from panels | Low — CSS transitions are deterministic and solve the blank-page bug permanently |
| Stats moved to header strip | None — data still fetched, just rendered differently |
| Cover banner using `cover_color` | None — graceful fallback to `bg-muted` if null |
| Key-based animation | None — standard React pattern |
