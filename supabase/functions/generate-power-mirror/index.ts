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

YOUR HIRING MANAGER MINDSET:
"When I read these responses, I'm evaluating this student's readiness and potential. Let me break down what their ACTUAL answers reveal about their thinking..."

RESPONSE REQUIREMENTS:
1. Quote their EXACT words and analyze what those words reveal
2. Show what those specific responses indicate about their mindset/readiness
3. Focus on INTERPRETATION of their answers, not improvement suggestions
4. Use "This student shows..." or "This indicates..." language
5. Ground every insight in their actual provided content

CRITICAL: You are INTERPRETING their responses as a manager would, not giving them advice. Show what their answers reveal about their potential.

Respond with JSON:
{
  "mirror_message": "When I read what you wrote: '[quote their exact words]', here's what this tells me about you as a candidate: [manager interpretation]",
  "key_strengths": ["This student demonstrates [trait] because they said '[quote]'", "Their response shows [characteristic] when they wrote '[quote]'", "I see [quality] in how they articulated '[quote]'"],
  "employer_perspective": "As a hiring manager reading '[quote their skill/goal]', this student shows [trait/readiness level] which indicates [potential/concern] for our company.",
  "next_level_hint": "What I'm not seeing yet that would strengthen my confidence: [specific gap based on their current responses]"
}

INTERPRETATION EXAMPLES (what managers actually think):
- "Their goal of '[exact quote]' shows this student thinks beyond personal learning to business outcomes."
- "When they described their skill as '[exact quote]', this indicates they understand value creation, not just task completion."
- "The way they articulated '[exact quote]' reveals strategic thinking and business awareness."
- "This response tells me this student lacks specificity in their thinking, which could indicate..."

Remember: You're showing what their responses REVEAL about them, not suggesting improvements. Quote their exact words and interpret what those words indicate about their potential.`;

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