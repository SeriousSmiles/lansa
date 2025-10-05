# Shareable Profile Sync Architecture

## Overview

The shareable profile system allows users to publicly share their Lansa profiles via unique URLs. The system automatically syncs data from the private `user_profiles` table to the public `user_profiles_public` table, respecting user privacy preferences.

## Architecture Diagram

```
┌─────────────────────┐
│   user_profiles     │ (Private)
│  - All user data    │
│  - privacy_settings │
│  - is_public flag   │
└──────────┬──────────┘
           │
           │ Trigger: sync_user_profiles_trigger
           │ (INSERT/UPDATE/DELETE)
           │
           ▼
┌─────────────────────┐
│user_profiles_public │ (Public, Read-Only)
│  - Filtered data    │
│  - Respects privacy │
│  - No user_id FK    │
└─────────────────────┘
           │
           │ Real-time subscription
           │
           ▼
┌─────────────────────┐
│ SharedProfilePage   │
│  /profile/:param    │
└─────────────────────┘
```

## How the Trigger Works

### Trigger Function: `sync_user_profiles_public()`

The trigger is executed **AFTER** every INSERT, UPDATE, or DELETE operation on `user_profiles`.

**Flow:**

1. **DELETE Operation**: Removes corresponding row from `user_profiles_public`
2. **INSERT/UPDATE Operation**:
   - Checks `is_public` flag
   - If `true`: Syncs data to public table (respecting privacy settings)
   - If `false`: Removes data from public table

**Privacy Controls:**

The trigger respects `privacy_settings` JSONB field:
```json
{
  "show_email": false,
  "show_phone": false
}
```

- `show_email`: Controls if email appears on public profile
- `show_phone`: Controls if phone number appears on public profile

If privacy settings are not enabled, the corresponding fields are set to `NULL` in the public table.

## Synced Fields

The following fields are synced from `user_profiles` to `user_profiles_public`:

| Field | Type | Privacy Controlled | Notes |
|-------|------|-------------------|-------|
| `user_id` | UUID | No | Primary key |
| `name` | TEXT | No | User's display name |
| `title` | TEXT | No | Professional title |
| `about_text` | TEXT | No | About me section |
| `cover_color` | TEXT | No | Theme color |
| `highlight_color` | TEXT | No | Accent color |
| `profile_image` | TEXT | No | Avatar URL |
| `skills` | TEXT[] | No | Skills array |
| `experiences` | JSONB | No | Work experience |
| `education` | JSONB | No | Education history |
| `professional_goal` | TEXT | No | Career goal |
| `languages` | JSONB | No | Language proficiencies |
| `biggest_challenge` | TEXT | No | Career challenge |
| `location` | TEXT | No | Geographic location |
| `phone_number` | TEXT | **Yes** | Controlled by `show_phone` |
| `email` | TEXT | **Yes** | Controlled by `show_email` |

## Adding New Fields (Step-by-Step)

To add a new field to the shareable profile system:

### 1. Add Column to `user_profiles` Table

```sql
ALTER TABLE public.user_profiles
  ADD COLUMN new_field TEXT;
```

### 2. Add Column to `user_profiles_public` Table

```sql
ALTER TABLE public.user_profiles_public
  ADD COLUMN new_field TEXT;
```

### 3. Update the Sync Trigger Function

Add the field to the `jsonb_build_object` in `sync_user_profiles_public()`:

```sql
public_data := jsonb_build_object(
  -- ... existing fields ...
  'new_field', NEW.new_field,
  -- ... rest of fields ...
);
```

Add to the UPDATE clause:

```sql
ON CONFLICT (user_id) DO UPDATE SET
  -- ... existing fields ...
  new_field = EXCLUDED.new_field,
  -- ... rest of fields ...
```

### 4. Update TypeScript Interfaces

**`src/types/sharedProfileTypes.ts`:**
```typescript
export interface PublicProfileFields {
  // ... existing fields ...
  new_field: string | null;
}

export const SYNCABLE_PROFILE_FIELDS = [
  // ... existing fields ...
  'new_field',
] as const;
```

**`src/hooks/profile/profileTypes.ts`:**
```typescript
export interface UserProfile {
  // ... existing fields ...
  new_field?: string;
}
```

### 5. Update Frontend Components

**`src/hooks/useSharedProfileData.ts`:**
```typescript
const profile: SharedProfileData = {
  // ... existing fields ...
  newField: profileData?.new_field || "",
};
```

**Display component** (e.g., `SharedProfileSidebar.tsx`):
```typescript
{newField && (
  <div>
    <h3>New Field</h3>
    <p>{newField}</p>
  </div>
)}
```

### 6. Backfill Existing Public Profiles (Optional)

```sql
UPDATE public.user_profiles_public upp
SET new_field = up.new_field
FROM public.user_profiles up
WHERE upp.user_id = up.user_id
  AND up.is_public = true;
```

## Privacy Controls

### Implementing Field-Level Privacy

To add privacy control for a new field:

1. **Update privacy_settings schema:**
```sql
-- Default privacy settings now include new field
ALTER TABLE public.user_profiles
  ALTER COLUMN privacy_settings 
  SET DEFAULT '{"show_email": false, "show_phone": false, "show_new_field": false}'::jsonb;
```

2. **Update trigger to check privacy:**
```sql
DECLARE
  show_new_field boolean;
BEGIN
  show_new_field := COALESCE((NEW.privacy_settings->>'show_new_field')::boolean, false);
  
  public_data := jsonb_build_object(
    'new_field', CASE WHEN show_new_field THEN NEW.new_field ELSE NULL END
  );
END;
```

3. **Update PrivacySettings component:**
```typescript
// Add toggle for new field
<Switch
  checked={settings.show_new_field}
  onCheckedChange={(checked) => 
    setSettings(prev => ({ ...prev, show_new_field: checked }))
  }
/>
```

## Real-Time Updates

The shareable profile page subscribes to real-time updates:

```typescript
const channel = supabase
  .channel('public:user_profiles_public')
  .on('postgres_changes', 
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'user_profiles_public',
      filter: `user_id=eq.${userId}`
    }, 
    (payload) => {
      loadProfile(userId);
    }
  )
  .subscribe();
```

**When changes are visible:**
- Updates to `user_profiles` automatically sync to `user_profiles_public` via trigger
- Subscribed clients receive real-time notifications
- Profile page reloads data automatically

## Testing Guidelines

### Test Scenarios

1. **Profile Visibility Toggle**
   - Set `is_public = true` → Profile appears in public table
   - Set `is_public = false` → Profile removed from public table

2. **Privacy Settings**
   - Enable `show_email` → Email visible on public profile
   - Disable `show_email` → Email is NULL in public table
   - Same for `show_phone`

3. **Real-Time Sync**
   - Update profile data → Changes appear on shareable page immediately
   - Add/remove skills → Skills list updates in real-time
   - Change colors → Theme updates instantly

4. **Empty Sections**
   - Profile with no skills → Skills section hidden
   - Profile with no languages → Languages section hidden
   - Profile with no contact info → Contact section hidden

5. **Data Integrity**
   - JSONB fields (experiences, education, languages) serialize correctly
   - Arrays (skills) maintain order and uniqueness
   - NULL values handled gracefully

### Manual Testing Checklist

```
□ Create a new profile and set is_public = true
□ Verify profile appears in user_profiles_public
□ Toggle privacy settings and verify email/phone visibility
□ Update profile data and confirm real-time sync
□ Delete profile and confirm removal from public table
□ Test with empty/null fields
□ Test on mobile devices for responsiveness
□ Verify profile URL format (e.g., /profile/john-doe-uuid)
□ Test with special characters in name
□ Verify analytics and tracking (if implemented)
```

## Performance Considerations

### Database Indexes

- `idx_user_profiles_public_user_id`: Indexed on `user_id` for fast lookups
- Consider adding composite indexes if querying by multiple fields

### Caching Strategy

**Current:** No caching (real-time updates prioritized)

**Future Optimization:**
- Cache public profiles in Redis with 5-minute TTL
- Invalidate cache on profile updates
- Serve cached version for anonymous visitors

### Query Optimization

- Use `.maybeSingle()` instead of `.single()` to handle missing profiles gracefully
- Select only required fields in queries (avoid `SELECT *` in production)

## Security Considerations

### Row-Level Security (RLS)

**`user_profiles_public` table:**
```sql
CREATE POLICY "Public can view shared profiles"
ON user_profiles_public
FOR SELECT
USING (true);  -- Anyone can read public profiles
```

**No write access** to `user_profiles_public`:
- Only the trigger can write to this table
- Users modify `user_profiles`, changes sync automatically

### Data Exposure Prevention

1. **Never include sensitive data** in public table:
   - No raw passwords or tokens
   - No private notes or internal IDs
   - No payment information

2. **Privacy-controlled fields** must default to hidden:
   - Email and phone are NULL by default
   - User must explicitly enable visibility

3. **Validate on read**:
   - Frontend checks for NULL values
   - Conditional rendering for empty sections

## Troubleshooting

### Common Issues

**Issue: Profile not appearing on shareable page**
- Check `is_public = true` in `user_profiles`
- Verify trigger is enabled: `SELECT * FROM pg_trigger WHERE tgname = 'sync_user_profiles_trigger'`
- Check for errors in Supabase logs

**Issue: Real-time updates not working**
- Verify subscription is active
- Check browser console for connection errors
- Ensure Realtime is enabled in Supabase project settings

**Issue: Privacy settings not respected**
- Verify `privacy_settings` column is JSONB
- Check trigger logic for privacy field extraction
- Backfill existing profiles if needed

**Issue: JSONB fields not displaying correctly**
- Ensure proper type conversion in TypeScript
- Use type casting: `profileData?.languages as LanguageItem[]`
- Validate JSONB structure in database

### Debug Commands

```sql
-- Check if profile is public
SELECT user_id, is_public, privacy_settings 
FROM user_profiles 
WHERE user_id = 'YOUR_USER_ID';

-- Check public profile data
SELECT * FROM user_profiles_public 
WHERE user_id = 'YOUR_USER_ID';

-- Check trigger status
SELECT * FROM pg_trigger 
WHERE tgname = 'sync_user_profiles_trigger';

-- View trigger function source
\sf sync_user_profiles_public
```

## Future Enhancements

### Planned Features

1. **Custom Profile URLs**
   - Allow users to set vanity URLs: `/profile/john-doe`
   - Require uniqueness check and slug generation

2. **Profile Analytics**
   - Track profile views
   - Show visitor demographics (if available)
   - Engagement metrics (clicks on contact info, etc.)

3. **Social Sharing**
   - Add Open Graph meta tags
   - Generate social media cards
   - QR code for profile URL

4. **Field-Level Privacy**
   - Allow hiding specific skills or experiences
   - "Show to recruiters only" mode
   - Conditional visibility based on viewer type

5. **Export Options**
   - Download profile as PDF
   - Export to JSON for portability
   - Generate resume formats

6. **Profile Themes**
   - Multiple layout templates
   - Custom CSS for advanced users
   - Dark/light mode toggle on shareable page

## Maintenance

### Regular Tasks

**Weekly:**
- Monitor Supabase logs for sync errors
- Check real-time subscription health
- Review database performance metrics

**Monthly:**
- Analyze index usage and optimize if needed
- Review and update privacy policies
- Audit public profiles for data exposure

**Quarterly:**
- Performance testing and optimization
- Security audit of public data
- Update documentation with new features

### Monitoring Queries

```sql
-- Count public profiles
SELECT COUNT(*) FROM user_profiles_public;

-- Check for stale data (not updated in 30 days)
SELECT user_id, updated_at 
FROM user_profiles_public 
WHERE updated_at < NOW() - INTERVAL '30 days';

-- Find profiles with privacy issues
SELECT user_id, email, phone_number 
FROM user_profiles_public 
WHERE (email IS NOT NULL OR phone_number IS NOT NULL);
```

## Support

For issues or questions:
1. Check this documentation first
2. Review Supabase logs for error messages
3. Test with the manual testing checklist
4. Contact the development team with specific error details

---

**Last Updated:** 2025-10-05  
**Version:** 1.0  
**Maintainer:** Lansa Development Team
