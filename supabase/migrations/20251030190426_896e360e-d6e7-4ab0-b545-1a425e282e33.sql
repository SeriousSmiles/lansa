-- Create function to assign color to a single user based on activity metrics
CREATE OR REPLACE FUNCTION public.assign_user_color(user_id_param uuid)
RETURNS user_color
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_color_result user_color;
  days_since_active integer;
  profile_completion numeric;
  is_certified boolean;
  total_growth_completed integer;
BEGIN
  -- Get user metrics
  SELECT 
    EXTRACT(DAY FROM (NOW() - COALESCE(up.last_active_at, up.created_at)))::integer,
    COALESCE(up.certified, false),
    COALESCE(ugs.total_completed, 0)
  INTO days_since_active, is_certified, total_growth_completed
  FROM public.user_profiles up
  LEFT JOIN public.user_growth_stats ugs ON ugs.user_id = up.user_id
  WHERE up.user_id = user_id_param;
  
  -- Calculate profile completion percentage
  SELECT 
    (
      (CASE WHEN name IS NOT NULL AND name != '' THEN 20 ELSE 0 END) +
      (CASE WHEN email IS NOT NULL AND email != '' THEN 10 ELSE 0 END) +
      (CASE WHEN profile_image IS NOT NULL THEN 15 ELSE 0 END) +
      (CASE WHEN about_text IS NOT NULL AND about_text != '' THEN 15 ELSE 0 END) +
      (CASE WHEN title IS NOT NULL AND title != '' THEN 10 ELSE 0 END) +
      (CASE WHEN skills IS NOT NULL AND array_length(skills, 1) > 0 THEN 15 ELSE 0 END) +
      (CASE WHEN experiences IS NOT NULL AND jsonb_array_length(experiences) > 0 THEN 15 ELSE 0 END)
    )::numeric
  INTO profile_completion
  FROM public.user_profiles
  WHERE user_id = user_id_param;
  
  -- Assign color based on metrics
  -- Purple (Advocate): Certified + very active + high engagement
  IF is_certified AND days_since_active < 7 AND total_growth_completed >= 5 THEN
    user_color_result := 'purple';
  -- Green (Engaged): Active and engaged
  ELSIF days_since_active < 15 AND profile_completion >= 60 THEN
    user_color_result := 'green';
  -- Red (Drifting): Very inactive or minimal engagement
  ELSIF days_since_active > 30 OR profile_completion < 30 THEN
    user_color_result := 'red';
  -- Orange (Underused): Everything in between
  ELSE
    user_color_result := 'orange';
  END IF;
  
  -- Update the user's color_auto
  UPDATE public.user_profiles
  SET color_auto = user_color_result
  WHERE user_id = user_id_param;
  
  RETURN user_color_result;
END;
$$;

-- Create function to update all user colors in batch
CREATE OR REPLACE FUNCTION public.update_all_user_colors()
RETURNS TABLE(total_updated bigint, purple_count bigint, green_count bigint, orange_count bigint, red_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  updated_count bigint := 0;
BEGIN
  -- Update colors for all users
  FOR user_record IN 
    SELECT user_id FROM public.user_profiles
  LOOP
    PERFORM public.assign_user_color(user_record.user_id);
    updated_count := updated_count + 1;
  END LOOP;
  
  -- Return statistics
  RETURN QUERY
  SELECT 
    updated_count,
    COUNT(*) FILTER (WHERE color_auto = 'purple'),
    COUNT(*) FILTER (WHERE color_auto = 'green'),
    COUNT(*) FILTER (WHERE color_auto = 'orange'),
    COUNT(*) FILTER (WHERE color_auto = 'red')
  FROM public.user_profiles;
END;
$$;

-- Grant execute permissions to authenticated users for the batch function
GRANT EXECUTE ON FUNCTION public.update_all_user_colors() TO authenticated;

-- Run initial color assignment for all existing users
SELECT public.update_all_user_colors();