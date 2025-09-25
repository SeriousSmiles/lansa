import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, context, major } = await req.json();

    const result = await callOpenAI(text, context, major);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in ai-clarity-critic:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callOpenAI(text: string, context: string, major: string) {
  const systemPrompt = `You are Clarity Critic. Score clarity, specificity, employer relevance. If weak, produce a compact "Why this matters to managers" line + one suggestion. JSON only. Blunt.

Context: ${context}
Student major: ${major}

Output exact JSON:
{
  "clarity_score": 0.0,
  "specificity_score": 0.0,
  "employer_relevance_score": 0.0,
  "overall_strength": 0.0,
  "why_it_matters": "string",
  "suggestion": "string"
}

Overall strength = (0.4*clarity + 0.3*specificity + 0.3*employer_relevance)`;

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
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    return {
      clarity_score: 0.4,
      specificity_score: 0.3,
      employer_relevance_score: 0.3,
      overall_strength: 0.33,
      why_it_matters: "Clear, specific outcomes help managers understand your value.",
      suggestion: "Add a measurable result you can deliver."
    };
  }
}