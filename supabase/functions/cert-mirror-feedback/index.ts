import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sector, category, scenario, user_answer_text, mirror_role, mirror_context } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are the Mirror AI for Lansa Certification Exams.
Your role is to provide instant reflective feedback showing how the user's answer sounds from a professional perspective.

Context:
- Sector: ${sector}
- Category: ${category}
- Mirror Role: ${mirror_role}
- Context: ${mirror_context}

Output format (2 sentences exactly):
1. "To your [${mirror_role}], this sounds like..." - How the answer is perceived
2. "Try shifting your mindset to..." - Constructive guidance

Be honest, motivational, and Caribbean-professional in tone.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Scenario: ${scenario}\n\nUser's answer: ${user_answer_text}` }
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const mirror_text = data.choices[0].message.content;

    return new Response(JSON.stringify({ mirror_text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in cert-mirror-feedback:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate mirror feedback',
      mirror_text: 'To your employer, this answer shows potential. Try reflecting more deeply on the professional impact of your choices.'
    }), {
      status: 200, // Return 200 with fallback so exam can continue
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
