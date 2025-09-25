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
    const { user_id, context = 'onboarding' } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const { data: skills } = await supabase
      .from('user_power_skills')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: goals } = await supabase
      .from('user_90day_goal')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Choose model based on context
    const model = context === 'onboarding' ? 'gpt-4o-mini' : 'gpt-4o';
    
    const result = await callOpenAI(profile, skills, goals, model);

    // Log metrics
    await supabase.from('ai_logs').insert({
      user_id_hash: await hashUserId(user_id),
      expert: 'profile-stylist',
      model_used: model,
      input_hash: await createHash(JSON.stringify({ profile, skills, goals })),
      error_flag: false
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in ai-profile-stylist:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callOpenAI(profile: any, skills: any, goals: any, model: string) {
  const systemPrompt = `You are Profile Stylist. Produce concise, professional content with measurable phrasing. Output JSON only.

Profile data: ${JSON.stringify(profile)}
Skills data: ${JSON.stringify(skills)}
Goals data: ${JSON.stringify(goals)}

Output exact JSON:
{
  "headline": "string",
  "about": "string", 
  "skills_bullets": ["string","string","string"]
}`;

  const userPrompt = `Create professional profile content based on the provided data. Make it compelling and results-focused.`;

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
        { role: 'user', content: userPrompt }
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
    const major = profile?.major || 'Student';
    return {
      headline: `${major} focused on delivering measurable results`,
      about: "Dedicated professional ready to apply academic knowledge to create real business value. Committed to continuous learning and exceeding expectations in a professional environment.",
      skills_bullets: [
        "Problem-solving with data-driven approaches",
        "Communication across diverse stakeholders", 
        "Project management and deadline delivery"
      ]
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