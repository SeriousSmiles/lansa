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

    const prompt = `You are Sarah, an experienced hiring manager who specializes in evaluating entry-level talent. Your mindset: "I can tell a lot about someone's potential by how they think about their first 90 days."

CRITICAL REQUIREMENT: You must analyze ONLY what this student actually wrote. Quote their exact words and interpret what those specific words reveal. Do NOT add context they didn't provide or make assumptions.

STUDENT'S EXACT 90-DAY GOAL: "${goalStatement}"

YOUR HIRING MANAGER ANALYSIS:
"When I read this specific goal, here's what it tells me about this candidate's thinking and readiness..."

ANALYSIS FRAMEWORK:
1. Quote their exact words in your interpretation
2. Explain what their specific language choices reveal about their mindset
3. Identify the type of initiative this represents based on what they wrote
4. Assess clarity based on how specific they were
5. Translate what this means from a hiring manager's perspective

CRITICAL: Reference their EXACT goal statement in your response. If it's vague, explain what the vagueness tells you. If it's specific, highlight what the specificity reveals.

Respond with JSON:
{
  "interpretation": "When I read '[quote their exact words]', here's what I see as a hiring manager: [specific interpretation]",
  "initiative_type": "One of: creative, operational, marketing, support, leadership, analytical, learning-focused",
  "clarity_level": "One of: very-clear, clear, somewhat-clear, needs-refinement",
  "strengths": "Based on what they wrote specifically, this shows: [concrete analysis]",
  "employer_perspective": "As a hiring manager reading '[quote their goal]', I think: [realistic perspective]"
}

ANALYSIS PRINCIPLES:
- Vague goals → "Shows they're thinking ahead but need help with specificity"
- Outcome-focused goals → "Demonstrates business thinking and results orientation"
- Learning-focused goals → "Shows growth mindset but may need guidance on impact"
- Specific action goals → "Reveals someone who thinks concretely about contribution"

Remember: Every insight must be traceable to their actual words. Quote them directly and explain what those specific words reveal about their thinking.`;

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
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      console.error('Parse error details:', parseError);
      // Create fallback that references their actual goal
      analysis = {
        interpretation: `When I read your goal of "${goalStatement}", I can see you're thinking ahead about making a contribution - that forward-planning mindset is valuable to employers.`,
        initiative_type: "operational",
        clarity_level: goalStatement.length > 50 ? "clear" : "somewhat-clear",
        strengths: `Your specific goal shows you're not just thinking about what you'll learn, but about what you can contribute.`,
        employer_perspective: `Reading "${goalStatement}" tells me this person is thinking beyond themselves to organizational impact.`
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
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
        interpretation: `Even though we're having technical issues, the fact that you're thinking about ${contextualGoal} shows forward-planning that employers value.`,
        initiative_type: "operational", 
        clarity_level: "clear",
        strengths: "Demonstrates forward-thinking and goal-oriented mindset",
        employer_perspective: "This person takes initiative and thinks about contribution, not just personal learning."
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});