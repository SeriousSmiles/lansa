-- Fix 1: Create trigger to update last_active_at on user actions
CREATE OR REPLACE FUNCTION public.update_user_last_active()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.user_profiles
  SET last_active_at = NEW.created_at
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_last_active_trigger
AFTER INSERT ON public.user_actions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_last_active();

-- Fix 4: Add real-time color updates on significant actions
CREATE OR REPLACE FUNCTION public.maybe_update_user_color()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only recalculate if action is significant
  IF NEW.action_type IN (
    'dashboard_visited', 
    'profile_updated', 
    'insight_opened',
    'pitch_generated',
    'onboarding_completed',
    'recommended_action_clicked'
  ) THEN
    PERFORM public.assign_user_color(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_color_on_action
AFTER INSERT ON public.user_actions
FOR EACH ROW
EXECUTE FUNCTION public.maybe_update_user_color();

-- Fix 5: Improve segmentation logic with better thresholds and metrics
CREATE OR REPLACE FUNCTION public.assign_user_color(user_id_param uuid)
RETURNS user_color
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_color_result user_color;
  days_since_active integer;
  profile_completion numeric;
  is_certified boolean;
  total_growth_completed integer;
  actions_last_7d integer;
  actions_last_30d integer;
  unique_action_types integer;
BEGIN
  -- Get user metrics with improved activity tracking
  SELECT 
    EXTRACT(DAY FROM (NOW() - COALESCE(up.last_active_at, up.created_at)))::integer,
    COALESCE(up.certified, false),
    COALESCE(ugs.total_completed, 0)
  INTO days_since_active, is_certified, total_growth_completed
  FROM public.user_profiles up
  LEFT JOIN public.user_growth_stats ugs ON ugs.user_id = up.user_id
  WHERE up.user_id = user_id_param;
  
  -- Calculate recent activity metrics
  SELECT 
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days'),
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days'),
    COUNT(DISTINCT action_type)
  INTO actions_last_7d, actions_last_30d, unique_action_types
  FROM public.user_actions
  WHERE user_id = user_id_param;
  
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
  
  -- Improved segmentation logic with activity frequency
  -- Purple (Advocate): Certified + very active + high engagement + diverse actions
  IF is_certified 
     AND days_since_active < 7 
     AND (total_growth_completed >= 5 OR actions_last_7d >= 10)
     AND unique_action_types >= 4 THEN
    user_color_result := 'purple';
    
  -- Green (Engaged): Active and engaged with good profile
  ELSIF (days_since_active < 14 OR actions_last_7d >= 5) 
        AND profile_completion >= 60 
        AND actions_last_30d >= 10 THEN
    user_color_result := 'green';
    
  -- Red (Drifting): Very inactive AND minimal engagement
  ELSIF (days_since_active > 30 AND actions_last_30d < 3) 
        OR (profile_completion < 30 AND actions_last_30d < 5) THEN
    user_color_result := 'red';
    
  -- Orange (Underused): Everything in between - some activity but underutilizing
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