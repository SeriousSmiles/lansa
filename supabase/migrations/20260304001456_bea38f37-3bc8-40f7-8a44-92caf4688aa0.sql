
-- ============================================================
-- 1. Fix security_definer views → security_invoker
-- ============================================================

CREATE OR REPLACE VIEW public.catalogue_students
WITH (security_invoker = true)
AS
SELECT ce.user_id,
    up.name,
    up.title,
    up.about_text,
    up.skills,
    up.profile_image,
    up.cover_color,
    up.highlight_color,
    up.professional_goal,
    ce.job_ready,
    ce.internship_ready,
    ce.location,
    uc.lansa_certified,
    uc.certified_at
FROM ((catalogue_entries ce
     JOIN user_profiles_public up ON (up.user_id = ce.user_id))
     JOIN user_certifications uc ON ((uc.user_id = ce.user_id AND uc.lansa_certified = true)))
WHERE (ce.is_active = true);

CREATE OR REPLACE VIEW public.chat_participants_view
WITH (security_invoker = true)
AS
SELECT up.user_id,
    up.name,
    up.profile_image,
    up.title,
    om.organization_id,
    o.name AS organization_name,
    o.logo_url AS organization_logo
FROM ((user_profiles up
     LEFT JOIN organization_memberships om ON ((om.user_id = up.user_id AND om.is_active = true)))
     LEFT JOIN organizations o ON (o.id = om.organization_id));

-- ============================================================
-- 2. Fix mutable search_path on trigger functions
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_product_updates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ============================================================
-- 3. Fix notifications INSERT — restrict to own user_id only
-- ============================================================

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. Fix organization_audit_log — remove overly permissive INSERT
-- ============================================================

DROP POLICY IF EXISTS "System can insert audit logs" ON public.organization_audit_log;

-- ============================================================
-- 5. Fix segment_email_log — remove public INSERT
-- ============================================================

DROP POLICY IF EXISTS "System can insert segment email log" ON public.segment_email_log;

-- ============================================================
-- 6. Fix cert_certifications — prevent unauthenticated enumeration
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view certifications by verification code" ON public.cert_certifications;

CREATE POLICY "View certifications"
ON public.cert_certifications
FOR SELECT
USING (
  auth.role() = 'authenticated'
  OR (verification_code IS NOT NULL AND verification_code != '')
);
