import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting demo data seeding...');

    // Create demo companies
    const companies = [
      { name: 'TechCorp Caribbean', industry: 'Technology', size: 'corporate', location: 'Curaçao' },
      { name: 'Island Marketing Group', industry: 'Marketing', size: 'sme', location: 'Aruba' },
      { name: 'Creative Waves Studio', industry: 'Design', size: 'startup', location: 'Sint Maarten' },
      { name: 'Caribbean Hospitality Services', industry: 'Hospitality', size: 'corporate', location: 'Bonaire' },
      { name: 'Digital Nomad Agency', industry: 'Technology', size: 'startup', location: 'Remote' },
      { name: 'Island Finance Solutions', industry: 'Finance', size: 'sme', location: 'Curaçao' },
      { name: 'Caribbean Sales Network', industry: 'Sales', size: 'sme', location: 'Aruba' },
      { name: 'Engineering Solutions BV', industry: 'Engineering', size: 'corporate', location: 'Curaçao' },
    ];

    const { data: createdCompanies, error: companyError } = await supabase
      .from('companies')
      .insert(companies)
      .select();

    if (companyError) {
      console.error('Error creating companies:', companyError);
      throw companyError;
    }

    console.log(`Created ${createdCompanies.length} companies`);

    // Job templates
    const jobTemplates = [
      {
        title: 'Frontend Developer',
        description: 'Join our team to build amazing web applications using React and TypeScript.',
        category: 'Technology',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Git'],
        user_types: ['student', 'job_seeker', 'freelancer'],
      },
      {
        title: 'Marketing Coordinator',
        description: 'Help us grow our brand across the Caribbean islands.',
        category: 'Marketing',
        skills: ['Social Media', 'Content Creation', 'SEO', 'Analytics'],
        user_types: ['student', 'job_seeker'],
      },
      {
        title: 'UX/UI Designer',
        description: 'Design beautiful and intuitive user experiences for our products.',
        category: 'Design',
        skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
        user_types: ['freelancer', 'job_seeker'],
      },
      {
        title: 'Sales Representative',
        description: 'Drive revenue growth by building relationships with clients.',
        category: 'Sales',
        skills: ['Communication', 'Negotiation', 'CRM', 'Prospecting'],
        user_types: ['job_seeker', 'entrepreneur'],
      },
      {
        title: 'Software Engineer',
        description: 'Build scalable backend systems and APIs.',
        category: 'Engineering',
        skills: ['Python', 'Node.js', 'PostgreSQL', 'Docker'],
        user_types: ['job_seeker', 'freelancer'],
      },
      {
        title: 'Content Writer',
        description: 'Create engaging content for our blog and social media.',
        category: 'Creative',
        skills: ['Writing', 'SEO', 'Research', 'Editing'],
        user_types: ['freelancer', 'student'],
      },
      {
        title: 'Hotel Manager',
        description: 'Oversee daily operations of our beachfront resort.',
        category: 'Hospitality',
        skills: ['Leadership', 'Customer Service', 'Operations', 'Budgeting'],
        user_types: ['job_seeker'],
      },
      {
        title: 'Financial Analyst',
        description: 'Analyze financial data and provide strategic insights.',
        category: 'Finance',
        skills: ['Excel', 'Financial Modeling', 'Data Analysis', 'Reporting'],
        user_types: ['student', 'job_seeker'],
      },
      {
        title: 'Operations Manager',
        description: 'Streamline processes and improve efficiency.',
        category: 'Operations',
        skills: ['Project Management', 'Process Optimization', 'Leadership', 'Analytics'],
        user_types: ['job_seeker', 'entrepreneur'],
      },
      {
        title: 'Digital Marketing Intern',
        description: 'Learn and grow in a fast-paced marketing environment.',
        category: 'Marketing',
        skills: ['Social Media', 'Analytics', 'Content Creation'],
        user_types: ['student'],
      },
    ];

    const jobTypes = ['full_time', 'part_time', 'contract', 'internship'];
    const jobs = [];

    // Generate 100 diverse jobs
    for (let i = 0; i < 100; i++) {
      const template = jobTemplates[i % jobTemplates.length];
      const company = createdCompanies[i % createdCompanies.length];
      const jobType = jobTypes[i % jobTypes.length];
      const isRemote = Math.random() > 0.6;

      jobs.push({
        company_id: company.id,
        title: `${template.title} ${i > 9 ? `(${Math.floor(i / 10)})` : ''}`,
        description: template.description,
        category: template.category,
        job_type: jobType,
        target_user_types: template.user_types,
        skills_required: template.skills,
        location: isRemote ? 'Remote' : company.location,
        salary_range: jobType === 'internship' ? '$800-1200/mo' : '$2500-4500/mo',
        is_remote: isRemote,
        is_active: true,
        created_by: user.id,
      });
    }

    // Insert jobs in batches of 20
    let totalCreated = 0;
    for (let i = 0; i < jobs.length; i += 20) {
      const batch = jobs.slice(i, i + 20);
      const { data, error } = await supabase
        .from('job_listings_v2')
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error inserting batch ${i / 20}:`, error);
      } else {
        totalCreated += data.length;
        console.log(`Inserted batch ${i / 20 + 1}: ${data.length} jobs`);
      }
    }

    console.log(`Seeding complete. Created ${totalCreated} jobs`);

    return new Response(
      JSON.stringify({
        success: true,
        companies: createdCompanies.length,
        jobs: totalCreated,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in seed-demo-jobs:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
