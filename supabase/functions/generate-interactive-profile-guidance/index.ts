import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface UserContext {
  userAnswers: any;
  profileData: any;
  skillsData: any;
  goalData: any;
  powerSkills: any;
  existingProfile: any;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GuidanceRequest {
  userId: string;
  conversationHistory: ConversationMessage[];
  userMessage?: string;
  requestType: 'initial' | 'refine' | 'alternatives' | 'apply';
  section?: string;
  currentContent?: string;
}

interface GuidanceResponse {
  message: string;
  suggestions?: {
    title?: string;
    about?: string;
    skills?: string[];
    experiences?: Array<{title: string; description: string; startYear?: number; endYear?: number | null}>;
    education?: Array<{title: string; description: string; startYear?: number; endYear?: number | null}>;
  };
  reasoning?: string;
  nextSteps?: string[];
  isComplete?: boolean;
}

async function aggregateUserContext(supabase: any, userId: string): Promise<UserContext> {
  console.log('Aggregating comprehensive user context for:', userId);
  
  const [
    userAnswersResult,
    profileResult,
    skillsResult,
    goalResult,
    powerSkillsResult
  ] = await Promise.all([
    supabase.from('user_answers').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('user_power_skills').select('*').eq('user_id', userId),
    supabase.from('user_90day_goal').select('*').eq('user_id', userId).limit(1).maybeSingle(),
    supabase.from('user_growth_stats').select('*').eq('user_id', userId).maybeSingle()
  ]);

  if (userAnswersResult.error) console.log('User answers:', userAnswersResult.error.message);
  if (profileResult.error) console.log('Profile data:', profileResult.error.message);

  return {
    userAnswers: userAnswersResult.data || {},
    profileData: profileResult.data || {},
    skillsData: skillsResult.data || [],
    goalData: goalResult.data || {},
    powerSkills: powerSkillsResult.data || {},
    existingProfile: {
      title: profileResult.data?.title,
      about: profileResult.data?.about_text,
      skills: profileResult.data?.skills || [],
      experiences: profileResult.data?.experiences || [],
      education: profileResult.data?.education || []
    }
  };
}

function buildExpertPrompt(context: UserContext, conversationHistory: ConversationMessage[], requestType: string): string {
  const { userAnswers, profileData, skillsData, goalData, powerSkills, existingProfile } = context;
  
  return `You are Clara, an expert career coach with 15+ years helping students and early professionals create authentic, compelling profiles.

COACHING PHILOSOPHY:
- Every person has unique value - help them articulate it authentically
- Build confidence through specific, personalized guidance
- Ask strategic questions that reveal hidden strengths
- Connect their experiences to their career aspirations
- Make suggestions feel empowering, not overwhelming

USER IDENTITY & GOALS:
Identity: ${userAnswers.identity || 'Not specified'}
Career Aspiration: ${userAnswers.desired_outcome || 'Not specified'}
Academic Status: ${userAnswers.academic_status || 'Not specified'}
Field of Study: ${userAnswers.field_of_study || 'Not specified'}
Career Goal Type: ${userAnswers.career_goal_type || 'Not specified'}
90-Day Vision: ${goalData.goal_statement || 'Not specified'}
Biggest Challenge: ${profileData.biggest_challenge || 'Not specified'}

CURRENT PROFILE STATUS:
Professional Title: ${existingProfile.title || '❌ Missing - needs creation'}
About Section: ${existingProfile.about || '❌ Missing - needs creation'}
Skills Count: ${existingProfile.skills?.length || 0}
Work Experience: ${existingProfile.experiences?.length || 0} entries
Education: ${existingProfile.education?.length || 0} entries

CONVERSATION CONTEXT:
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}

COACHING APPROACH FOR THIS INTERACTION:
1. Reference their specific background and goals in every response
2. Provide concrete, actionable suggestions that build on what they already have
3. Ask follow-up questions that help them think deeper about their value
4. Explain WHY each suggestion will help them achieve their career goals
5. Keep the conversation flowing naturally - be encouraging and supportive
6. Connect their academic work to professional skills and achievements
7. Help them see patterns and themes they might miss

RESPONSE FORMAT - Return ONLY valid JSON:
{
  "message": "Your warm, encouraging response as their personal coach (reference their specific goals/background)",
  "suggestions": {
    "title": "specific headline that reflects their field and aspirations",
    "about": "personalized about section that tells their authentic story", 
    "skills": ["skill1", "skill2", "skill3"] (only if addressing skills),
    "experiences": [{"title": "Role/Project", "description": "Achievement-focused description", "startYear": 2023, "endYear": 2024}] (only if relevant),
    "education": [{"title": "Degree/Program", "description": "Value-focused description", "startYear": 2020, "endYear": 2024}] (only if relevant)
  },
  "reasoning": "Explain how these suggestions specifically align with their ${userAnswers.identity || 'professional'} identity and ${userAnswers.desired_outcome || 'career goals'}",
  "nextSteps": ["Specific actionable next step", "Follow-up suggestion"],
  "isComplete": false
}

Remember: Be their champion. Help them see their potential and guide them to express it powerfully.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, conversationHistory, userMessage, requestType, section, currentContent }: GuidanceRequest = await req.json();

    console.log('Processing guidance request:', { userId, requestType, section });

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    // Get comprehensive user context
    const userContext = await aggregateUserContext(supabase, userId);
    
    // Build conversation messages
    const messages: ConversationMessage[] = [...conversationHistory];
    if (userMessage) {
      messages.push({ role: 'user', content: userMessage });
    }

    // Build expert system prompt
    const systemPrompt = buildExpertPrompt(userContext, messages, requestType);

    // Call OpenAI with enhanced context
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_completion_tokens: 1200,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    let guidance: GuidanceResponse;
    try {
      guidance = JSON.parse(data.choices[0].message.content);
      
      // Validate response structure
      if (!guidance.message) {
        throw new Error("AI response missing required message field");
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', data.choices[0].message.content);
      
      // Enhanced fallback based on user context
      const identity = userContext.userAnswers.identity || 'professional';
      const field = userContext.userAnswers.field_of_study || 'your field';
      
      guidance = {
        message: `I understand you're working on developing your profile as a ${identity} in ${field}. While I had a technical hiccup just now, I'm here to help you create something authentic and compelling. What specific aspect of your profile would you like to focus on - your professional headline, about section, or highlighting your skills and experiences?`,
        suggestions: {},
        reasoning: `Personalized guidance for ${identity} focused on ${field}`,
        nextSteps: [
          "Tell me about a project or experience you're proud of",
          "Share what makes you excited about your field",
          "Describe your ideal role or next step"
        ],
        isComplete: false
      };
    }

    console.log('Generated expert guidance for user');

    return new Response(JSON.stringify({ guidance }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-interactive-profile-guidance:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      guidance: {
        message: "I'm experiencing a technical issue, but I'm still here to help you build an amazing profile! Let's focus on what makes you unique. What's one thing about your background or goals that you'd like to highlight?",
        suggestions: {},
        reasoning: "Technical fallback - gathering context to provide better guidance",
        nextSteps: [
          "Share your career goals or interests",
          "Tell me about your academic focus",
          "Describe a project or achievement you're proud of"
        ],
        isComplete: false
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});