import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildFallbackSummary(candidate: any, employer: any): string {
  const name = candidate?.name || 'This candidate';
  const skills = candidate?.skills?.slice(0, 3).join(', ') || 'relevant skills';
  const industry = employer?.industry || 'your industry';
  const certified = candidate?.lansa_certified ? ' As a Lansa Certified professional, they bring verified expertise.' : '';
  return `${name} brings ${skills} that align well with ${industry}.${certified} Their profile and goals make them a strong potential fit for your team.`;
}



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
Education Background: ${candidateProfile.academic_status || 'Not specified'} — Field: ${candidateProfile.major || 'Not specified'}
Work Experience: ${candidateProfile.work_experience_years || 'Not specified'}
Current Industry: ${candidateProfile.current_industry || 'Not specified'}
Career Intention: ${candidateProfile.career_intention_professional || candidateProfile.career_goal_type || 'Not specified'}
Still Studying: ${candidateProfile.still_studying ? 'Yes — currently in education' : 'No'}
`;

    const systemPrompt = `You are a professional recruitment AI analyzing candidate-employer compatibility. Generate a concise, personalized 2-3 sentence summary explaining why this candidate could be a great match for the employer's needs.

Focus on:
- Skills alignment with employer's industry
- Relevant experience, education background, and professional goals
- Location compatibility (if relevant)
- Certification strength (high score = highly qualified professional)
- Career intentions and aspirations matching employer needs
- Education-to-career progression and growth trajectory

Also classify the match tier as one of:
- "Promising" — strong skills alignment, relevant experience/education, clear career goals matching employer needs
- "Good" — solid foundation but not as strong a match, some gaps but coachable and motivated
- "Medium" — some risks or misalignment, but potential with mentoring and coaching

DO NOT reveal specific certification answers, assessment details, or any private information.
Keep it professional, positive, and action-oriented.
Write in second person addressing the employer (e.g., "This candidate's skills in...")

Return ONLY valid JSON in this exact format:
{"summary": "your 2-3 sentence summary here", "match_tier": "Promising"}`;

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
      // For 5xx gateway errors, return a graceful fallback instead of crashing
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      const fallbackSummary = buildFallbackSummary(candidateProfile, businessProfile);
      return new Response(
        JSON.stringify({ summary: fallbackSummary, match_tier: 'Good' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || '';
    
    let summary = 'Unable to generate summary';
    let match_tier: 'Promising' | 'Good' | 'Medium' = 'Good';
    
    try {
      const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      summary = parsed.summary || summary;
      if (['Promising', 'Good', 'Medium'].includes(parsed.match_tier)) {
        match_tier = parsed.match_tier;
      }
    } catch {
      // Fallback: use raw content as summary if JSON parse fails
      summary = rawContent || buildFallbackSummary(candidateProfile, businessProfile);
    }

    console.log('Match summary generated successfully, tier:', match_tier);

    return new Response(
      JSON.stringify({ summary, match_tier }),
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
