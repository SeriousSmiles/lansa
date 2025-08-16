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

    const prompt = `You are an expert career coach helping students understand how their 90-day goals appear to employers.

TASK: Analyze this student's 90-day goal and provide professional insight.

STUDENT INPUT: "${goalStatement}"

Respond with JSON:
{
  "interpretation": "How this goal appears to hiring managers (positive, encouraging)",
  "initiative_type": "One of: creative, operational, marketing, support, leadership, analytical",
  "clarity_level": "One of: very-clear, clear, somewhat-clear, needs-refinement",
  "strengths": "What this goal shows about the student's mindset",
  "employer_perspective": "What employers would think when they see this goal"
}

GUIDELINES:
- Be encouraging and constructive
- Focus on what the goal reveals about initiative and thinking
- If goal is vague, acknowledge effort while suggesting more specificity
- Emphasize growth mindset and business thinking

EXAMPLES:
"Help reduce customer complaints" → Shows problem awareness and customer focus
"Launch a TikTok campaign" → Shows creative thinking and willingness to take ownership
"Learn the company processes" → Shows thoroughness but could be more outcome-focused`;

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
      analysis = {
        interpretation: "You're thinking about specific outcomes and taking initiative - that's exactly what employers want to see!",
        initiative_type: "operational",
        clarity_level: "clear",
        strengths: "Shows forward-thinking and desire to contribute meaningfully",
        employer_perspective: "This person thinks about results and wants to make an impact from day one."
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-90day-goal:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: {
        interpretation: "You're showing initiative and forward-thinking - keep building on that!",
        initiative_type: "operational",
        clarity_level: "clear",
        strengths: "Shows desire to contribute and create value",
        employer_perspective: "This person is ready to contribute from day one."
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});