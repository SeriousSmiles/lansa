
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
      You are the Lansa In-App AI Coach. Based on the following user responses, craft a concise response that includes:
      1) One clear insight that helps them see their situation differently
      2) One concrete action step they can take right now (end with this step)

      Style: warm, direct, respectful, conversational, and grounded. Avoid fluff. If it feels natural, you may include a single local word in Papiamentu/Papiamento (e.g., dushi, huntu, kambio, pasa bon, tuma paso) — only when it fits. Reinforce that consistent actions on Lansa improve visibility over time.

      User onboarding answers:
      ${JSON.stringify(userAnswers, null, 2)}
    `;

    console.log('Calling Nebius AI with prompt');
    
    try {
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
            { role: 'system', text: `You are the Lansa In-App AI Coach — an expert guide in professional growth, visibility, and goal achievement.

Core purpose: help users communicate their unique value, take clear next steps, and build consistent visibility on Lansa.

Cultural context: Most users are from the Dutch Caribbean (Antiano culture: Curaçao, Aruba, Bonaire). Be warm, direct, and respectful. Occasionally (sparingly) use a natural word or phrase in Papiamentu/Papiamento (e.g., dushi, huntu, kambio, pasa bon, tuma paso) only when it fits. Avoid clichés.

Tone & style: clear, concise, encouraging but grounded; conversational; no fluff.

Response guidelines:
- Always reference the user’s goals, progress, or situation when possible.
- Include both: 1) a concise insight, and 2) one concrete action the user can take now (end with this step).
- Use simple examples if helpful.
- Reinforce the Lansa promise: actions today improve visibility tomorrow.` },
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
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      // Get a fallback insight based on identity
      const fallbackInsight = getFallbackInsight(userAnswers?.identity);
      
      return new Response(
        JSON.stringify({ 
          insight: fallbackInsight,
          success: false,
          error: aiError.message
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
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

// Helper function to provide fallback insights based on identity
function getFallbackInsight(identity?: string): string {
  // Personalized insights based on identity
  switch (identity) {
    case "Freelancer":
      return "The freelancers who get respect aren't just good — they're clear about their value and position themselves accordingly.";
    case "Job-seeker":
      return "When you understand how your unique strengths connect to market needs, you stop competing and start attracting the right opportunities.";
    case "Student":
      return "The most successful students don't wait for a degree to validate them — they actively curate experiences that showcase their unique perspective.";
    case "Entrepreneur":
      return "The entrepreneurs who break through fastest aren't necessarily the most innovative — they're the ones who make their innovation the easiest to understand and support.";
    case "Visionary":
      return "The visionaries who make the biggest impact aren't necessarily the boldest — they're the ones who learned to communicate their ideas in ways that build bridges rather than walls.";
    default:
      return "The professionals who advance fastest aren't just good at what they do — they're intentional about how they're perceived and positioned in their field.";
  }
}
