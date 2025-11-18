import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
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

    const { employerId, candidateProfile } = await req.json();

    if (!employerId || !candidateProfile) {
      return new Response(
        JSON.stringify({ error: 'employerId and candidateProfile are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating match summary for employer ${employerId} and candidate ${candidateProfile.user_id}`);

    // Fetch employer's organization profile
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('company_name, industry, description, location')
      .eq('user_id', employerId)
      .single();

    // Get candidate's certification score if available
    const { data: certData } = await supabase
      .from('user_certifications')
      .select('assessment_score, lansa_certified')
      .eq('user_id', candidateProfile.user_id)
      .single();

    // Build context for AI
    const employerContext = businessProfile ? `
Employer: ${businessProfile.company_name || 'Company'}
Industry: ${businessProfile.industry || 'Not specified'}
Description: ${businessProfile.description || 'No description'}
Location: ${businessProfile.location || 'Not specified'}
` : 'Employer information not available';

    const candidateContext = `
Candidate: ${candidateProfile.name || 'Professional'}
Title: ${candidateProfile.title || 'Seeking opportunities'}
Location: ${candidateProfile.location || 'Not specified'}
Skills: ${candidateProfile.skills?.join(', ') || 'None listed'}
Experience: ${candidateProfile.experiences?.map((exp: any) => exp.title).join(', ') || 'Not specified'}
Professional Goal: ${candidateProfile.professional_goal || 'Not specified'}
Certification: ${certData?.lansa_certified ? `Lansa Certified (Score: ${certData.assessment_score || 'N/A'})` : 'Not certified'}
About: ${candidateProfile.about_text?.slice(0, 300) || 'No description'}
`;

    const systemPrompt = `You are a professional recruitment AI analyzing candidate-employer compatibility. Generate a concise, personalized 2-3 sentence summary explaining why this candidate could be a great match for the employer's needs.

Focus on:
- Skills alignment with employer's industry
- Relevant experience and professional goals
- Location compatibility (if relevant)
- Certification strength (high score = highly qualified professional)
- Professional aspirations matching employer needs

DO NOT reveal specific certification answers, assessment details, or any private information.
Keep it professional, positive, and action-oriented.
Write in second person addressing the employer (e.g., "This candidate's skills in...")`;

    const userPrompt = `${employerContext}

${candidateContext}

Generate a 2-3 sentence match summary explaining why this candidate is a good fit for this employer.`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted. Please add funds to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('AI gateway error');
    }

    const aiData = await aiResponse.json();
    const summary = aiData.choices?.[0]?.message?.content || 'Unable to generate summary';

    console.log('Match summary generated successfully');

    return new Response(
      JSON.stringify({ summary }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-match-summary:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
