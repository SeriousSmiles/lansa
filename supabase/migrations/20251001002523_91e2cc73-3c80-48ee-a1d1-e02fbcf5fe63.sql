-- Simple seed for 10 job listings using existing business profiles
DO $$
DECLARE
  v_business_id uuid;
BEGIN
  -- Get the first available business profile
  SELECT id INTO v_business_id FROM public.business_profiles LIMIT 1;
  
  IF v_business_id IS NULL THEN
    RAISE NOTICE 'No business profiles found. Please create a business profile first.';
    RETURN;
  END IF;

  -- Insert 10 sample job listings for testing
  INSERT INTO public.job_listings (business_id, title, description, location, category, job_type, mode, is_remote, salary_range, top_skills, target_user_types, is_active, expires_at)
  VALUES
    (v_business_id, 'Senior Full Stack Engineer', 'Build scalable web applications using React and Node.js', 'San Francisco, CA', 'Engineering', 'full_time', 'employee', true, 'USD 120000 - 180000', ARRAY['React', 'Node.js', 'TypeScript'], ARRAY['job_seeker', 'entrepreneur'], true, NOW() + INTERVAL '60 days'),
    (v_business_id, 'Frontend Developer Intern', 'Learn modern web development with our engineering team', 'San Francisco, CA', 'Engineering', 'internship', 'internship', false, 'USD 25 - 35', ARRAY['JavaScript', 'React', 'HTML'], ARRAY['student'], true, NOW() + INTERVAL '30 days'),
    (v_business_id, 'Machine Learning Engineer', 'Develop AI models for production systems', 'Remote', 'Engineering', 'full_time', 'employee', true, 'USD 140000 - 200000', ARRAY['Python', 'TensorFlow', 'PyTorch'], ARRAY['job_seeker', 'visionary'], true, NOW() + INTERVAL '90 days'),
    (v_business_id, 'Digital Marketing Manager', 'Lead digital marketing campaigns', 'New York, NY', 'Marketing', 'full_time', 'employee', false, 'USD 85000 - 120000', ARRAY['SEO', 'SEM', 'Analytics'], ARRAY['job_seeker', 'entrepreneur'], true, NOW() + INTERVAL '60 days'),
    (v_business_id, 'Senior UI/UX Designer', 'Design beautiful user experiences', 'Remote', 'Design', 'full_time', 'employee', true, 'USD 90000 - 130000', ARRAY['Figma', 'User Research', 'Prototyping'], ARRAY['job_seeker', 'visionary'], true, NOW() + INTERVAL '60 days'),
    (v_business_id, 'Product Manager', 'Define product strategy and roadmap', 'Austin, TX', 'Product', 'full_time', 'employee', false, 'USD 120000 - 170000', ARRAY['Product Management', 'Strategy'], ARRAY['visionary', 'entrepreneur'], true, NOW() + INTERVAL '75 days'),
    (v_business_id, 'Account Executive', 'Close enterprise deals', 'Chicago, IL', 'Sales', 'full_time', 'employee', false, 'USD 80000 - 140000', ARRAY['B2B Sales', 'Salesforce', 'Negotiation'], ARRAY['job_seeker', 'entrepreneur'], true, NOW() + INTERVAL '60 days'),
    (v_business_id, 'Data Scientist', 'Analyze data and build predictive models', 'Boston, MA', 'Data Science', 'full_time', 'employee', true, 'USD 110000 - 160000', ARRAY['Python', 'Machine Learning', 'Statistics'], ARRAY['job_seeker', 'visionary'], true, NOW() + INTERVAL '70 days'),
    (v_business_id, 'DevOps Engineer', 'Manage cloud infrastructure and CI/CD pipelines', 'Remote', 'Engineering', 'full_time', 'employee', true, 'USD 110000 - 160000', ARRAY['AWS', 'Docker', 'Kubernetes'], ARRAY['job_seeker', 'freelancer'], true, NOW() + INTERVAL '45 days'),
    (v_business_id, 'Content Marketing Specialist', 'Create engaging content strategies', 'Remote', 'Marketing', 'contract', 'employee', true, 'USD 50 - 75', ARRAY['Content Writing', 'SEO', 'Social Media'], ARRAY['job_seeker', 'freelancer'], true, NOW() + INTERVAL '45 days')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully seeded 10 sample job listings';
END $$;