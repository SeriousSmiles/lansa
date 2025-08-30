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
    const { user_id, major, raw_skill_input } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create input hash for caching
    const inputHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(`${raw_skill_input}|${major}|skill-reframer`)
    );
    const hashString = Array.from(new Uint8Array(inputHash))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    // Check cache first
    const { data: cached } = await supabase
      .from('user_power_skills')
      .select('*')
      .eq('user_id', user_id)
      .eq('original_skill', raw_skill_input)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cached && cached.overall_strength > 0) {
      return new Response(JSON.stringify({ 
        row_id: cached.id,
        render_snippet: {
          value_statements: cached.value_statements,
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
    let result = await callOpenAI(raw_skill_input, major, model);
    
    // Escalate to GPT-4 if weak
    if (result.overall_strength < 0.6) {
      model = 'gpt-4o';
      result = await callOpenAI(raw_skill_input, major, model);
    }

    // Save to database
    const { data: savedRow, error } = await supabase
      .from('user_power_skills')
      .insert({
        user_id,
        original_skill: raw_skill_input,
        reframed_skill: result.value_statements[0] || raw_skill_input,
        value_statements: result.value_statements,
        business_value_type: result.value_tags.join(','),
        ai_category: major,
        ...result
      })
      .select()
      .single();

    if (error) throw error;

    // Log metrics
    await supabase.from('ai_logs').insert({
      user_id_hash: await hashUserId(user_id),
      expert: 'skill-reframer',
      model_used: model,
      input_hash: hashString,
      error_flag: false
    });

    return new Response(JSON.stringify({
      row_id: savedRow.id,
      render_snippet: {
        value_statements: result.value_statements,
        overall_strength: result.overall_strength,
        feedback: result.feedback,
        follow_up_question: result.follow_up_question
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-skill-reframer:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callOpenAI(skillInput: string, major: string, model: string) {
  const systemPrompt = `You are Skill Reframer, a hiring-savvy assistant for Dutch Caribbean students.

Convert vague school skills into 2 specific business-value statements managers care about.
Be direct. If the input is weak, explain why it matters and ask one focused clarifying question.

Student's major: ${major}
Output only valid JSON matching this exact schema:

{
  "value_statements": ["string","string"],
  "value_tags": ["time_saving","accuracy","customer_experience","revenue","cost_control"],
  "clarity_score": 0.0,
  "specificity_score": 0.0,
  "employer_relevance_score": 0.0,
  "overall_strength": 0.0,
  "feedback": "string",
  "follow_up_question": "string|null"
}

Overall strength = (0.4*clarity + 0.3*specificity + 0.3*employer_relevance)`;

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
        { role: 'user', content: skillInput }
      ],
      temperature: model.includes('gpt-4o') ? 0.3 : undefined,
      max_tokens: model.includes('gpt-4o') ? 500 : undefined,
      max_completion_tokens: model.includes('gpt-5') ? 500 : undefined,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    // Fallback response
    return {
      value_statements: [skillInput, `${skillInput} to deliver measurable results`],
      value_tags: ["accuracy"],
      clarity_score: 0.4,
      specificity_score: 0.3,
      employer_relevance_score: 0.3,
      overall_strength: 0.33,
      feedback: "Let's make this more specific and measurable.",
      follow_up_question: "What specific outcome do you deliver with this skill?"
    };
  }
}

async function hashUserId(userId: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(userId));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}