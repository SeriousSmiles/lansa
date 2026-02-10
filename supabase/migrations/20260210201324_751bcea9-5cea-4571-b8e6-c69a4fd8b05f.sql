
-- Trigger: when a cert_certifications row is inserted, sync to user_certifications.lansa_certified
CREATE OR REPLACE FUNCTION public.sync_cert_to_user_certifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Upsert into user_certifications, setting lansa_certified and verified
  INSERT INTO public.user_certifications (user_id, lansa_certified, verified, certified_at)
  VALUES (NEW.user_id, true, true, NEW.date_issued)
  ON CONFLICT (user_id) DO UPDATE SET
    lansa_certified = true,
    verified = true,
    certified_at = COALESCE(user_certifications.certified_at, NEW.date_issued),
    updated_at = now();
  
  -- Also update user_profiles.certified flag for discovery visibility
  UPDATE public.user_profiles
  SET certified = true,
      visible_to_employers = true
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER sync_cert_certification_to_user
  AFTER INSERT ON public.cert_certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_cert_to_user_certifications();
