
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NEBIUS_AI_API_KEY = Deno.env.get('NEBIUS_AI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Edge function invoked: generate-insight');
    const { userId, identity, goal, blocker, gender, age_group } = await req.json();
    
    console.log('Request data:', { userId, identity, goal, blocker, gender, age_group });
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check if API key is configured
    if (!NEBIUS_AI_API_KEY) {
      console.error('NEBIUS_AI_API_KEY is not configured');
      throw new Error('AI API key is not configured');
    }

    // Create a personalized prompt based on user data
    const prompt = `
      Generate a personalized professional insight for a ${gender || ''} ${age_group || ''} individual who identifies as a ${identity || 'professional'}.
      Their professional goal is: "${goal || 'advancing their career'}"
      Their main challenge is: "${blocker || 'identifying their unique value'}"
      
      Write a thoughtful, specific, and encouraging paragraph (max 3 sentences) that:
      1. Acknowledges their identity and goal
      2. Provides a unique insight about overcoming their specific challenge
      3. Uses a warm, conversational, and human tone
      4. Avoids generic advice and corporate speak
      
      The output should sound like wisdom from a trusted mentor, not AI-generated text.
    `;

    console.log('Calling Nebius AI with prompt');
    
    // Updated code to use the JWT token format for the new API key
    const nebiusResponse = await fetch('https://api.nebius.ai/v1/llm/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEBIUS_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelUri: 'ngc-gpt-lite/latest',
        messages: [
          { role: 'system', text: 'You are a professional career coach with expertise in personal branding' },
          { role: 'user', text: prompt }
        ],
        generationOptions: {
          temperature: 0.7,
          maxTokens: 200
        }
      }),
    });

    if (!nebiusResponse.ok) {
      const errorBody = await nebiusResponse.text();
      console.error('Nebius AI API error:', nebiusResponse.status, errorBody);
      throw new Error(`Nebius AI API error: ${nebiusResponse.status}`);
    }

    const nebiusData = await nebiusResponse.json();
    const insight = nebiusData.result.alternatives[0].message.text;
    console.log('Generated insight:', insight);

    // Store the generated insight in Supabase
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Storing insight in Supabase for user:', userId);
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Check if user exists in user_answers table
      const { data: existingAnswers } = await supabase
        .from('user_answers')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (existingAnswers) {
        console.log('Updating existing user answers with insight');
        // Update user_answers with the new AI-generated insight
        await supabase
          .from('user_answers')
          .update({ ai_insight: insight })
          .eq('user_id', userId);
      } else {
        console.log('No existing answers found for user:', userId);
      }
    } else {
      console.warn('Missing Supabase credentials, cannot save insight');
    }

    return new Response(
      JSON.stringify({ 
        insight,
        success: true
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in generate-insight function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
