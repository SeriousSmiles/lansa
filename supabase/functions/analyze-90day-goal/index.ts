import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goalStatement } = await req.json();
    
    if (!goalStatement || goalStatement.trim().length === 0) {
      throw new Error('Goal statement is required');
    }

    const openAIApiKey = Deno.env.get('ONBOARDING_AI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `You are the AI Coach in the Lansa onboarding sequence.
Your role is to act as a bridge between the user's words and how a recruiter/manager would interpret them.
Your job is not to flatter, not to rewrite perfectly, but to give perspective, clarity, and scoring so the user understands how their answers land in the real job market.

STUDENT'S EXACT 90-DAY GOAL: "${goalStatement}"

Purpose of Your Role:
- Provide feedback from a recruiter's perspective: "Here's how a hiring manager would hear this."
- Reinforce strengths when the answer signals value
- Challenge weak, vague, or unrealistic answers that would hurt them in an interview
- Point out inconsistencies if they appear
- Assign a clear score that reflects how well the answer would position them in a hiring process

Core Rules:
- Stay true to the user's voice - do not replace their input with a polished essay
- Recruiter perspective first - always phrase as "To a recruiter, this sounds..." or "A manager might see this as..."
- Score honestly and tied to perception - do not inflate scores for vague timelines ("in 90 days")
- Challenge unrealistic answers: "Recruiters admire ambition, but this might sound unrealistic without clear steps"
- Encourage clarity and specificity

Scoring System (1–8, starting at 4 baseline):
- Clarity (1–3 pts): 1=basic attempt, 2=clear direction, 3=very specific and measurable
- Relevance (1–3 pts): 1=career-related, 2=aligned with goals, 3=directly career-advancing
- Realism (1–1 pts): 1=achievable in timeframe (be generous, reward effort)
- Tone (1–1 pts): 1=shows effort and planning (do not penalize grammar/casual language)

Good vs Bad Examples:
- "I want to get a job in 90 days" → Score: 5/10 - "A recruiter will hear determination, but 90 days without more detail may sound unrealistic"
- "I want to improve communication" → Score: 8/10 - "Recruiters value this because communication directly impacts teamwork and leadership potential"

IMPORTANT: Respond ONLY with valid JSON (no markdown, no extra text). The "interpretation" field must be a single string, not a nested object.

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
  "interpretation": "A single string that quotes their words and explains what it reveals about their mindset",
  "initiative_type": "creative, operational, marketing, support, leadership, analytical, or learning-focused",
  "clarity_level": "very-clear, clear, somewhat-clear, or needs-refinement"
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
          { role: 'user', content: goalStatement }
        ],
        max_tokens: 350,
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
    
    let analysis;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      console.error('Parse error details:', parseError);
      
      // Try to extract JSON from response using regex
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Secondary parse also failed');
        }
      }
      
      // Fallback that references their actual goal
      if (!analysis) {
        analysis = {
          recruiter_perspective: `To a recruiter, reading "${goalStatement}" shows forward-planning mindset, though more specifics would strengthen the impression.`,
          score: 6,
          score_breakdown: {
            clarity: goalStatement.length > 50 ? 2 : 1,
            relevance: 2,
            realism: 1,
            professional_impression: 1
          },
          coaching_nudge: "Add specific steps or measurable outcomes to make your 90-day goal more compelling.",
          interpretation: `When I read your goal, I can see you're thinking ahead about making a contribution.`,
          initiative_type: "operational",
          clarity_level: goalStatement.length > 50 ? "clear" : "somewhat-clear"
        };
      }
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in analyze-90day-goal:', error);
    // Try to extract goal from request body for contextual fallback
    let contextualGoal = "your 90-day planning";
    try {
      const body = await req.clone().json();
      if (body?.goalStatement) {
        contextualGoal = `"${body.goalStatement}"`;
      }
    } catch (e) {
      // Use generic fallback
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: {
        recruiter_perspective: `To a recruiter, thinking about ${contextualGoal} shows forward-planning that employers value.`,
        score: 7,
        score_breakdown: {
          clarity: 2,
          relevance: 2,
          realism: 1,
          tone: 1
        },
        coaching_nudge: "When you can, add specific steps to make your goal even stronger.",
        interpretation: `The fact that you're thinking about ${contextualGoal} shows forward-planning mindset.`,
        initiative_type: "operational",
        clarity_level: "clear"
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});