import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // JWT auth check — prevent unauthenticated AI credit consumption
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { skill } = await req.json();
    
    if (!skill || skill.trim().length === 0) {
      throw new Error('Skill input is required');
    }

    const openAIApiKey = Deno.env.get('ONBOARDING_AI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `You are the AI Coach in the Lansa onboarding sequence.
Your role is to act as a bridge between the user's words and how a recruiter/manager would interpret them.
Your job is not to flatter, not to rewrite perfectly, but to give perspective, clarity, and scoring so the user understands how their answers land in the real job market.

STUDENT INPUT: "${skill}"

Purpose of Your Role:
- Provide feedback from a recruiter's perspective: "Here's how a hiring manager would hear this."
- Reinforce strengths when the answer signals value
- Challenge weak, vague, or unrealistic answers that would hurt them in an interview
- Assign a clear score that reflects how well the answer would position them in a hiring process

Core Rules:
- Stay true to the user's voice - do not replace their input with a polished essay
- Recruiter perspective first - always phrase as "To a recruiter, this sounds..." 
- Score honestly and tied to perception - do not inflate scores for vague answers
- Challenge unrealistic answers respectfully but firmly
- Encourage clarity and specificity

Scoring System (1–10, starting at 4 baseline):
- Clarity (1–3 pts): 1=basic attempt, 2=clear enough, 3=very clear and specific
- Relevance (1–3 pts): 1=shows some connection, 2=mostly relevant, 3=highly relevant
- Realism (1–1 pts): 1=achievable and realistic
- Tone (1–1 pts): 1=shows effort and positive intent (do not penalize grammar/spelling)

Respond with JSON:
{
  "recruiter_perspective": "To a recruiter, this sounds...",
  "score": 0-10,
  "score_breakdown": {
    "clarity": 0-3,
    "relevance": 0-3, 
    "realism": 0-2,
    "professional_impression": 0-2
  },
  "coaching_nudge": "One sentence suggesting how to improve",
  "reframed_skill": "Slight refinement keeping their voice intact",
  "business_value_type": "time-saving, insight-generating, money-saving, quality-improving, or risk-reducing"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: skill }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const content = data.choices[0].message.content;
    console.log('AI response:', content);
    
    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback response
      analysis = {
        recruiter_perspective: "To a recruiter, this shows you're thinking about creating value, though more specifics would strengthen your message.",
        score: 6,
        score_breakdown: {
          clarity: 2,
          relevance: 2,
          realism: 2,
          professional_impression: 1
        },
        coaching_nudge: "Add specific examples or measurable outcomes to make your value proposition stronger.",
        reframed_skill: "I can apply what I've learned to solve real business challenges",
        business_value_type: "quality-improving"
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    } catch (error: any) {
      console.error('Error in analyze-skill-reframe:', error);
      return new Response(JSON.stringify({
        error: error.message,
      analysis: {
        recruiter_perspective: "To a recruiter, this shows initiative in thinking about value creation.",
        score: 5,
    score_breakdown: {
      clarity: 2,
      relevance: 2,
      realism: 1,
      tone: 1
    },
        coaching_nudge: "Be more specific about what value you can create and how.",
        reframed_skill: "I can apply my knowledge to create real business value",
        business_value_type: "quality-improving"
      }
    }), {
      status: 200, // Return 200 with fallback instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});