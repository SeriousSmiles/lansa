UPDATE public.organizations o SET logo_url = b.company_logo
FROM (SELECT DISTINCT ON (lower(btrim(company_name))) company_name, company_logo FROM public.business_onboarding_data WHERE company_logo IS NOT NULL ORDER BY lower(btrim(company_name)), updated_at DESC NULLS LAST) b
WHERE o.logo_url IS NULL AND lower(btrim(o.name)) = lower(btrim(b.company_name));

UPDATE public.organizations o SET logo_url = c.logo_url FROM public.companies c
WHERE o.logo_url IS NULL AND c.logo_url IS NOT NULL AND lower(btrim(o.name)) = lower(btrim(c.name));

CREATE OR REPLACE FUNCTION public.sync_company_logo()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.company_logo IS NOT NULL AND NEW.company_name IS NOT NULL THEN
    UPDATE public.companies SET logo_url = NEW.company_logo WHERE lower(name) = lower(NEW.company_name);
    UPDATE public.organizations o SET logo_url = NEW.company_logo
    WHERE EXISTS (SELECT 1 FROM public.organization_memberships m WHERE m.organization_id = o.id AND m.user_id = NEW.user_id AND m.is_active)
       OR (o.logo_url IS NULL AND lower(btrim(o.name)) = lower(btrim(NEW.company_name)));
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE VIEW public.chat_participants_view WITH (security_invoker = false) AS
SELECT up.user_id,
  COALESCE(NULLIF(TRIM(up.name), ''), bp.company_name) AS name,
  up.profile_image, up.title, om.organization_id,
  COALESCE(o.name, bp.company_name) AS organization_name,
  COALESCE(o.logo_url, (SELECT b.company_logo FROM public.business_onboarding_data b WHERE b.user_id = up.user_id AND b.company_logo IS NOT NULL LIMIT 1)) AS organization_logo
FROM public.user_profiles up
LEFT JOIN public.organization_memberships om ON om.user_id = up.user_id AND om.is_active = true
LEFT JOIN public.organizations o ON o.id = om.organization_id
LEFT JOIN public.business_profiles bp ON bp.user_id = up.user_id
UNION
SELECT bp.user_id, bp.company_name, NULL::text, bp.company_name, NULL::uuid, bp.company_name,
  (SELECT b.company_logo FROM public.business_onboarding_data b WHERE b.user_id = bp.user_id AND b.company_logo IS NOT NULL LIMIT 1)
FROM public.business_profiles bp
WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = bp.user_id);
GRANT SELECT ON public.chat_participants_view TO authenticated;