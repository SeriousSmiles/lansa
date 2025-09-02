-- Phase 1: Data preservation and migration setup for Clerk integration

-- Create user migration mapping table to track the migration from Supabase to Clerk
CREATE TABLE IF NOT EXISTS public.user_migration_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_user_id uuid NOT NULL UNIQUE,
  clerk_user_id text UNIQUE,
  migration_status text NOT NULL DEFAULT 'pending' CHECK (migration_status IN ('pending', 'invited', 'completed', 'failed')),
  invited_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.user_migration_mapping ENABLE ROW LEVEL SECURITY;

-- Create organizations table for Clerk organization support
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_org_id text NOT NULL UNIQUE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  website text,
  industry text,
  size_range text,
  plan_type text DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  is_active boolean NOT NULL DEFAULT true,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create organization memberships table
CREATE TABLE IF NOT EXISTS public.organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL, -- Will reference auth.users initially, then Clerk user IDs
  clerk_user_id text, -- For tracking during migration
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member')),
  permissions jsonb DEFAULT '[]'::jsonb,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  invited_at timestamp with time zone,
  invited_by uuid,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;

-- Extend app_role enum to include organization-level roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'org_owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'org_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'org_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'org_member';

-- Add organization context to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_organization_role boolean DEFAULT false;

-- Create function to check organization membership
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.user_id = _user_id 
    AND om.organization_id = _org_id 
    AND om.is_active = true
  );
$$;

-- Create function to check organization role
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id uuid, _org_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.user_id = _user_id 
    AND om.organization_id = _org_id 
    AND om.role = _role
    AND om.is_active = true
  );
$$;

-- Add organization_id to existing tables that need organization context
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

ALTER TABLE public.business_profiles 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Add migration status columns to existing tables
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS migration_status text DEFAULT 'pending' CHECK (migration_status IN ('pending', 'migrated')),
ADD COLUMN IF NOT EXISTS clerk_user_id text;

-- RLS Policies for migration mapping
CREATE POLICY "Admins can manage migration mapping" 
ON public.user_migration_mapping 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own migration status" 
ON public.user_migration_mapping 
FOR SELECT 
TO authenticated
USING (supabase_user_id = auth.uid());

-- RLS Policies for organizations
CREATE POLICY "Organization members can view their organizations" 
ON public.organizations 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.organization_id = id 
    AND om.user_id = auth.uid() 
    AND om.is_active = true
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Organization owners and admins can update their organizations" 
ON public.organizations 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.organization_id = id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('owner', 'admin')
    AND om.is_active = true
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for organization memberships
CREATE POLICY "Organization members can view memberships in their organizations" 
ON public.organization_memberships 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.organization_memberships om2
    WHERE om2.organization_id = organization_id 
    AND om2.user_id = auth.uid() 
    AND om2.role IN ('owner', 'admin', 'manager')
    AND om2.is_active = true
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Organization owners and admins can manage memberships" 
ON public.organization_memberships 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_memberships om2
    WHERE om2.organization_id = organization_id 
    AND om2.user_id = auth.uid() 
    AND om2.role IN ('owner', 'admin')
    AND om2.is_active = true
  )
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_memberships om2
    WHERE om2.organization_id = organization_id 
    AND om2.user_id = auth.uid() 
    AND om2.role IN ('owner', 'admin')
    AND om2.is_active = true
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Add updated_at triggers
CREATE TRIGGER update_user_migration_mapping_updated_at
BEFORE UPDATE ON public.user_migration_mapping
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_memberships_updated_at
BEFORE UPDATE ON public.organization_memberships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();