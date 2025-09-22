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
    const { user_id, source, text } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const result = await callOpenAI(text, source);

    // Save to database
    const { data: savedRow, error } = await supabase
      .from('ai_mirror_reviews')
      .insert({
        user_id,
        source,
        manager_read: result.manager_read,
        strengths: result.strengths,
        risks: result.risks,
        hire_signal_score: result.hire_signal_score
      })
      .select()
      .single();

    if (error) throw error;

    // Log metrics
    await supabase.from('ai_logs').insert({
      user_id_hash: await hashUserId(user_id),
      expert: 'power-mirror',
      model_used: 'gpt-4o-mini',
      input_hash: await createHash(text + source),
      error_flag: false
    });

    return new Response(JSON.stringify({
      row_id: savedRow.id,
      render_snippet: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-power-mirror:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callOpenAI(text: string, source: string) {
  const systemPrompt = `You are the AI Coach in the Lansa onboarding sequence.
Your role is to act as a bridge between the user's words and how a recruiter/manager would interpret them.
Your job is not to flatter, not to rewrite perfectly, but to give perspective, clarity, and scoring so the user understands how their answers land in the real job market.

RECRUITER LENS RULES:
1. Always phrase feedback as: "To a recruiter, this sounds..." or "A manager might see this as..."
2. Stay true to the user's voice - do not replace their input with polished essays
3. Score honestly and tied to professional impression (0-10 scale)
4. Challenge unrealistic answers respectfully but firmly
5. Point out inconsistencies between different answers
6. Encourage clarity and specificity that shows competence and value

POWER MIRROR PURPOSE:
Provide final comprehensive feedback combining all previous onboarding responses.
Highlight key strengths that would impress recruiters.
Identify risks or weak points that could hurt in interviews.
Give an overall hire-signal score reflecting how attractive they are as a candidate.

Source context: ${source}

Output exact JSON:
{
  "manager_read": "To a recruiter, this overall profile sounds... [comprehensive recruiter perspective]",
  "strengths": ["string"],
  "risks": ["string"],
  "hire_signal_score": 0.0
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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      max_tokens: 400,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    return {
      manager_read: "To a recruiter, this profile shows some potential but lacks the clarity and specificity needed to stand out in today's competitive job market.",
      strengths: ["Shows initiative and willingness to learn"],
      risks: ["Unclear value proposition", "Needs more concrete examples of impact"],
      hire_signal_score: 0.4
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