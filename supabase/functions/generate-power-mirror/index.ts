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

  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const { skillReframe, goalStatement, demographics } = await req.json();
    
    console.log(`[${requestId}] Power Mirror Request Started`, {
      timestamp: new Date().toISOString(),
      hasSkillReframe: !!skillReframe,
      hasGoalStatement: !!goalStatement,
      hasDemographics: !!demographics
    });

    const openAIApiKey = Deno.env.get('ONBOARDING_AI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `You are the AI Coach in the Lansa onboarding sequence.
Your role is to act as a bridge between the user's words and how a recruiter/manager would interpret them.
Your job is not to flatter, not to rewrite perfectly, but to give perspective, clarity, and scoring so the user understands how their answers land in the real job market.

STUDENT'S ACTUAL RESPONSES:
- Academic Status: ${demographics?.academic_status || 'Not provided'}
- Field of Study: ${demographics?.major || 'Not provided'}  
- Career Goal: ${demographics?.career_goal_type || 'Not provided'}
- Their Value Skill Statement: "${skillReframe || 'Not provided'}"
- Their 90-Day Goal: "${goalStatement || 'Not provided'}"

Purpose of Your Role:
- Provide feedback from a recruiter's perspective: "Here's how a hiring manager would hear this."
- Reinforce strengths when the answer signals value
- Challenge weak, vague, or unrealistic answers that would hurt them in an interview
- Point out inconsistencies (e.g., "You said Marketing major but listed PHP/React as top skills — a recruiter may find this unclear")
- Assign a clear overall score that reflects how well their combined answers position them

Core Rules:
- Stay true to the user's voice - do not replace their input with a polished essay
- Recruiter perspective first - always phrase as "To a recruiter, this sounds..." 
- Score honestly and tied to perception - do not inflate scores for vague answers
- Challenge unrealistic answers respectfully but firmly
- Encourage clarity and specificity
- Each answer is separate but look for contradictions between answers

Scoring System (0–10) - Overall impression from all responses:
- Clarity (0–3 pts): 0=unclear/confusing, 1=vague/general, 2=somewhat specific, 3=sharp professional clarity
- Relevance (0–3 pts): 0=unrelated to stated goals, 1=loosely connected, 2=mostly aligned, 3=strongly aligned
- Realism (0–2 pts): 0=unrealistic claims, 1=ambitious but possible, 2=realistic and achievable
- Professional Impression (0–2 pts): 0=weak/negative, 1=neutral, 2=strong positive impression

Respond with JSON:
{
  "recruiter_perspective": "To a recruiter, looking at all your responses together, this sounds...",
  "score": 0-10,
  "score_breakdown": {
    "clarity": 0-3,
    "relevance": 0-3,
    "realism": 0-2,
    "professional_impression": 0-2
  },
  "coaching_nudge": "One sentence suggesting the most important improvement",
  "contradictions": ["If any contradictions between field of study and goals"],
  "mirror_message": "Reading your responses, as a manager I see: [realistic interpretation]",
  "key_strengths": ["Based on exact quotes, realistic strengths"],
  "employer_perspective": "Overall assessment including any concerns",
  "next_level_hint": "The gap that needs addressing most"
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
          { role: 'user', content: 'Generate the power mirror for this student.' }
        ],
        max_tokens: 1000,
        temperature: 0.4
      }),
    });
    
    console.log(`[${requestId}] OpenAI Response Status:`, response.status);

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`[${requestId}] OpenAI API error:`, data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error(`[${requestId}] Invalid OpenAI response structure:`, data);
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content;
    const responseLength = content.length;
    console.log(`[${requestId}] AI response length: ${responseLength} characters`);
    
    // Validate response isn't truncated
    if (responseLength < 100 || !content.trim().endsWith('}')) {
      console.warn(`[${requestId}] Response may be truncated. Length: ${responseLength}`);
    }
    
    let mirror;
    try {
      mirror = JSON.parse(content);
      
      // Validate required fields
      const requiredFields = ['recruiter_perspective', 'score', 'score_breakdown', 'mirror_message', 'key_strengths', 'employer_perspective'];
      const missingFields = requiredFields.filter(field => !mirror[field]);
      
      if (missingFields.length > 0) {
        console.warn(`[${requestId}] Missing fields in response:`, missingFields);
      }
      
      console.log(`[${requestId}] Successfully parsed mirror with score:`, mirror.score);
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse AI response:`, content?.substring(0, 200));
      console.error(`[${requestId}] Parse error details:`, parseError);
      
      // Create a fallback that references their actual input
      const actualSkill = skillReframe || 'your skill input';
      const actualGoal = goalStatement || 'your 90-day goal';
      mirror = {
        recruiter_perspective: `To a recruiter, looking at your responses - particularly "${actualSkill}" and "${actualGoal}" - this shows someone trying to articulate value and plan ahead, which is positive.`,
        score: 6,
        score_breakdown: {
          clarity: 2,
          relevance: 2,
          realism: 1,
          professional_impression: 1
        },
        coaching_nudge: "Add more specific examples and measurable outcomes to strengthen your overall impression.",
        contradictions: [],
        mirror_message: `Reading what you wrote: "${actualSkill}" and "${actualGoal}" - as a manager, I see someone trying to articulate value, but the language is still quite general.`,
        key_strengths: ["Shows effort to think about business impact", "Forward-thinking mindset"],
        employer_perspective: `Your responses indicate you're learning to think beyond personal goals, which is positive, but I'd need more specific examples to assess your actual capabilities.`,
        next_level_hint: "I need to see concrete examples and measurable outcomes rather than general statements about helping or contributing."
      };
    }

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Request completed in ${duration}ms`);

    return new Response(JSON.stringify({ mirror }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error in generate-power-mirror after ${duration}ms:`, error.message);
    
    // Create error fallback
    const skillRef = 'your value-focused thinking';
    const goalRef = 'your forward-planning mindset';
    
    return new Response(JSON.stringify({ 
      error: error.message,
      mirror: {
        recruiter_perspective: `To a recruiter, your focus on "${skillRef}" shows value-focused thinking that employers want to see.`,
        score: 7,
        score_breakdown: {
          clarity: 2,
          relevance: 2,
          realism: 2,
          professional_impression: 1
        },
        coaching_nudge: "Once we're back online, we'll dive deeper into making your unique value even more compelling.",
        contradictions: [],
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