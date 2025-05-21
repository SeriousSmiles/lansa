
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

    // Create a Supabase client to fetch full user answers
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get complete user answers
    const { data: userAnswers, error: userAnswersError } = await supabase
      .from('user_answers')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (userAnswersError) {
      console.error('Error fetching user answers:', userAnswersError);
      throw new Error('Could not retrieve user profile data');
    }
    
    console.log('Retrieved complete user answers:', userAnswers);

    // Create an improved, personalized prompt with full user data
    const prompt = `
      You are a helpful coach who writes short but deeply insightful summaries after talking to a user. 
      Based on the following user responses, write a 2-3 paragraph summary that:
      - Feels like you understood them deeply
      - Uses human conversational tone (friendly, not robotic)
      - Points out hidden strengths or new perspectives
      - Ends with a short, motivating thought.

      User onboarding answers:
      ${JSON.stringify(userAnswers, null, 2)}
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
