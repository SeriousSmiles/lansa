
-- Backfill employer role for existing employer users with no role
INSERT INTO public.user_roles (user_id, role)
SELECT ua.user_id, 'employer'::app_role
FROM public.user_answers ua
WHERE ua.user_type = 'employer'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = ua.user_id
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Auto-assign role trigger on user_answers
CREATE OR REPLACE FUNCTION public.assign_role_on_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_type = 'employer' AND (OLD IS NULL OR OLD.user_type IS DISTINCT FROM 'employer') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'employer'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_assign_employer_role ON public.user_answers;

CREATE TRIGGER auto_assign_employer_role
AFTER INSERT OR UPDATE OF user_type ON public.user_answers
FOR EACH ROW
EXECUTE FUNCTION public.assign_role_on_onboarding();
