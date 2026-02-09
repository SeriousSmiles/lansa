

## Phase 1: Content Library + Admin Video Management

### Overview
Clean up the `/resources` and `/content` pages, build a video content system managed by admins, and create a polished user-facing video browsing experience with a 2-column layout.

### What Gets Built

**1. Database: `content_videos` table**

A new table to store all video content managed by admins:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Auto-generated |
| title | text | Required |
| description | text | Video description |
| source_type | enum ('youtube', 'native') | Distinguishes video origin |
| youtube_url | text | For YouTube videos |
| storage_path | text | For native uploads (Supabase Storage) |
| thumbnail_url | text | Optional custom thumbnail |
| duration_seconds | integer | Video length |
| education_type | text | e.g., "Career Development", "Interview Skills" |
| transformation_promise | text | What user gets from watching |
| category | text | Grouping category |
| is_published | boolean | Admin control for visibility |
| created_by | uuid | Admin who added it |
| created_at / updated_at | timestamps | Auto-managed |

RLS: Published videos readable by all authenticated users. Full CRUD for admins only.

A Supabase Storage bucket `content-videos` for native video uploads.

**2. Admin Area: Video Content Management** (`/admin/content`)

New admin page added to the existing admin layout with:
- List of all videos (published and drafts)
- "Add Video" form with two modes:
  - **YouTube**: Paste a YouTube URL, auto-extract video ID for embedding
  - **Native Upload**: Upload video file to Supabase Storage bucket
- Edit/delete existing videos
- Toggle publish status
- Fields: title, description, duration, education type, transformation promise, category

**3. User-Facing `/content` Page (Redesigned)**

Replace the current placeholder with a 2-column layout:

```text
+---------------------------+-----------------------------+
|  Video Cards (scrollable) |  Selected Video Detail      |
|                           |                             |
|  [YouTube] Title 1        |  [Video Player/Preview]     |
|  [Native]  Title 2        |                             |
|  [YouTube] Title 3        |  Title                      |
|                           |  Description                |
|                           |  Duration: 18 min           |
|                           |  Great for: Interview Prep  |
|                           |  Transformation Promise:    |
|                           |  "You'll learn to..."      |
+---------------------------+-----------------------------+
```

- **Desktop**: Left panel (1/3 width) with scrollable video cards, right panel (2/3 width) with selected video details
- **Mobile**: Single column -- video list with expandable detail view
- Each video card shows a badge: "YouTube" or "Uploaded" to indicate source
- Clicking a card loads its details in the right panel
- YouTube videos embed using iframe; native videos use HTML5 video player

**4. `/resources` Page Cleanup**

Replace the placeholder cards with an empty state message:
- "Resources are being prepared. Check back soon." with a friendly icon
- This page will be populated later with downloadable resources

### Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/pages/admin/AdminContent.tsx` | Admin video management page |
| Create | `src/components/admin/content/VideoForm.tsx` | Add/edit video form |
| Create | `src/components/admin/content/VideoList.tsx` | Admin video table |
| Create | `src/components/content/VideoCardList.tsx` | User-facing video card list |
| Create | `src/components/content/VideoDetail.tsx` | User-facing video detail panel |
| Modify | `src/pages/ContentLibrary.tsx` | Replace placeholder with real 2-col layout |
| Modify | `src/pages/Resources.tsx` | Remove placeholder, add "coming soon" state |
| Modify | `src/App.tsx` | Add `/admin/content` route |
| Modify | `src/components/admin/AdminLayout.tsx` | Add "Content" nav item to admin sidebar |
| SQL | Migration | Create `content_videos` table, enum, RLS, storage bucket |

### Technical Details

- **YouTube URL parsing**: Extract video ID from various YouTube URL formats (youtube.com/watch?v=, youtu.be/, youtube.com/embed/)
- **Native video upload**: Max file size enforced client-side (100MB), stored in `content-videos` bucket
- **Thumbnail generation**: For YouTube, auto-generate thumbnail URL from video ID (`img.youtube.com/vi/{id}/mqdefault.jpg`). For native, admin provides a thumbnail or a placeholder is shown.
- **Source badge**: Small pill/badge on each video card -- blue "YouTube" or green "Uploaded"
- **No mentor user type in this phase** -- that's Phase 2

### What's NOT in This Phase

- Mentor user type, dashboard, and onboarding flow
- Pricing tiers (XCG 30/75 per month)
- Mentor video upload permissions
- Promotional appearances system

These will be planned separately in Phase 2 after Phase 1 is working.

