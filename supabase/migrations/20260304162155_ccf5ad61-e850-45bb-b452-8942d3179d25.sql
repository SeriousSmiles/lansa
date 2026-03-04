CREATE OR REPLACE VIEW public.chat_participants_view AS
SELECT 
  up.user_id,
  COALESCE(NULLIF(TRIM(up.name), ''), bp.company_name) AS name,
  up.profile_image,
  up.title,
  om.organization_id,
  COALESCE(o.name, bp.company_name) AS organization_name,
  o.logo_url AS organization_logo
FROM public.user_profiles up
LEFT JOIN public.organization_memberships om ON om.user_id = up.user_id AND om.is_active = true
LEFT JOIN public.organizations o ON o.id = om.organization_id
LEFT JOIN public.business_profiles bp ON bp.user_id = up.user_id

UNION

SELECT 
  bp.user_id,
  bp.company_name AS name,
  NULL::text AS profile_image,
  bp.company_name AS title,
  NULL::uuid AS organization_id,
  bp.company_name AS organization_name,
  NULL::text AS organization_logo
FROM public.business_profiles bp
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.user_id = bp.user_id
);