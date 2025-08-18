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
  console.log('Aggregating user context for:', userId);
  
  // Fetch all user data in parallel
  const [
    userAnswersResult,
    profileResult,
    skillsResult,
    goalResult,
    powerSkillsResult
  ] = await Promise.all([
    supabase.from('user_answers').select('*').eq('user_id', userId).single(),
    supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('user_power_skills').select('*').eq('user_id', userId),
    supabase.from('user_90day_goal').select('*').eq('user_id', userId).single(),
    supabase.from('user_growth_stats').select('*').eq('user_id', userId).single()
  ]);

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
  
  return `You are an expert career coach and profile optimization specialist. Your role is to help users create compelling, personalized professional profiles through interactive conversation.

USER CONTEXT:
- Identity: ${userAnswers.identity || 'Not specified'}
- Career Goal: ${userAnswers.desired_outcome || 'Not specified'}
- Career Path: ${userAnswers.career_path || 'Not specified'}
- Academic Status: ${userAnswers.academic_status || 'Not specified'}
- Field of Study: ${userAnswers.field_of_study || 'Not specified'}
- User Type: ${userAnswers.user_type || 'Not specified'}
- 90-day Goal: ${goalData.goal_statement || 'Not set'}
- Biggest Challenge: ${profileData.biggest_challenge || 'Not specified'}

CURRENT PROFILE STATE:
- Title: ${existingProfile.title || 'Not set'}
- About: ${existingProfile.about || 'Not set'}
- Skills Count: ${existingProfile.skills?.length || 0}
- Experience Count: ${existingProfile.experiences?.length || 0}
- Education Count: ${existingProfile.education?.length || 0}

POWER SKILLS ANALYSIS:
${skillsData.map((skill: any) => `- ${skill.original_skill} → ${skill.reframed_skill} (${skill.business_value_type})`).join('\n') || 'No power skills analyzed yet'}

CONVERSATION CONTEXT:
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

INSTRUCTIONS:
1. Be conversational, encouraging, and personalized
2. Ask clarifying questions to understand their specific situation
3. Provide concrete, actionable suggestions based on their unique context
4. Explain WHY your suggestions work for their specific goals
5. Offer alternatives when requested
6. Build on their existing content rather than replacing it
7. Use their power skills analysis to inform experience descriptions
8. Reference their 90-day goal to shape career narrative
9. Consider their academic/career stage for appropriate language

RESPONSE FORMAT:
Always respond in JSON with this structure:
{
  "message": "Conversational response to the user",
  "suggestions": {
    "title": "suggested headline if relevant",
    "about": "suggested about section if relevant", 
    "skills": ["skill1", "skill2"] if relevant,
    "experiences": [{"title": "Job Title", "description": "Description", "startYear": 2020, "endYear": 2023}] if relevant,
    "education": [{"title": "Degree", "description": "Description", "startYear": 2018, "endYear": 2022}] if relevant
  },
  "reasoning": "Brief explanation of why these suggestions fit their profile",
  "nextSteps": ["Next action 1", "Next action 2"],
  "isComplete": false
}

Focus on being helpful, specific, and building their confidence while creating professional content that truly reflects their unique value proposition.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, conversationHistory, userMessage, requestType, section, currentContent }: GuidanceRequest = await req.json();

    console.log('Processing guidance request:', { userId, requestType, section });

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
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_completion_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const guidance: GuidanceResponse = JSON.parse(data.choices[0].message.content);

    console.log('Generated guidance:', guidance);

    return new Response(JSON.stringify({ guidance }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-interactive-profile-guidance:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      guidance: {
        message: "I'm having trouble connecting right now. Let me help you with some general profile tips while I get back online.",
        suggestions: {},
        reasoning: "Fallback response due to technical issue",
        nextSteps: ["Try again in a moment"],
        isComplete: false
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});