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

    // Use latest model for accurate assessment
    const model = 'gpt-4.1-2025-04-14';
    const result = await callOpenAI(raw_skill_input, major, model);

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
  // Validate input quality first
  const inputWords = skillInput.trim().split(/\s+/);
  const isLowQuality = 
    inputWords.length < 3 || 
    inputWords.some(word => word.length < 2) ||
    /^(.)\1+$/.test(skillInput.trim()) || // repeated characters
    skillInput.trim().length < 10 ||
    !/[a-zA-Z]/.test(skillInput); // no actual letters

  if (isLowQuality) {
    return {
      value_statements: [skillInput, "Please provide a more detailed description"],
      value_tags: ["needs_improvement"],
      clarity_score: 0.1,
      specificity_score: 0.1,
      employer_relevance_score: 0.1,
      overall_strength: 0.1,
      feedback: "This input is too brief or unclear to assess properly. Please describe a specific skill or ability you have.",
      follow_up_question: "Can you describe a specific problem you could solve or outcome you could deliver for a company?"
    };
  }

  const systemPrompt = `You are an expert Career Assessment AI specializing in evaluating student skills for professional readiness.

CRITICAL SCORING GUIDELINES:
- Only award high scores (0.7+) for specific, measurable, business-relevant statements
- Generic or vague responses should score below 0.5
- Input like "think" or short phrases should score 0.1-0.3 maximum
- Look for actual skills, tools, processes, or outcomes mentioned

SCORING CRITERIA:
- Clarity (0.0-1.0): Is it clear what the person can do?
- Specificity (0.0-1.0): Are there measurable outcomes or concrete examples?
- Employer Relevance (0.0-1.0): Would this solve real business problems?

Student's major: ${major}

Analyze the input and provide constructive feedback. For weak inputs, be direct about what's missing.

Output ONLY valid JSON:
{
  "value_statements": ["statement1", "statement2"],
  "value_tags": ["time_saving","accuracy","customer_experience","revenue","cost_control","problem_solving"],
  "clarity_score": 0.0,
  "specificity_score": 0.0,
  "employer_relevance_score": 0.0,
  "overall_strength": 0.0,
  "feedback": "string",
  "follow_up_question": "string"
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
        { role: 'user', content: `Please analyze this skill input: "${skillInput}"` }
      ],
      max_completion_tokens: 500,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError);
    // Strict fallback for parsing errors
    return {
      value_statements: [skillInput, "Please provide more detail about your specific abilities"],
      value_tags: ["needs_improvement"],
      clarity_score: 0.2,
      specificity_score: 0.2,
      employer_relevance_score: 0.2,
      overall_strength: 0.2,
      feedback: "I need more information to assess this properly. Please describe specific skills or outcomes.",
      follow_up_question: "What specific tools, processes, or outcomes can you deliver for a company?"
    };
  }
}

async function hashUserId(userId: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(userId));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}