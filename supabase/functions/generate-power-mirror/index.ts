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

    const prompt = `You are Marcus, a seasoned hiring manager with 15+ years of experience. Your mindset: "I can quickly spot potential in candidates by how they think about work and value creation."

CRITICAL INSTRUCTION: You must ONLY reference what this specific student actually wrote. Do NOT use generic statements. If they didn't provide something, say "not provided" - do not hallucinate content.

STUDENT'S ACTUAL RESPONSES:
- Academic Status: ${demographics?.academic_status || 'Not provided'}
- Field of Study: ${demographics?.field_of_study || 'Not provided'}
- Career Goal: ${demographics?.career_goal_type || 'Not provided'}
- Their Value Skill Statement: "${skillReframe || 'Not provided'}"
- Their 90-Day Goal: "${goalStatement || 'Not provided'}"

YOUR HIRING MANAGER PERSPECTIVE:
"When I review these responses, I'm looking for signs of business thinking, initiative, and self-awareness. Let me tell you what I see when I read what this student actually wrote..."

RESPONSE REQUIREMENTS:
1. Reference their EXACT words and responses
2. Interpret what their specific answers reveal about their mindset
3. Focus on what hiring managers would actually notice in these responses
4. Be authentic - point out both strengths and areas for growth
5. Ground every insight in what they actually provided

CRITICAL: Base your analysis ONLY on their actual responses. If something is "Not provided", acknowledge that gap honestly.

Respond with JSON:
{
  "mirror_message": "What I see when I read what YOU specifically wrote: [reference their actual words/responses]",
  "key_strengths": ["strength1 based on their actual response", "strength2 from what they wrote", "strength3 from their specific input"],
  "employer_perspective": "Here's what your specific answers tell me about your readiness: [reference their actual responses]",
  "next_level_hint": "Based on what you shared, here's one way to strengthen your profile: [specific to their situation]"
}

EXAMPLES of grounded responses:
- "Your 90-day goal of 'help reduce customer complaints' shows you're thinking about business impact, not just task completion."
- "When you said '[exact quote]', that tells me you understand [specific insight based on their words]."
- "The fact that you chose to highlight '[their skill]' suggests you understand [interpretation based on their choice]."

Remember: Every insight must be traceable to something they actually wrote. No generic hiring advice.`;

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
      console.error('Parse error details:', parseError);
      // Create a fallback that references their actual input
      const actualSkill = skillReframe || 'your skill input';
      const actualGoal = goalStatement || 'your 90-day goal';
      mirror = {
        mirror_message: `Based on what you shared - your focus on "${actualSkill}" and your goal of "${actualGoal}" - you're demonstrating business thinking and initiative.`,
        key_strengths: ["References actual value creation", "Shows forward planning", "Demonstrates business awareness"],
        employer_perspective: `Your specific responses show you understand that work is about creating impact. The combination of your skill focus and 90-day planning tells me you think strategically.`,
        next_level_hint: "Add more specific details about the outcomes you want to achieve to make your vision even clearer."
      };
    }

    return new Response(JSON.stringify({ mirror }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-power-mirror:', error);
    // Create error fallback that still references their input when possible
    const skillRef = (req.body && JSON.parse(req.body)?.skillReframe) || 'your value-focused thinking';
    const goalRef = (req.body && JSON.parse(req.body)?.goalStatement) || 'your forward-planning mindset';
    
    return new Response(JSON.stringify({ 
      error: error.message,
      mirror: {
        mirror_message: `Even with this technical hiccup, I can see from your focus on "${skillRef}" that you're thinking about creating value - that's exactly what employers want to see!`,
        key_strengths: ["Value-focused approach", "Shows business thinking", "Demonstrates initiative"],
        employer_perspective: "The fact that you're working on articulating your value and setting goals shows maturity and business awareness.",
        next_level_hint: "Once we're back online, we'll dive deeper into making your unique value even more compelling!"
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});