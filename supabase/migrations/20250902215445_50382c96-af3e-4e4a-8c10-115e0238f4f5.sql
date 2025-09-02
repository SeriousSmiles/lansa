-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Add policies for audit log
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all audit logs" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own audit logs" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Strengthen user_certifications policy 
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

-- Add security for business onboarding data
CREATE POLICY "Business users can view relevant onboarding data" 
ON public.business_onboarding_data 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() 
  OR has_role(auth.uid(), 'business'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);