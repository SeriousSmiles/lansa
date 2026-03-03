
## What This Email Is & How It's Triggered

**The "We Miss You" email is the RED segment email**, part of the segment change notification system. Here's the full trigger chain:

1. A DB function (`update_user_color`) runs on a schedule and evaluates each user's engagement score (days since active, profile completion, actions in last 30 days)
2. When a user's color segment **changes TO red** (drifting/inactive) — the `send_segment_email` trigger fires
3. This calls the `send-segment-email` Edge Function
4. That function calls `generateSegmentChangeEmail()` in `emailTemplates.ts` with `newSegment: 'red'`
5. Resend sends the email from `noreply@notification.lansa.online`

**Who receives it:** Any `user_profiles` record where the computed color segment transitions TO `red` or `orange`, or FROM `red` to `green/orange` (recovery celebration). The "We Miss You" specifically fires on transition **TO red**.

---

## The Two Changes Needed

### 1. Replace text "LANSA" logo pill with the actual SVG logo

Currently `logoHtml()` at line 73-77 renders a text pill:
```html
<div style="background:#COLOR;border-radius:6px;padding:5px 14px;">
  <span style="color:#fff;font-size:17px;font-weight:900;">LANSA</span>
</div>
```

The Lansa icon SVG (`src/assets/lansa-icon.svg`) is a path-based SVG. In emails we cannot use `<img src="...SVG from src/assets">` since it's a bundled asset. We need to either:
- Inline the SVG directly in the HTML (works in most email clients, some strip it)
- Or use a base64 data URI for the SVG as an `<img>` tag — **this is the safe email-compatible approach**

We'll replace `logoHtml()` with a version that uses the SVG as an inline base64 `<img>` on a white circle/pill background so it's visible on all header colors.

### 2. Tone down the header color — content area stays light

User wants:
- The full-bleed header background to use a **toned-down / muted version** of the segment color (not the saturated red `#dc2626`)
- The **content/body area** should use a **light tint** of the segment color (e.g., very pale red `#fff5f5`) — not pure white — for the red segment
- CTA button keeps the accent color for clear action affordance

**Color mapping per segment:**

| Segment | Current header bg | New header bg (toned) | Content bg (light tint) |
|---|---|---|---|
| red | `#dc2626` | `#b91c1c` (deeper, less saturated) | `#fff5f5` (pale rose) |
| orange | `#d97706` | `#b45309` | `#fffbeb` |
| green | `#059669` | `#047857` | `#f0fdf4` |
| purple | `#7e22ce` | `#6d28d9` | `#faf5ff` |

The `wrapper()` function's body `<td>` is hardcoded to `background-color:#ffffff`. We update this to accept an optional `contentBg` param and pass the light tint per segment.

---

## Files to Change

| File | Change |
|---|---|
| `supabase/functions/_shared/emailTemplates.ts` | (1) Replace `logoHtml()` to use base64 SVG img; (2) Update `wrapper()` to accept `contentBg`; (3) Update all `segmentConfig` header colors to toned values + add `contentBg`; (4) Pass `contentBg` into `generateSegmentChangeEmail` call to `wrapper()` |

**Only one file changes.** No edge function redeployment needed since `_shared` is imported at runtime by the deployed function — BUT we should redeploy `send-segment-email` to pick up the shared file changes.

The SVG from `src/assets/lansa-icon.svg` will be base64-encoded inline:
```
data:image/svg+xml;base64,PHN2ZyB3aWR0...
```
This avoids any external URL dependency and works in Gmail, Outlook, Apple Mail.

The logo will render on a white circular pill so the dark navy SVG (`#1A1F71`) is clearly visible against any header color.
