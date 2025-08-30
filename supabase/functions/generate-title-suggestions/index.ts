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

    const { userId, currentTitle, userAnswers, profile } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let context = { answers: userAnswers || {}, profile: profile || {} };
    
    // Get comprehensive context if userId provided
    if (userId) {
      context = await getUserContext(supabase, userId);
    }

    const system = `You are Marcus, a LinkedIn headline optimization expert specializing in early-career professionals and students.

EXPERTISE: Creating headlines that capture attention from recruiters and hiring managers while staying authentic to the person's current stage and aspirations.
PHILOSOPHY: "Your headline should open doors, not oversell - be confident but authentic."

USER CONTEXT:
- Identity: ${context.answers.identity || 'Not specified'}
- Field of Study: ${context.answers.field_of_study || 'Not specified'}
- Academic Status: ${context.answers.academic_status || 'Not specified'}
- Career Goal: ${context.answers.career_goal_type || 'Not specified'}
- Desired Outcome: ${context.answers.desired_outcome || 'Not specified'}
- Current Title: ${currentTitle || 'None set'}

HEADLINE STRATEGY:
Generate 3 distinct headline variations that feel authentic to their current stage:

1. CONSERVATIVE: Professional, safe for traditional industries, emphasizes education/status
2. BALANCED: Modern but professional, shows personality while staying credible
3. BOLD: Confident, memorable, positions them as someone to watch

Each headline should:
- Be 8-15 words maximum
- Include their field/area of focus
- Reference relevant skills or value they bring
- Match their actual experience level (don't oversell)
- Include keywords relevant to their target roles

Return ONLY valid JSON:
{
  "suggestions": [
    {
      "type": "conservative",
      "title": "Professional headline focusing on education and field",
      "reasoning": "Why this approach works for traditional/corporate environments"
    },
    {
      "type": "balanced", 
      "title": "Modern professional headline with personality",
      "reasoning": "Why this strikes the right balance for most situations"
    },
    {
      "type": "bold",
      "title": "Confident headline that stands out",
      "reasoning": "Why this helps them get noticed in competitive fields"
    }
  ]
}`;

    const userContext = `
Field of Study: ${context.answers.field_of_study || 'Not specified'}
Academic Status: ${context.answers.academic_status || 'Not specified'}
Career Goals: ${context.answers.career_goal_type || 'Not specified'}
Identity: ${context.answers.identity || 'Not specified'}
Professional Goal: ${context.profile.professional_goal || 'Not specified'}
Current Skills: ${context.profile.skills?.join(', ') || 'Not specified'}
    `.trim();

    console.log('Generating expert title suggestions');

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
        max_completion_tokens: 600,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate suggestions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    let result;
    try {
      result = JSON.parse(data.choices[0].message.content);
      
      // Validate response structure
      if (!result.suggestions || !Array.isArray(result.suggestions) || result.suggestions.length !== 3) {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      
      // Enhanced fallback based on user context
      const field = context.answers.field_of_study || 'Business';
      const identity = context.answers.identity || 'Student';
      
      result = {
        suggestions: [
          {
            type: "conservative",
            title: `${field} ${identity} | Academic Excellence & Professional Growth`,
            reasoning: "Emphasizes educational foundation and commitment to professional development"
          },
          {
            type: "balanced",
            title: `${field} ${identity} | Future Leader in Innovation & Impact`,
            reasoning: "Shows ambition while staying grounded in current academic status"
          },
          {
            type: "bold",
            title: `${field} Professional | Transforming Ideas into Results`,
            reasoning: "Positions as results-focused while maintaining authenticity"
          }
        ]
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Title suggestions error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});