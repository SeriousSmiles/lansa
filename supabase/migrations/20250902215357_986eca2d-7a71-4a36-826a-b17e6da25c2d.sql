-- CRITICAL SECURITY FIX: Restrict user_profiles_public access
DROP POLICY IF EXISTS "Public can view shared profiles" ON public.user_profiles_public;

CREATE POLICY "Authenticated users can view public profiles" 
ON public.user_profiles_public 
FOR SELECT 
TO authenticated
USING (true);

-- CRITICAL SECURITY FIX: Secure AI logs - restrict to admin only
DROP POLICY IF EXISTS "Admins can view all ai logs" ON public.ai_logs;

CREATE POLICY "Admin only access to ai logs" 
ON public.ai_logs 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- CRITICAL SECURITY FIX: Secure growth prompts - require authentication
DROP POLICY IF EXISTS "Anyone can view active growth prompts" ON public.growth_prompts;

CREATE POLICY "Authenticated users can view growth prompts" 
ON public.growth_prompts 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- CRITICAL SECURITY FIX: Add proper RLS policies for catalogue_students
ALTER TABLE public.catalogue_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business users can view student catalogue" 
ON public.catalogue_students 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'business'::app_role));

CREATE POLICY "Students can view their own catalogue entry" 
ON public.catalogue_students 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- SECURITY FIX: Strengthen user role assignment policy
DROP POLICY IF EXISTS "Users can assign themselves business role" ON public.user_roles;

CREATE POLICY "Users can assign business role with verification" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'business'::app_role 
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM business_profiles bp WHERE bp.user_id = auth.uid()
  )
);

-- Add audit trail for sensitive data access
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

CREATE POLICY "Admin can view all audit logs" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));