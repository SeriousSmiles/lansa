-- Fix ai_logs RLS: drop the misconfigured restrictive policy and replace with proper admin-only access

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Admins can view all ai logs" ON public.ai_logs;

-- Create proper permissive admin-only SELECT policy
CREATE POLICY "admin_select_ai_logs"
  ON public.ai_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow service role to INSERT (edge functions logging AI usage)
-- No user-facing INSERT policy needed
