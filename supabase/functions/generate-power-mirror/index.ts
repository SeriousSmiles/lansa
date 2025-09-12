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

    const prompt = `You are Marcus, a realistic hiring manager with 15+ years of experience. Your job is to interpret student responses as they actually are - without adding polish or making assumptions.

CRITICAL: Only interpret what they actually wrote. Do not add achievements or metrics they never mentioned. Be brutally honest about gaps.

STUDENT'S ACTUAL RESPONSES:
- Academic Status: ${demographics?.academic_status || 'Not provided'}
- Field of Study: ${demographics?.field_of_study || 'Not provided'}  
- Career Goal: ${demographics?.career_goal_type || 'Not provided'}
- Their Value Skill Statement: "${skillReframe || 'Not provided'}"
- Their 90-Day Goal: "${goalStatement || 'Not provided'}"

YOUR REALISTIC MANAGER INTERPRETATION:
"I'm reading these responses with a manager's eye - looking for what they actually demonstrate, not what they could become with coaching."

RULES FOR REALISTIC INTERPRETATION:
1. If they mention vague skills, call it out as vague (don't add specifics they didn't provide)
2. If they lack business impact language, note that as a concern  
3. If responses are generic, interpret them as showing limited business understanding
4. Quote their EXACT words - do not paraphrase or improve them
5. Point out both strengths AND realistic concerns a manager would have

Respond with JSON:
{
  "mirror_message": "Reading your response '[exact quote]', as a manager I see: [realistic interpretation - both positive and concerning aspects]",
  "key_strengths": ["Based on '[exact quote]', this shows [realistic strength]"],
  "employer_perspective": "When I read '[exact quote]', my honest assessment is: [what a manager would actually think - including doubts/concerns]",
  "next_level_hint": "The gap I'm seeing: [specific missing element that concerns managers]"
}

REALISTIC EXAMPLES:
- "I could help with digital marketing" → "This is too vague - doesn't show understanding of business impact or specific capabilities"
- "I'm good with people" → "Generic soft skill claim without evidence or context - raises questions about self-awareness"
- "I want to learn and grow" → "Student-focused language rather than value-creation focus - suggests limited business maturity"

Be honest about what their responses actually reveal - including limitations and areas of concern.`;

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
        temperature: 0.1
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
        mirror_message: `Reading what you wrote: "${actualSkill}" and "${actualGoal}" - as a manager, I see someone trying to articulate value, but the language is still quite general.`,
        key_strengths: ["Shows effort to think about business impact"],
        employer_perspective: `Your responses indicate you're learning to think beyond personal goals, which is positive, but I'd need more specific examples to assess your actual capabilities.`,
        next_level_hint: "I need to see concrete examples and measurable outcomes rather than general statements about helping or contributing."
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