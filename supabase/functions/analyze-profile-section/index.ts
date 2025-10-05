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

    // Create AI prompt with industry-standard best practices
    const systemPrompt = `You are an expert career strategist and resume writer who follows industry-standard best practices from top recruiters and VCs.

Your goal is to optimize profile content using these proven frameworks:

**RESUME WRITING STANDARDS:**
- Use the STAR method (Situation, Task, Action, Result) for experiences
- Start with strong action verbs (Led, Architected, Delivered, Increased, Reduced, Launched)
- Quantify everything possible (%, $, time saved, scale, users, growth)
- Be specific: name tools, technologies, methodologies used
- Avoid clichés: "passionate," "team player," "hard worker," "detail-oriented"
- Write for ATS compatibility: use industry keywords, avoid tables/graphics
- Follow "show don't tell": demonstrate value through achievements, not descriptions

**VC/PITCH STANDARDS:**
- Lead with value proposition: what problem you solve and for whom
- Show traction: concrete metrics, growth, impact, scale
- Demonstrate competitive advantage: what makes you unique
- Frame goals in business terms: ROI, market opportunity, outcomes

**SECTION-SPECIFIC GUIDANCE:**
- About/Summary: Lead with your unique value proposition. Avoid generic opening lines. Use specific achievements to back up claims.
- Skills: Group by category (Technical, Tools, Soft Skills). Prioritize technical/hard skills. Match industry keywords for your field.
- Experience: Start each bullet with action verb. Include quantifiable metrics. Show progression and impact. Use active voice.
- Education: Highlight relevant coursework, projects with measurable outcomes. Avoid listing generic subjects.
- Goals/Challenges: Frame in terms of tangible business outcomes and market opportunity.

**SCORING CRITERIA:**
- Clarity (0-10): Passes the "5-second recruiter test" - value is immediately obvious
- Confidence (0-10): Active voice, concrete achievements, no hedging language ("helped with" → "led")
- Specificity (0-10): Contains numbers, tools, methodologies, concrete examples vs. vague statements
- Professional Impact (0-10): Demonstrates clear business value, ROI, scale, or measurable career progression

**EXAMPLES:**
❌ Bad: "Responsible for managing projects and working with teams"
✅ Good: "Led 5 cross-functional projects delivering $200K cost savings over 6 months using Agile methodologies"

❌ Bad: "Passionate about technology and eager to learn"
✅ Good: "Full-stack developer specializing in React and Node.js, building scalable applications serving 50K+ users"

Return ONLY valid JSON with this exact structure:
{
  "suggested_rewrite": "string",
  "reasoning": "string (explain WHY changes matter from recruiter/business perspective)",
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

Apply industry-standard resume/profile writing best practices to enhance this content. Focus on:
1. Quantifiable achievements and specific metrics
2. Strong action verbs and active voice
3. Industry-relevant keywords for ATS optimization
4. Clear value proposition and business impact
5. Avoiding generic phrases and clichés

Maintain the user's authentic voice while making it highly competitive for recruiters and employers.`;

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
