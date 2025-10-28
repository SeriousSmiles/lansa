-- Update the function to generate unique slugs
CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  p_name text,
  p_industry text DEFAULT NULL,
  p_size_range text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_logo_url text DEFAULT NULL,
  p_website text DEFAULT NULL,
  p_domain text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_slug text;
  v_base_slug text;
  v_random_suffix text;
  v_org organizations;
  v_membership organization_memberships;
  v_result jsonb;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Generate base slug from name
  v_base_slug := lower(p_name);
  v_base_slug := regexp_replace(v_base_slug, '[^a-z0-9]+', '-', 'g');
  v_base_slug := regexp_replace(v_base_slug, '^-|-$', '', 'g');
  
  -- Add random suffix to ensure uniqueness
  v_random_suffix := substr(md5(random()::text), 1, 6);
  v_slug := v_base_slug || '-' || v_random_suffix;

  -- Insert organization
  INSERT INTO public.organizations (
    name,
    clerk_org_id,
    slug,
    industry,
    size_range,
    description,
    logo_url,
    website,
    domain,
    is_active
  ) VALUES (
    p_name,
    'org-' || extract(epoch from now())::bigint::text,
    v_slug,
    p_industry,
    p_size_range,
    p_description,
    p_logo_url,
    p_website,
    p_domain,
    true
  )
  RETURNING * INTO v_org;

  -- Insert membership as owner
  INSERT INTO public.organization_memberships (
    organization_id,
    user_id,
    role,
    is_active
  ) VALUES (
    v_org.id,
    v_user_id,
    'owner',
    true
  )
  RETURNING * INTO v_membership;

  -- Build result JSON
  v_result := jsonb_build_object(
    'organization', to_jsonb(v_org),
    'membership', to_jsonb(v_membership)
  );

  RETURN v_result;
END;
$$;