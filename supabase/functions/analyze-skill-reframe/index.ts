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
    const { skill } = await req.json();
    
    if (!skill || skill.trim().length === 0) {
      throw new Error('Skill input is required');
    }

    const openAIApiKey = Deno.env.get('ONBOARDING_AI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `You are an expert career coach helping students reframe their skills to show business value. 

TASK: Analyze this student's skill and provide a reframe that shows concrete business value.

STUDENT INPUT: "${skill}"

Please respond with a JSON object containing:
{
  "reframed_skill": "A clear statement of how this skill solves business problems",
  "business_value_type": "One of: time-saving, insight-generating, money-saving, quality-improving, risk-reducing",
  "ai_category": "The type of skill this represents (technical, analytical, creative, communication, etc.)",
  "encouragement": "Brief encouraging feedback about what this shows about the student"
}

GUIDELINES:
- Focus on outcomes and impact, not just activities
- Make it specific and measurable where possible
- Keep the tone professional but encouraging
- If input is vague, suggest a more specific version

EXAMPLES:
"I know Excel" → "I can automate expense tracking and create dashboards that save managers 2 hours weekly"
"I studied psychology" → "I can design surveys that get 40% higher response rates by understanding user motivation"
"I did a group project" → "I can coordinate team deliverables and keep projects on schedule using proven collaboration tools"`;

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
        reframed_skill: "I can apply what I've learned to solve real business challenges",
        business_value_type: "quality-improving",
        ai_category: "general",
        encouragement: "You're thinking about how your skills create value - that's exactly what employers want to see!"
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-skill-reframe:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: {
        reframed_skill: "I can apply my knowledge to create real business value",
        business_value_type: "quality-improving",
        ai_category: "general",
        encouragement: "Every skill has value - let's help you show it clearly!"
      }
    }), {
      status: 200, // Return 200 with fallback instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});