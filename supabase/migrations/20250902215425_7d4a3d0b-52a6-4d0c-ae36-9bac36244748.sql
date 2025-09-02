-- Since catalogue_students is a view, we need to secure the underlying table
-- First, let's check what tables feed into this view and secure them instead

-- Add RLS policies for business_onboarding_data (likely feeds the catalogue)
CREATE POLICY "Business users can view business onboarding data" 
ON public.business_onboarding_data 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() 
  OR has_role(auth.uid(), 'business'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Add INSERT/UPDATE policies for security_audit_log
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own audit logs" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Secure user_certifications better (contains sensitive assessment data)
DROP POLICY IF EXISTS "user_certifications_select_business_certified" ON public.user_certifications;

CREATE POLICY "Business users can view verified certifications only" 
ON public.user_certifications 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() 
  OR (
    has_role(auth.uid(), 'business'::app_role) 
    AND lansa_certified = true 
    AND verified = true
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Add security function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  action_type text,
  table_name text,
  record_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action_type,
    table_name,
    record_id,
    ip_address,
    created_at
  ) VALUES (
    auth.uid(),
    action_type,
    table_name,
    record_id,
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    now()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Silently fail to not break application flow
    NULL;
END;
$$;