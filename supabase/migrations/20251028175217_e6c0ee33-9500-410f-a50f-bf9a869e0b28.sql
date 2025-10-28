-- Fix function search paths for security
-- This ensures functions operate in the correct schema and prevents schema injection

-- Update has_role function
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;

-- Update is_org_member function
ALTER FUNCTION public.is_org_member(uuid, uuid) SET search_path = public;

-- Update has_org_role function
ALTER FUNCTION public.has_org_role(uuid, uuid, text) SET search_path = public;

-- Update check_org_membership function
ALTER FUNCTION public.check_org_membership(uuid, uuid, text[]) SET search_path = public;

-- Update is_thread_participant function
ALTER FUNCTION public.is_thread_participant(uuid, uuid) SET search_path = public;

-- Update log_org_action function
ALTER FUNCTION public.log_org_action(uuid, uuid, text, uuid, jsonb) SET search_path = public;