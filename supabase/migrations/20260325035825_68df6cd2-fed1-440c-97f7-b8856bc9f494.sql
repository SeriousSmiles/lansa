
-- ============================================================
-- 1. Backfill last_active_at from auth.users for users who
--    logged in but never triggered a tracked action
-- ============================================================
UPDATE public.user_profiles up
SET last_active_at = au.last_sign_in_at
FROM auth.users au
WHERE au.id = up.user_id
  AND up.last_active_at IS NULL
  AND au.last_sign_in_at IS NOT NULL;

-- ============================================================
-- 2. Run assign_user_color for ALL users so no one has NULL
--    color_auto after the backfill updates last_active_at
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM public.user_profiles LOOP
    PERFORM public.assign_user_color(r.user_id);
  END LOOP;
END;
$$;

-- ============================================================
-- 3. Create callable function to sync sign-in time to profile
--    (used when tracking dashboard_visited on login)
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_last_sign_in_to_profile(p_user_id uuid, p_signed_in_at timestamptz DEFAULT now())
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_profiles
  SET last_active_at = p_signed_in_at
  WHERE user_id = p_user_id
    AND (last_active_at IS NULL OR p_signed_in_at > last_active_at);
END;
$$;

-- ============================================================
-- 4. Expose auth sign-in data to admin via SECURITY DEFINER RPC
--    (RLS blocks direct auth.users access from the client)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_users_with_auth_data()
RETURNS TABLE(user_id uuid, last_sign_in_at timestamptz, email_confirmed_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id AS user_id, last_sign_in_at, email_confirmed_at
  FROM auth.users;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_with_auth_data() TO authenticated;
