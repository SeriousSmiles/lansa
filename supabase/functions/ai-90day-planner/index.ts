import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, major, raw_goal_input } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check cache first
    const { data: cached } = await supabase
      .from('user_90day_goal')
      .select('*')
      .eq('user_id', user_id)
      .eq('goal_statement', raw_goal_input)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cached && cached.overall_strength > 0) {
      return new Response(JSON.stringify({ 
        row_id: cached.id,
        render_snippet: {
          goal_statement: cached.goal_statement,
          overall_strength: cached.overall_strength,
          feedback: cached.feedback,
          follow_up_question: cached.follow_up_question
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // AI call with retry logic
    let model = 'gpt-4o-mini';
    let result = await callOpenAI(raw_goal_input, major, model);
    
    // Escalate to GPT-4 if weak
    if (result.overall_strength < 0.6) {
      model = 'gpt-4o';
      result = await callOpenAI(raw_goal_input, major, model);
    }

    // Save to database
    const { data: savedRow, error } = await supabase
      .from('user_90day_goal')
      .insert({
        user_id,
        goal_statement: result.goal_statement,
        ai_interpretation: result.feedback,
        assumptions: result.assumptions,
        success_metric: result.success_metric,
        risk_notes: result.risk_notes,
        ...result
      })
      .select()
      .single();

    if (error) throw error;

    // Log metrics
    await supabase.from('ai_logs').insert({
      user_id_hash: await hashUserId(user_id),
      expert: '90day-planner',
      model_used: model,
      input_hash: await createHash(raw_goal_input + major),
      error_flag: false
    });

    return new Response(JSON.stringify({
      row_id: savedRow.id,
      render_snippet: {
        goal_statement: result.goal_statement,
        overall_strength: result.overall_strength,
        feedback: result.feedback,
        follow_up_question: result.follow_up_question
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in ai-90day-planner:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callOpenAI(goalInput: string, major: string, model: string) {
  const systemPrompt = `You are the AI Coach in the Lansa onboarding sequence.
Your role is to act as a bridge between the user's words and how a recruiter/manager would interpret them.
Your job is not to flatter, not to rewrite perfectly, but to give perspective, clarity, and scoring so the user understands how their answers land in the real job market.

RECRUITER LENS RULES:
1. Always phrase feedback as: "To a recruiter, this sounds..." or "A manager might see this as..."
2. Stay true to the user's voice - do not replace their input with polished essays
3. Score honestly and tied to professional impression (0-10 scale)
4. Challenge unrealistic answers respectfully but firmly ("CEO in 90 days" = 0 realism points)
5. Encourage clarity and specificity that shows competence and direction

SCORING SYSTEM (0-10):
- Clarity (0-3 pts): 0=unclear, 1=vague, 2=somewhat specific, 3=sharp clarity
- Relevance (0-3 pts): 0=unrelated to major/career, 1=loosely connected, 2=mostly aligned, 3=strongly aligned
- Realism (0-2 pts): 0=unrealistic timeline, 1=ambitious but possible, 2=realistic and achievable
- Professional Impression (0-2 pts): 0=weak/negative impression, 1=neutral, 2=strong positive

Student's major: ${major}

OUTPUT REQUIREMENTS:
Analyze the 90-day goal for realism and clarity.
Always start feedback with recruiter perspective.
Identify assumptions and risks that would concern employers.
Provide a coaching nudge for improvement.

Output exact JSON schema:
{
  "goal_statement": "string",
  "assumptions": ["string"],
  "success_metric": "string", 
  "risk_notes": ["string"],
  "clarity_score": 0.0,
  "specificity_score": 0.0,
  "employer_relevance_score": 0.0,
  "overall_strength": 0.0,
  "feedback": "To a recruiter, this sounds... [recruiter perspective + score explanation]",
  "follow_up_question": "string|null"
}

Calculate overall_strength = (clarity_score + specificity_score + employer_relevance_score) / 10 * 3.33
Map scores: clarity=Clarity/3, specificity=Relevance/3, employer_relevance=Realism+Professional/4`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: goalInput }
      ],
      temperature: model.includes('gpt-4o') ? 0.3 : undefined,
      max_tokens: model.includes('gpt-4o') ? 600 : undefined,
      max_completion_tokens: model.includes('gpt-5') ? 600 : undefined,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    return {
      goal_statement: goalInput,
      assumptions: ["Need more specific details"],
      success_metric: "Measurable outcome needed",
      risk_notes: ["Vague goals reduce hiring chances"],
      clarity_score: 0.3,
      specificity_score: 0.2,
      employer_relevance_score: 0.3,
      overall_strength: 0.27,
      feedback: "To a recruiter, this goal sounds vague without clear deliverables. Score: 3/10. Break it down into specific, measurable steps you can demonstrate.",
      follow_up_question: "What exact, measurable result will you deliver in 90 days?"
    };
  }
}

async function hashUserId(userId: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(userId));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createHash(input: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}