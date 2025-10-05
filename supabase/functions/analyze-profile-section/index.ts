import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, section, content } = await req.json();

    if (!user_id || !section || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, section, content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's onboarding data for context
    const { data: userAnswers } = await supabase
      .from('user_answers')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Build context from onboarding and profile data
    const context = `
User Identity: ${userAnswers?.identity || 'Not specified'}
Career Goal: ${userAnswers?.desired_outcome || 'Not specified'}
Current Title: ${userProfile?.title || 'Not specified'}
Professional Goal: ${userProfile?.professional_goal || 'Not specified'}
Skills: ${userProfile?.skills?.join(', ') || 'Not specified'}
Section Being Enhanced: ${section}
    `.trim();

    // Create AI prompt
    const systemPrompt = `You are an expert career coach and professional profile writer. Your goal is to help users improve their profile sections to be more professional, confident, specific, and authentic.

Analyze the user's current content in the context of their career background and goals. Provide:
1. A rewritten version that's more professional and impactful while maintaining their authentic voice
2. Clear reasoning for your suggestions
3. Scores (0-10) for: clarity, confidence, specificity, and professional impression

Return ONLY valid JSON with this exact structure:
{
  "suggested_rewrite": "string",
  "reasoning": "string",
  "score": {
    "clarity": number,
    "confidence": number,
    "specificity": number,
    "professional_impression": number
  }
}`;

    const userPrompt = `
Context about the user:
${context}

Current content for "${section}" section:
${content}

Enhance this content to be more professional, confident, and specific while keeping the user's authentic voice. Focus on making it employer-ready and impactful.`;

    // Call OpenAI API
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const aiData = await openaiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    // Parse AI response
    let result;
    try {
      result = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Log the feedback to database
    try {
      await supabase.from('ai_feedback_log').insert({
        user_id,
        section,
        input_text: content,
        ai_suggestion: result.suggested_rewrite,
        reasoning: result.reasoning,
        score: result.score,
      });
    } catch (logError) {
      console.error('Failed to log AI feedback:', logError);
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-profile-section:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
