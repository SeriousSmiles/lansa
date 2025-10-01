-- Learning Job Feed System Migration
-- Creates normalized tables for smart job recommendations

-- 1) Enums
DO $$ BEGIN
  CREATE TYPE job_type AS ENUM ('full_time','part_time','contract','internship');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE interaction_type AS ENUM ('view','save','apply','ignore','share');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending','accepted','declined','withdrawn');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2) Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  size text CHECK (size IN ('startup','sme','corporate')) DEFAULT 'startup',
  location text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3) User Preferences
CREATE TABLE IF NOT EXISTS user_job_prefs (
  user_id uuid PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  categories jsonb DEFAULT '[]'::jsonb,
  job_types jsonb DEFAULT '[]'::jsonb,
  remote_only boolean DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4) Job Listings (normalized version)
CREATE TABLE IF NOT EXISTS job_listings_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  job_type job_type NOT NULL,
  target_user_types jsonb DEFAULT '[]'::jsonb,
  image_url text,
  skills_required jsonb DEFAULT '[]'::jsonb,
  location text,
  salary_range text,
  is_remote boolean DEFAULT false,
  posted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES user_profiles(user_id)
);

-- 5) Job Skills
CREATE TABLE IF NOT EXISTS job_skills (
  job_id uuid REFERENCES job_listings_v2(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  PRIMARY KEY (job_id, skill_name)
);

-- 6) Job Applications
CREATE TABLE IF NOT EXISTS job_applications_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES job_listings_v2(id) ON DELETE CASCADE,
  applicant_user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'pending',
  cover_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, applicant_user_id)
);

-- 7) Job Interactions
CREATE TABLE IF NOT EXISTS job_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES job_listings_v2(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8) Job Recommendations
CREATE TABLE IF NOT EXISTS job_recommendations (
  user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES job_listings_v2(id) ON DELETE CASCADE,
  score numeric NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);

-- 9) Indexes
CREATE INDEX IF NOT EXISTS idx_jlv2_company ON job_listings_v2(company_id);
CREATE INDEX IF NOT EXISTS idx_jlv2_posted ON job_listings_v2(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jlv2_active ON job_listings_v2(is_active);
CREATE INDEX IF NOT EXISTS idx_jlv2_target ON job_listings_v2 USING gin (target_user_types);
CREATE INDEX IF NOT EXISTS idx_jlv2_skills ON job_listings_v2 USING gin (skills_required);
CREATE INDEX IF NOT EXISTS idx_jlv2_category ON job_listings_v2(category);
CREATE INDEX IF NOT EXISTS idx_jint_user ON job_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jav2_user ON job_applications_v2(applicant_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jrec_user ON job_recommendations(user_id, score DESC);

-- 10) Full-text search
ALTER TABLE job_listings_v2 ADD COLUMN IF NOT EXISTS search_tsv tsvector;

CREATE INDEX IF NOT EXISTS idx_jlv2_tsv ON job_listings_v2 USING gin(search_tsv);

CREATE OR REPLACE FUNCTION job_listings_tsvector_trigger() 
RETURNS trigger AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english', coalesce(NEW.title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description,'')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsv_jlv2 ON job_listings_v2;
CREATE TRIGGER tsv_jlv2 BEFORE INSERT OR UPDATE
ON job_listings_v2 FOR EACH ROW EXECUTE PROCEDURE job_listings_tsvector_trigger();

-- 11) RLS
ALTER TABLE job_listings_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_job_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_active_jobs" ON job_listings_v2 FOR SELECT
TO authenticated USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "recruiters_insert_jobs" ON job_listings_v2 FOR INSERT
TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "recruiters_update_own" ON job_listings_v2 FOR UPDATE
TO authenticated USING (created_by = auth.uid());

CREATE POLICY "recruiters_delete_own" ON job_listings_v2 FOR DELETE
TO authenticated USING (created_by = auth.uid());

CREATE POLICY "apps_select_parties" ON job_applications_v2 FOR SELECT
TO authenticated USING (
  applicant_user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM job_listings_v2 WHERE id = job_applications_v2.job_id AND created_by = auth.uid())
);

CREATE POLICY "apps_insert" ON job_applications_v2 FOR INSERT
TO authenticated WITH CHECK (applicant_user_id = auth.uid());

CREATE POLICY "apps_update" ON job_applications_v2 FOR UPDATE
TO authenticated USING (
  applicant_user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM job_listings_v2 WHERE id = job_applications_v2.job_id AND created_by = auth.uid())
);

CREATE POLICY "ints_owner" ON job_interactions FOR ALL
TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "recs_owner" ON job_recommendations FOR SELECT
TO authenticated USING (user_id = auth.uid());

CREATE POLICY "prefs_owner" ON user_job_prefs FOR ALL
TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "companies_read" ON companies FOR SELECT
TO authenticated USING (true);

CREATE POLICY "companies_insert" ON companies FOR INSERT
TO authenticated WITH CHECK (true);