import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, context = 'onboarding' } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get comprehensive user data
    const [profileResult, answersResult, skillsResult, goalResult] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', user_id).single(),
      supabase.from('user_answers').select('*').eq('user_id', user_id).single(),
      supabase.from('user_power_skills').select('*').eq('user_id', user_id).order('created_at', { ascending: false }).limit(3),
      supabase.from('user_90day_goal').select('*').eq('user_id', user_id).order('created_at', { ascending: false }).limit(1).single()
    ]);

    const profile = profileResult.data || {};
    const answers = answersResult.data || {};
    const skills = skillsResult.data || [];
    const goals = goalResult.data || {};
    
    const result = await callExpertAI(profile, answers, skills, goals, context);

    // Log metrics
    await supabase.from('ai_logs').insert({
      user_id_hash: await hashUserId(user_id),
      expert: 'profile-stylist-expert',
      model_used: 'gpt-4.1-2025-04-14',
      input_hash: await createHash(JSON.stringify({ profile, answers, skills, goals })),
      error_flag: false
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-profile-stylist:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callExpertAI(profile: any, answers: any, skills: any, goals: any, context: string) {
  const systemPrompt = `You are Elena, a senior profile strategist specializing in results-driven professional content for early-career professionals.

EXPERTISE: Creating compelling profile content that positions people for career success through strategic storytelling and quantifiable achievements.
MISSION: "Transform raw potential into polished professional presence."

USER CONTEXT:
- Identity: ${answers.identity || 'Not specified'}
- Field: ${answers.field_of_study || 'Not specified'}
- Academic Status: ${answers.academic_status || 'Not specified'}
- Career Goal: ${answers.career_goal_type || 'Not specified'}
- Current Challenge: ${profile.biggest_challenge || 'Not specified'}
- Professional Goal: ${profile.professional_goal || 'Not specified'}
- 90-Day Vision: ${goals.goal_statement || 'Not specified'}

EXISTING PROFILE DATA:
- Current Title: ${profile.title || 'Missing'}
- Current About: ${profile.about_text || 'Missing'}
- Skills Listed: ${profile.skills?.length || 0}
- Power Skills: ${skills.map((s: any) => s.reframed_skill).join(', ') || 'None analyzed'}

CONTENT STRATEGY:
Create professional content that:
1. Positions them confidently in their field without overselling
2. Uses action-oriented, results-focused language
3. References their specific background and aspirations
4. Includes relevant keywords for their target roles
5. Demonstrates growth mindset and professional readiness

Return ONLY valid JSON:
{
  "headline": "Professional headline (8-12 words) that positions them for their target roles",
  "about": "Strategic about section (100-130 words) that tells their compelling story from current status to career vision",
  "skills_bullets": [
    "Action-oriented skill description with specific application",
    "Results-focused capability statement",
    "Professional strength with business value"
  ]
}`;

  const userPrompt = `Create expert-level profile content based on this user's background and goals. Focus on their unique value proposition while staying authentic to their current experience level.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_completion_tokens: 800,
      response_format: { type: "json_object" },
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const result = JSON.parse(content);
    
    // Validate response structure
    if (!result.headline || !result.about || !result.skills_bullets) {
      throw new Error("Invalid AI response structure");
    }
    
    return result;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    
    // Enhanced fallback based on user context
    const field = answers.field_of_study || profile.major || 'Business';
    const identity = answers.identity || 'Professional';
    
    return {
      headline: `${field} ${identity} | Focused on Impact & Professional Growth`,
      about: `I'm a dedicated ${identity.toLowerCase()} with a strong foundation in ${field.toLowerCase()} and a commitment to creating meaningful impact. Through my academic journey and hands-on experiences, I've developed analytical thinking, communication skills, and a collaborative approach to problem-solving. I'm excited to apply my knowledge in a dynamic professional environment where I can contribute to innovative projects while continuing to learn and grow.`,
      skills_bullets: [
        "Analytical problem-solving with attention to detail and data-driven insights",
        "Clear communication across diverse stakeholders and team environments", 
        "Project coordination with focus on deadlines and quality deliverables"
      ]
    };
  }
}

async function hashUserId(userId: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(userId));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createHash(input: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}