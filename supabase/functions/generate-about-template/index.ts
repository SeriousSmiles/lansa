import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function getUserContext(supabase: any, userId: string) {
  const [answersResult, profileResult] = await Promise.all([
    supabase.from('user_answers').select('*').eq('user_id', userId).single(),
    supabase.from('user_profiles').select('*').eq('user_id', userId).single()
  ]);

  return {
    answers: answersResult.data || {},
    profile: profileResult.data || {}
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userId, currentAbout, userAnswers, profile } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let context = { answers: userAnswers || {}, profile: profile || {} };
    
    // Get comprehensive context if userId provided
    if (userId) {
      context = await getUserContext(supabase, userId);
    }

    const system = `You are Sophia, a professional storytelling coach specializing in authentic personal branding for students and early-career professionals.

EXPERTISE: Helping people articulate their unique value proposition through compelling, authentic storytelling.
PHILOSOPHY: "Your story should feel genuine while strategically highlighting what makes you valuable to your target audience."

USER CONTEXT:
- Identity: ${context.answers.identity || 'Not specified'}
- Field of Study: ${context.answers.field_of_study || 'Not specified'}
- Academic Status: ${context.answers.academic_status || 'Not specified'}
- Career Goal: ${context.answers.career_goal_type || 'Not specified'}
- Desired Outcome: ${context.answers.desired_outcome || 'Not specified'}
- Professional Goal: ${context.profile.professional_goal || 'Not specified'}
- Biggest Challenge: ${context.profile.biggest_challenge || 'Not specified'}
- Current About: ${currentAbout || 'None set'}

ABOUT SECTION STRATEGY:
Create a personalized template that tells their authentic story in 3-4 sentences:
1. Current identity/status with field of focus
2. Key strengths, experiences, or achievements that demonstrate value
3. Future aspirations and how they align with their background
4. Call-to-action or personal touch that invites connection

The template should include strategic [PLACEHOLDER] elements they can customize.

Return ONLY valid JSON:
{
  "template": "First-person narrative template with [SPECIFIC PLACEHOLDERS] that matches their background and goals",
  "guidance": {
    "opening": "How to craft the opening that establishes their identity",
    "achievements": "How to highlight relevant experiences and strengths",
    "goals": "How to connect their background to future aspirations",
    "closing": "How to end with impact and invite engagement"
  },
  "questions": [
    "Specific question about their experiences",
    "Question about their proudest achievements",
    "Question about their career aspirations",
    "Question about what drives them in their field"
  ]
}`;

    const userContext = `
Field of Study: ${context.answers.field_of_study || 'Not specified'}
Academic Status: ${context.answers.academic_status || 'Not specified'}
Career Goals: ${context.answers.career_goal_type || 'Not specified'}
Identity: ${context.answers.identity || 'Not specified'}
Professional Goal: ${context.profile.professional_goal || 'Not specified'}
Biggest Challenge: ${context.profile.biggest_challenge || 'Not specified'}
Available Skills: ${context.profile.skills?.join(', ') || 'Not specified'}
Experience Count: ${context.profile.experiences?.length || 0} entries
Education Count: ${context.profile.education?.length || 0} entries
    `.trim();

    console.log('Generating expert about template');

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContext },
        ],
        max_completion_tokens: 700,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate template" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    let result;
    try {
      result = JSON.parse(data.choices[0].message.content);
      
      // Validate response structure
      if (!result.template || !result.guidance || !result.questions) {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      
      // Enhanced fallback based on user context
      const field = context.answers.field_of_study || 'my field';
      const identity = context.answers.identity || 'student';
      
      result = {
        template: `I'm a [CURRENT STATUS] studying ${field} with a passion for [SPECIFIC INTEREST/SPECIALIZATION]. Through my academic work and [RELEVANT EXPERIENCE], I've developed strong skills in [KEY SKILLS] and a deep appreciation for [WHAT DRIVES YOU]. I'm excited to apply my knowledge in [TARGET ENVIRONMENT] where I can [CONTRIBUTION YOU'LL MAKE] while continuing to grow as a professional in [FIELD/INDUSTRY].`,
        guidance: {
          opening: `Start by establishing yourself as a ${identity} in ${field}, showing confidence in your current path`,
          achievements: "Highlight specific coursework, projects, or experiences that demonstrate your capabilities",
          goals: "Connect your academic foundation to your professional aspirations",
          closing: "End with enthusiasm about contributing and learning in your target environment"
        },
        questions: [
          `What specific aspect of ${field} excites you most?`,
          "What project or achievement are you most proud of?",
          "What type of work environment do you thrive in?",
          "How do you want to make an impact in your future role?"
        ]
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("About template error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});