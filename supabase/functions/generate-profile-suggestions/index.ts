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

type SuggestionExperience = {
  title: string;
  description: string;
  startYear?: number;
  endYear?: number | null;
};

type SuggestionEducation = {
  title: string;
  description: string;
  startYear?: number;
  endYear?: number | null;
};

type Suggestions = {
  title: string;
  about: string;
  skills: string[];
  experiences: SuggestionExperience[];
  education: SuggestionEducation[];
  prompt_version: string;
};

async function getComprehensiveUserContext(supabase: any, userId: string) {
  console.log('Fetching comprehensive user context for:', userId);
  
  const [answersResult, profileResult] = await Promise.all([
    supabase.from('user_answers').select('*').eq('user_id', userId).single(),
    supabase.from('user_profiles').select('*').eq('user_id', userId).single()
  ]);

  return {
    answers: answersResult.data || {},
    profile: profileResult.data || {},
    hasExistingData: Boolean(profileResult.data?.title || profileResult.data?.about_text)
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

    const { answers, userId } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let userContext = { answers: answers || {}, profile: {}, hasExistingData: false };
    
    // Get comprehensive context if userId provided
    if (userId) {
      userContext = await getComprehensiveUserContext(supabase, userId);
    }

    const system = `You are Maya, a senior career strategist specializing in authentic personal branding for early-career professionals.

EXPERTISE: Creating compelling profiles that authentically represent each person's unique value proposition.
MINDSET: "Every person has a distinctive story - my job is to help them tell it in a way that resonates with their target audience."

USER PROFILE CONTEXT:
- Identity: ${userContext.answers.identity || 'Not specified'}
- Desired Outcome: ${userContext.answers.desired_outcome || 'Not specified'}
- Academic Status: ${userContext.answers.academic_status || 'Not specified'}
- Field of Study: ${userContext.answers.field_of_study || 'Not specified'}
- Career Goal Type: ${userContext.answers.career_goal_type || 'Not specified'}
- User Type: ${userContext.answers.user_type || 'Not specified'}
- Current Profile: ${userContext.hasExistingData ? 'Has existing content' : 'Starting fresh'}

PERSONALIZATION INSTRUCTIONS:
1. Reference their actual field of study and career goals
2. Align with their academic status (e.g., current student vs. recent graduate)
3. Match the tone to their desired outcome (job seeking vs. networking vs. career change)
4. Include industry-relevant skills and terminology
5. Create experiences that build toward their specific career goal type

Output ONLY valid JSON following this exact schema:
{
  "title": "Professional headline (8-12 words, role-focused, includes their field/specialization)",
  "about": "First-person narrative (80-120 words) that tells their authentic story from current status to career aspirations",
  "skills": ["Technical skill 1", "Professional skill 2", "Industry skill 3", "Soft skill 4", "Domain skill 5"],
  "experiences": [
    {
      "title": "Role/Project Title",
      "description": "Achievement-focused description (40-60 words) with specific outcomes",
      "startYear": 2023,
      "endYear": null
    }
  ],
  "education": [
    {
      "title": "Degree/Program Title",
      "description": "Value-focused description highlighting relevant coursework, projects, or achievements",
      "startYear": 2021,
      "endYear": 2024
    }
  ],
  "prompt_version": "v3_expert_maya"
}

CRITICAL: Every suggestion must feel authentic to their specific background and goals. Avoid generic templates.`;

    const userText = Object.entries(userContext.answers || {})
      .filter(([k, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    console.log('Processing profile suggestions with enhanced context');

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userText || "User provided minimal info. Create compelling professional defaults suitable for early-career professional." },
        ],
        max_completion_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errTxt = await response.text();
      console.error("OpenAI error:", errTxt);
      return new Response(
        JSON.stringify({ error: "OpenAI request failed", details: errTxt }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let suggestions: Suggestions;
    try {
      suggestions = typeof content === "string" ? JSON.parse(content) : content;
      
      // Validate the response has all required fields
      if (!suggestions.title || !suggestions.about || !suggestions.skills || !Array.isArray(suggestions.skills)) {
        throw new Error("Invalid AI response structure");
      }
    } catch (error) {
      console.error("Failed to parse AI response:", error, "Content:", content);
      
      // Enhanced fallback based on user context
      const identity = userContext.answers.identity || 'Professional';
      const field = userContext.answers.field_of_study || 'Business';
      
      suggestions = {
        title: `${identity} in ${field} | Focused on Growth & Impact`,
        about: `I'm a motivated ${identity.toLowerCase()} with a passion for ${field.toLowerCase()} and creating meaningful impact. Through my academic journey and hands-on experience, I've developed strong analytical and communication skills. I'm eager to apply my knowledge in a dynamic environment where I can contribute to innovative projects while continuing to learn and grow professionally.`,
        skills: ["Critical Thinking", "Communication", "Project Management", "Data Analysis", "Collaboration"],
        experiences: [
          { title: "Academic Projects", description: "Led multiple team-based projects, applying theoretical knowledge to solve real-world challenges and delivering presentations to diverse audiences.", startYear: 2023, endYear: null },
        ],
        education: [
          { title: `${field} Studies`, description: "Focused coursework in core principles with emphasis on practical application and analytical thinking.", startYear: 2021, endYear: 2024 },
        ],
        prompt_version: "v3_expert_maya",
      };
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("generate-profile-suggestions error:", error);
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});