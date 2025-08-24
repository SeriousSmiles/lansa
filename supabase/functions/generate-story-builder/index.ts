import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('ONBOARDING_AI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const MAYA_MASTER_PROMPT = `You are Maya, an expert personal branding strategist and storytelling coach with 10+ years of experience helping professionals craft authentic origin stories that resonate with employers and clients.

Your coaching philosophy: "Your authentic story is your competitive advantage - it's not just what you did, but why you did it and what it reveals about your character."

Your methodology: Transform raw experiences into compelling narratives using proven storytelling frameworks that highlight:
- Authentic motivation and values
- Growth mindset and resilience
- Unique perspective and experiences
- Professional impact and potential
- Clear vision for the future

When analyzing user responses, consider:
1. Their career path and professional goals
2. Industry context and audience expectations
3. Authenticity vs. professional polish balance
4. Story arc with clear transformation/growth
5. Memorable moments that reveal character

Generate stories that are:
- Genuine and relatable, not overly polished
- Professional yet personable
- Action-oriented with specific examples
- Forward-looking and aspirational
- Tailored to their industry/role context

Provide multiple format options when requested (elevator pitch, bio, interview story, LinkedIn summary).`;

serve(async (req) => {
  console.log('Story Builder AI function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      responses, 
      userContext, 
      formatType = 'origin',
      tone = 'professional'
    } = await req.json();

    console.log('Processing story generation request:', { 
      formatType, 
      tone, 
      hasResponses: !!responses,
      hasContext: !!userContext 
    });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create user-specific content based on their responses and context
    const contextualPrompt = `
User Profile Context:
- Name: ${userContext?.name || 'Professional'}
- Title: ${userContext?.title || 'Career-focused individual'}
- Career Path: ${userContext?.career_path || 'Professional development'}
- Identity: ${userContext?.identity || 'Motivated professional'}
- Goals: ${userContext?.desired_outcome || 'Career advancement'}
- Background: ${userContext?.about_text || 'Developing professional'}

User Story Responses:
- Origin: ${responses?.origin || 'Not provided'}
- Deep Motivation: ${responses?.motivation || 'Not provided'}
- Pivotal Moment: ${responses?.pivotal || 'Not provided'}
- Vision: ${responses?.vision || 'Not provided'}

Please analyze these responses and create a compelling ${formatType} story in a ${tone} tone. 

For an "origin" story, create a 2-3 paragraph narrative that weaves together their journey, motivation, pivotal moment, and vision into a cohesive professional story.

For other formats:
- "elevator_pitch": 30-45 second verbal introduction
- "bio": Professional bio for LinkedIn/resume (150-200 words)
- "interview": Detailed narrative for "tell me about yourself" questions

Focus on authenticity, growth, and professional impact. Make it memorable and engaging while maintaining professionalism.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: MAYA_MASTER_PROMPT },
          { role: 'user', content: contextualPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedStory = data.choices[0].message.content;

    console.log('Successfully generated story');

    // Save the story to the database
    const { error: insertError } = await supabase
      .from('user_stories')
      .insert({
        user_id: userContext?.user_id,
        story_type: formatType,
        title: `${formatType.charAt(0).toUpperCase() + formatType.slice(1)} Story - ${new Date().toLocaleDateString()}`,
        content: generatedStory,
        metadata: {
          tone,
          generated_at: new Date().toISOString(),
          responses: responses,
          ai_model: 'gpt-4o-mini',
          coach: 'Maya'
        }
      });

    if (insertError) {
      console.error('Error saving story:', insertError);
      // Don't fail the request if we can't save, just log the error
    }

    return new Response(
      JSON.stringify({
        success: true,
        story: generatedStory,
        formatType,
        tone,
        coach: 'Maya',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-story-builder function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});