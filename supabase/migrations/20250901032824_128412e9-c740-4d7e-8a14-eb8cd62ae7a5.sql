-- Allow users to assign themselves the 'business' role during onboarding
CREATE POLICY "Users can assign themselves business role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'business'::app_role
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid()
  )
);