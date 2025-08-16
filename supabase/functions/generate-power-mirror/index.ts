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
    const { skillReframe, goalStatement, demographics } = await req.json();

    const openAIApiKey = Deno.env.get('ONBOARDING_AI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `You are a hiring manager giving feedback to a student about how their responses appear to employers.

STUDENT PROFILE:
- Academic Status: ${demographics?.academic_status || 'Student'}
- Field of Study: ${demographics?.field_of_study || 'Not specified'}
- Career Goal: ${demographics?.career_goal_type || 'Not specified'}
- Value Skill: "${skillReframe || 'Not provided'}"
- 90-Day Goal: "${goalStatement || 'Not provided'}"

TASK: Create an encouraging "power mirror" - show them how employers would view their responses.

Respond with JSON:
{
  "mirror_message": "2-3 sentences about what their answers signal to hiring managers",
  "key_strengths": ["strength1", "strength2", "strength3"],
  "employer_perspective": "What this combination tells employers about their potential",
  "next_level_hint": "One actionable suggestion to make their profile even stronger"
}

TONE: Encouraging but honest. Focus on what they're doing RIGHT.

EXAMPLES OF GOOD MIRROR MESSAGES:
"You're showing initiative, problem awareness, and outcome-focused thinking. That combination is rare in entry-level candidates."
"Your answers show you understand that skills need to create value, not just exist. Plus you're thinking 90 days ahead - that's strategic thinking."
"You're demonstrating self-awareness and business thinking. Employers see someone ready to contribute, not just learn."`;

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
          { role: 'user', content: 'Generate the power mirror for this student.' }
        ],
        max_tokens: 400,
        temperature: 0.8
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const content = data.choices[0].message.content;
    console.log('AI response:', content);
    
    let mirror;
    try {
      mirror = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      mirror = {
        mirror_message: "You're showing initiative, problem awareness, and forward-thinking. That's exactly what employers want to see in new hires!",
        key_strengths: ["Initiative", "Business thinking", "Growth mindset"],
        employer_perspective: "This person is ready to contribute value from day one and thinks beyond just completing tasks.",
        next_level_hint: "Add specific metrics or examples to make your value statements even more compelling."
      };
    }

    return new Response(JSON.stringify({ mirror }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-power-mirror:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      mirror: {
        mirror_message: "You're thinking like someone who wants to create value - that's the foundation of career success!",
        key_strengths: ["Value-focused thinking", "Initiative", "Growth mindset"],
        employer_perspective: "This person understands that work is about creating impact, not just completing tasks.",
        next_level_hint: "Keep building on this foundation - you're on the right track!"
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});