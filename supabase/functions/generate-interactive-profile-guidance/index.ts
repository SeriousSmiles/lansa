import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('ONBOARDING_AI_API_KEY');
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
  console.log('Aggregating user context for:', userId);
  
  // Fetch all user data in parallel with proper error handling
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

  // Log any data fetch errors
  if (userAnswersResult.error) console.error('User answers fetch error:', userAnswersResult.error);
  if (profileResult.error) console.error('Profile fetch error:', profileResult.error);
  if (skillsResult.error) console.error('Skills fetch error:', skillsResult.error);
  if (goalResult.error) console.error('Goal fetch error:', goalResult.error);
  if (powerSkillsResult.error) console.error('Power skills fetch error:', powerSkillsResult.error);

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

function buildContextualPrompt(context: UserContext, conversationHistory: ConversationMessage[], requestType: string): string {
  const { userAnswers, profileData, skillsData, goalData, powerSkills, existingProfile } = context;
  
  return `You are Clara, an expert career coach specializing in personalized profile optimization. Your mindset: "Every person has unique value - my job is to help them articulate it authentically and compellingly."

COACHING PHILOSOPHY:
- Listen deeply to understand their unique story and aspirations
- Build confidence while maintaining authenticity 
- Ask clarifying questions to uncover hidden strengths
- Provide specific, actionable advice tailored to their exact situation
- Connect their past experiences to their future goals
- Help them see patterns and themes they might miss

USER PROFILE & CONTEXT:
Identity: ${userAnswers.identity || 'Not specified'}
Career Aspiration: ${userAnswers.desired_outcome || 'Not specified'}
Career Path: ${userAnswers.career_path || 'Not specified'}
Academic Status: ${userAnswers.academic_status || 'Not specified'}
Field of Study: ${userAnswers.field_of_study || 'Not specified'}
User Type: ${userAnswers.user_type || 'Not specified'}
90-Day Vision: ${goalData.goal_statement || 'Not set'}
Current Challenge: ${profileData.biggest_challenge || 'Not specified'}

CURRENT PROFILE COMPLETENESS:
- Professional Title: ${existingProfile.title || 'Missing - needs creation'}
- About Section: ${existingProfile.about || 'Missing - needs creation'}
- Skills Listed: ${existingProfile.skills?.length || 0}
- Work Experience: ${existingProfile.experiences?.length || 0} entries
- Education: ${existingProfile.education?.length || 0} entries

POWER SKILLS INSIGHTS:
${skillsData.map((skill: any) => `• ${skill.original_skill} → ${skill.reframed_skill} (${skill.business_value_type})`).join('\n') || 'No skills analysis available yet'}

CONVERSATION FLOW:
${conversationHistory.map(msg => `${msg.role === 'user' ? 'STUDENT' : 'COACH'}: ${msg.content}`).join('\n\n')}

COACHING APPROACH FOR THIS INTERACTION:
1. Acknowledge what they've shared and validate their efforts
2. Ask specific follow-up questions to understand their unique situation better
3. Provide concrete suggestions that build on their existing content
4. Explain the "why" behind each suggestion in terms of their goals
5. Offer them choice and alternatives to maintain ownership
6. Keep the conversation flowing naturally - don't overwhelm them
7. Reference their actual experiences and goals in your suggestions
8. Help them see connections between their skills, experiences, and aspirations

CRITICAL: Always respond in JSON format:
{
  "message": "Your conversational, encouraging response as their coach",
  "suggestions": {
    "title": "specific headline suggestion based on their data",
    "about": "personalized about section that reflects their story", 
    "skills": ["skill1", "skill2"] - only if addressing skills,
    "experiences": [{"title": "Role", "description": "Achievement-focused description", "startYear": 2020, "endYear": 2023}] - only if addressing experience,
    "education": [{"title": "Degree/Program", "description": "Value-focused description", "startYear": 2018, "endYear": 2022}] - only if addressing education
  },
  "reasoning": "Explain how these suggestions specifically fit their goals and background",
  "nextSteps": ["Specific next action", "Follow-up suggestion"],
  "isComplete": false
}

Remember: You're helping them tell their authentic story in a way that resonates with their target audience. Build confidence, ask questions, and guide them step by step.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, conversationHistory, userMessage, requestType, section, currentContent }: GuidanceRequest = await req.json();

    console.log('Processing guidance request:', { userId, requestType, section });

    // Validate API key
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({
        error: 'AI service temporarily unavailable',
        guidance: {
          message: "I'm experiencing technical difficulties, but I'm still here to help! While I reconnect, let's focus on what makes you unique. What's one accomplishment from your studies or work that you're proud of?",
          suggestions: {},
          reasoning: "Temporary technical issue - let's continue our conversation to gather context",
          nextSteps: ["Share a specific achievement or project you've worked on", "Tell me about a challenge you've overcome"],
          isComplete: false
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Aggregate comprehensive user context
    const userContext = await aggregateUserContext(supabase, userId);
    
    // Build conversation messages
    const messages: ConversationMessage[] = [...conversationHistory];
    if (userMessage) {
      messages.push({ role: 'user', content: userMessage });
    }

    // Build contextual system prompt
    const systemPrompt = buildContextualPrompt(userContext, messages, requestType);

    // Call OpenAI with enhanced context
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      console.error('Request details:', { userId, requestType, section });
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let guidance: GuidanceResponse;
    
    try {
      guidance = JSON.parse(data.choices[0].message.content);
      
      // Validate that we have meaningful suggestions
      if (!guidance.suggestions || Object.keys(guidance.suggestions).length === 0) {
        console.warn('Empty suggestions received from AI');
        guidance = getEnhancedFallbackResponse(userContext);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw AI response:', data.choices?.[0]?.message?.content);
      guidance = getEnhancedFallbackResponse(userContext);
    }

    console.log('Generated guidance:', guidance);

    return new Response(JSON.stringify({ guidance }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    } catch (error: any) {
      console.error('Error in generate-interactive-profile-guidance:', error);
      console.error('Error details:', { 
        message: error.message, 
        stack: error.stack,
        apiKey: openAIApiKey ? 'Present' : 'Missing'
      });
      
      const fallbackGuidance = getEnhancedFallbackResponse();
      
      return new Response(JSON.stringify({ 
        error: error.message,
        guidance: fallbackGuidance
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
  }
});

function getEnhancedFallbackResponse(userContext?: UserContext): GuidanceResponse {
  const careerGoal = userContext?.userAnswers?.desired_outcome || userContext?.userAnswers?.career_path;
  
  return {
    message: `I'm experiencing a temporary hiccup, but let's keep building your profile! ${careerGoal ? `I see you're focused on ${careerGoal} - that's exciting!` : ''} While I reconnect, tell me about a recent project or achievement you're proud of.`,
    suggestions: {
      title: userContext?.profileData?.major ? `${userContext.profileData.major} focused on delivering results` : "Results-driven professional ready to make an impact",
      about: careerGoal ? `Passionate about ${careerGoal} with a commitment to continuous learning and delivering value through innovative solutions.` : "Dedicated professional with a passion for continuous learning and delivering measurable results in collaborative environments."
    },
    reasoning: "Providing helpful fallback content while technical issues are resolved",
    nextSteps: ["Share a specific project or achievement", "Tell me about your biggest learning moment", "Describe what excites you most about your field"],
    isComplete: false
  };
}