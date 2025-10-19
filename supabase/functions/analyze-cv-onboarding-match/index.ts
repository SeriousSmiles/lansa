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
    const { cvData, onboardingData, userId } = await req.json();

    console.log('Analyzing CV vs Onboarding match for user:', userId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's onboarding answers and goal
    const [answersResult, goalResult] = await Promise.all([
      supabase.from('user_answers').select('*').eq('user_id', userId).single(),
      supabase.from('user_90day_goal').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single()
    ]);

    const userAnswers = answersResult.data;
    const userGoal = goalResult.data;

    // Prepare AI prompt for match analysis
    const aiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!aiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert career counselor analyzing alignment between a person's CV and their stated career goals.

Your task is to:
1. Compare CV skills with onboarding skill input
2. Analyze if CV experience aligns with their 90-day goal
3. Check if education/experience matches their stated academic status and career path
4. Identify strengths and gaps
5. Provide actionable recommendations

Return a JSON object with this structure:
{
  "alignmentScore": 0-100,
  "skillAlignment": {
    "score": 0-100,
    "matches": ["skill1", "skill2"],
    "missing": ["skill3", "skill4"],
    "insight": "Brief analysis"
  },
  "goalAlignment": {
    "score": 0-100,
    "supports": ["How CV supports goal"],
    "gaps": ["What's missing for the goal"],
    "insight": "Brief analysis"
  },
  "experienceAlignment": {
    "score": 0-100,
    "relevant": ["Relevant experiences"],
    "stretches": ["Where they may be stretching"],
    "insight": "Brief analysis"
  },
  "recommendations": ["Action 1", "Action 2", "Action 3"],
  "summary": "2-3 sentence overall assessment"
}`;

    const userPrompt = `CV Data:
- Skills: ${cvData.skills?.join(', ') || 'None listed'}
- Title: ${cvData.title || 'Not specified'}
- Summary: ${cvData.summary || 'Not provided'}
- Experience: ${cvData.experience?.map((e: any) => `${e.title} at ${e.company} (${e.duration})`).join('; ') || 'None listed'}
- Education: ${cvData.education?.map((e: any) => `${e.degree} from ${e.institution}`).join('; ') || 'None listed'}

Onboarding Data:
- Stated Skill: ${onboardingData.skillInput || userAnswers?.onboarding_inputs?.skill || 'Not provided'}
- 90-Day Goal: ${onboardingData.goalInput || userGoal?.goal_statement || 'Not provided'}
- Academic Status: ${userAnswers?.onboarding_inputs?.academicStatus || 'Not provided'}
- Career Intention: ${userAnswers?.onboarding_inputs?.careerIntention || 'Not provided'}
- Desired Outcome: ${userAnswers?.desired_outcome || 'Not provided'}

Analyze the alignment and provide the JSON response.`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`AI analysis failed: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const analysisResult = JSON.parse(aiData.choices[0].message.content);

    console.log('Match analysis complete:', analysisResult);

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in analyze-cv-onboarding-match:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to analyze CV alignment',
        alignmentScore: 0,
        summary: 'Unable to complete analysis. Please try again.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
