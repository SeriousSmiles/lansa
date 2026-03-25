
## Feature: Rich QR Share Card — Profile image + name + QR + Lansa badge

### What the user wants
When users tap "Share Profile QR", instead of sharing just a bare QR code PNG:
1. **The generated image** contains: profile photo (circular), full name, the QR code, and a small "Powered by Lansa" badge at the bottom
2. **The Share button** (mobile) uses the Web Share API with `navigator.share({ files: [compositeImage] })` so the image lands directly in WhatsApp, Instagram DMs, Facebook Messenger, etc.
3. **Desktop** gets the same composite card, but since `navigator.share` with files isn't supported on desktop, the Share button falls back to downloading the image + copying the link.

---

### Key technical decisions

**Composite image generation (Canvas API)**
The `QRCodeModal` already uses the `qrcode` library and has `useAuth`. We add canvas compositing right in the modal:
1. Draw white card background (rounded corners via `clip`)
2. Draw circular profile photo (load from URL via `new Image()` + CORS)
3. Draw the QR code image (already generated)
4. Draw user's full name text (centered)
5. Draw "Powered by" text + Lansa icon in small badge at bottom

The Lansa icon SVG exists at `src/assets/lansa-icon.svg` and there's also `src/assets/powered-by-lansa-badge.png` — we use the PNG badge directly.

**Data needed: `profileImage`**
Currently `QRCodeModal` only receives `userName`. Both calling sites need to pass `profileImage` too:
- `AppShell.tsx` → `QuickActionsSheet` — get profileImage from `useUserState` or `useAuth`
- `DesktopProfileActions.tsx` → `DesktopQuickActionsModal` — already has `userProfile` in context, pass it down

**CORS issue with profile images**
Profile images are stored on Supabase Storage which should allow CORS. We'll use `img.crossOrigin = 'anonymous'` when loading. If CORS fails, we gracefully show initials placeholder circle instead of the photo.

**Web Share API with files**
`navigator.share({ files: [File] })` works on iOS Safari 15+ and Android Chrome. We check `navigator.canShare?.({ files: [...] })` first. On desktop/unsupported: download the composite image.

---

### Files to change

| File | Change |
|---|---|
| `src/components/modals/QRCodeModal.tsx` | Major rewrite: accept `profileImage` prop, composite canvas generation, file-based `navigator.share` |
| `src/components/mobile/app/QuickActionsSheet.tsx` | Pass `profileImage` from `useUserState` to `QRCodeModal` |
| `src/components/mobile/app/AppShell.tsx` | Pass `profileImage` to `QuickActionsSheet` |
| `src/components/profile/dialogs/DesktopQuickActionsModal.tsx` | Accept + pass `profileImage` prop to `QRCodeModal` |
| `src/components/profile/header-actions/DesktopProfileActions.tsx` | Pass `profileImage` to `DesktopQuickActionsModal` |

---

### Composite card layout (canvas, ~600×700px)

```text
┌──────────────────────────────────────┐
│                                      │  ← white card, rounded, shadow
│         [Profile Photo 120px]        │  ← circle, centered, top
│                                      │
│           Full Name (20px bold)      │  ← centered text
│                                      │
│      ┌──────────────────────┐        │
│      │   QR Code (220×220)  │        │  ← centered
│      └──────────────────────┘        │
│                                      │
│       [Lansa badge – small]          │  ← "Powered by" + icon, bottom center
└──────────────────────────────────────┘
```

---

### Share behaviour by platform

| Platform | Share button behaviour |
|---|---|
| iOS Safari (mobile) | `navigator.share({ files })` → native share sheet → WhatsApp / Instagram / Messenger etc. |
| Android Chrome (mobile) | Same as above |
| Desktop (any browser) | Downloads composite card image; copies link to clipboard |
| Desktop fallback if no download | Copies link only |

The "Download QR Code" button always downloads the composite card (not just the bare QR PNG).

---

### `profileImage` prop drilling path

```text
useUserState (has profileImage via user_profiles table)
  └── AppShell → QuickActionsSheet (mobile) → QRCodeModal
  └── DesktopProfileActions (via userProfile prop) → DesktopQuickActionsModal → QRCodeModal
```

`useUserState` already exposes user context. We read `profileImage` using `useProfileData` inside `QRCodeModal` itself via `useAuth` user.id + direct Supabase query — this avoids the need to thread props through 3 layers and keeps the modal self-contained. We'll do a lightweight single-row fetch for `profile_image` and `name` from `user_profiles` when the modal opens.

This is cleaner: the modal owns its own data fetch (just like it already owns the `profileUrl` computation).
