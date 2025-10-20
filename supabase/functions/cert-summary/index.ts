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
    const { sector, category_scores, all_mirror_texts, total_score, pass_fail } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are the Certification Summary AI for Lansa Certification Exams.
Your role is to write a professional, motivational 3-paragraph summary that employers will see.

Structure:
1. Overall impression - Professional strengths demonstrated
2. Category analysis - Highlight strongest category and area for growth
3. Forward-looking statement - What this certification signals about the candidate

Be honest, constructive, and Caribbean-professional in tone.
Focus on readiness, mindset, and professional maturity.

Category scores:
${JSON.stringify(category_scores, null, 2)}

Total score: ${total_score}%
Result: ${pass_fail ? 'PASS' : 'NEEDS IMPROVEMENT'}

All mirror feedback from exam:
${all_mirror_texts.join('\n\n')}`;

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
          { role: 'user', content: `Generate a 3-paragraph certification summary for a ${sector} professional who scored ${total_score}%.` }
        ],
        max_tokens: 500,
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
    const ai_summary_text = data.choices[0].message.content;

    return new Response(JSON.stringify({ ai_summary_text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in cert-summary:', error);
    
    // Fallback summary
    const fallback = `This candidate has completed the Lansa ${sector || 'Professional'} Certification, demonstrating commitment to professional development. Their performance across key categories shows a foundation in workplace readiness. This certification reflects their dedication to building professional competencies and preparing for career advancement in the ${sector || 'chosen'} sector.`;
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate summary',
      ai_summary_text: fallback
    }), {
      status: 200, // Return 200 with fallback
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
