# Admin App Access

## Goal
Let admins use their normal Lansa experience without being forced back to `/admin`, while keeping the Admin area easy to reach and fully protected.

## Changes
- Change the default signed-in destination so an admin with a `job_seeker`, `employer`, or `mentor` account lands on that role’s normal home page.
- Keep `/admin` accessible only to admins; direct visits and bookmarked Admin pages continue to work.
- Update post-login routing so an explicitly requested safe page is respected, including direct `/admin` links for admins.
- Add **Open Admin** to the regular app account menu for admins.
- Add **Go to app** to the Admin account menu on desktop and mobile, routing to the admin’s role home.
- If an admin has no regular role yet, retain `/admin` as the safe fallback.

## Verification
- Check the destination logic for admin accounts with each role: job seeker, employer, and mentor.
- Check direct navigation to `/admin` remains available to admins and blocked for non-admins.
- Check both account-menu switches on desktop and mobile.
