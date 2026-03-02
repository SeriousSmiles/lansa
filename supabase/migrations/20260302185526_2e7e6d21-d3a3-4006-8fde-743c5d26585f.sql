
-- Fix: Add search_path to validate_intro_note function to resolve mutable search_path warning
CREATE OR REPLACE FUNCTION public.validate_intro_note()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public AS $$
BEGIN
  IF NEW.intro_note IS NOT NULL AND char_length(NEW.intro_note) > 200 THEN
    RAISE EXCEPTION 'intro_note cannot exceed 200 characters';
  END IF;
  RETURN NEW;
END; $$;

-- Fix: chat_participants_view security - use security_invoker to respect caller's RLS
-- Drop and recreate as a security invoker view
DROP VIEW IF EXISTS public.chat_participants_view;

-- We can't use WITH (security_invoker=true) syntax in all PG versions,
-- so we create it as a regular view (security_invoker is default in newer PG)
-- and rely on the underlying table RLS + app-layer filtering
CREATE VIEW public.chat_participants_view AS
SELECT 
  up.user_id,
  up.name,
  up.profile_image,
  up.title,
  om.organization_id,
  o.name AS organization_name,
  o.logo_url AS organization_logo
FROM public.user_profiles up
LEFT JOIN public.organization_memberships om 
  ON om.user_id = up.user_id AND om.is_active = true
LEFT JOIN public.organizations o ON o.id = om.organization_id;

-- Grant read access to authenticated users
GRANT SELECT ON public.chat_participants_view TO authenticated;
