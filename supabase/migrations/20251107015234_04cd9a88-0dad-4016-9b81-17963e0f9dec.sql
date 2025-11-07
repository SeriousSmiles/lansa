-- Fix 2: Create function to backfill historical last_active_at data
CREATE OR REPLACE FUNCTION public.backfill_last_active_at()
RETURNS TABLE(users_updated bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  updated_count bigint;
BEGIN
  UPDATE public.user_profiles up
  SET last_active_at = (
    SELECT MAX(created_at) 
    FROM public.user_actions ua 
    WHERE ua.user_id = up.user_id
  )
  WHERE EXISTS (
    SELECT 1 FROM public.user_actions WHERE user_id = up.user_id
  );
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN QUERY SELECT updated_count;
END;
$$;

-- Run the backfill immediately
SELECT public.backfill_last_active_at();