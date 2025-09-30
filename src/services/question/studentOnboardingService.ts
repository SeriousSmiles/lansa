import { supabase } from "@/integrations/supabase/client";
import { UserAnswers } from "./types";
import { logAICall, error as logError } from "@/utils/logger";

export interface StudentDemographics {
  academic_status: string;
  field_of_study: string;
  career_goal_type: string;
}

export interface PowerSkill {
  id?: string;
  user_id: string;
  original_skill: string;
  reframed_skill?: string;
  ai_category?: string;
  business_value_type?: string;
}

export interface NinetyDayGoal {
  id?: string;
  user_id: string;
  goal_statement: string;
  ai_interpretation?: string;
  initiative_type?: string;
  clarity_level?: string;
}

export async function saveStudentDemographics(userId: string, demographics: StudentDemographics) {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      academic_status: demographics.academic_status,
      field_of_study: demographics.field_of_study,
      career_goal_type: demographics.career_goal_type,
      updated_at: new Date().toISOString()
    });

  if (error) {
    logError('Error saving student demographics');
    throw error;
  }
}

export async function savePowerSkill(powerSkill: PowerSkill): Promise<string> {
  const { data, error } = await supabase
    .from('user_power_skills')
    .insert(powerSkill)
    .select('id')
    .single();

  if (error) {
    logError('Error saving power skill');
    throw error;
  }

  return data.id;
}

export async function saveNinetyDayGoal(goal: NinetyDayGoal): Promise<string> {
  const { data, error } = await supabase
    .from('user_90day_goal')
    .insert(goal)
    .select('id')
    .single();

  if (error) {
    logError('Error saving 90-day goal');
    throw error;
  }

  return data.id;
}

export async function markStudentOnboardingComplete(userId: string): Promise<void> {
  try {
    // Get user's auth metadata for name extraction
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Mark onboarding as complete with unified flag
    const { error } = await supabase
      .from('user_answers')
      .upsert({
        user_id: userId,
        career_path: 'student',
        career_path_onboarding_completed: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      logError('Error marking student onboarding complete');
      throw error;
    }

    // Update or create user profile with real name from auth metadata
    if (user) {
      const firstName = user.user_metadata?.first_name;
      const lastName = user.user_metadata?.last_name;
      const fullName = user.user_metadata?.full_name;
      
      let displayName = 'Lansa User';
      if (firstName && lastName) {
        displayName = `${firstName} ${lastName}`;
      } else if (fullName) {
        displayName = fullName;
      } else if (firstName) {
        displayName = firstName;
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          name: displayName,
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        logError('Error updating user profile');
        // Don't throw here as the main onboarding completion succeeded
      }
    }
  } catch (err) {
    logError('Error marking student onboarding complete');
    throw err;
  }
}

export async function getStudentOnboardingData(userId: string) {
  // Get basic user answers
  const { data: userAnswers } = await supabase
    .from('user_answers')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get demographics from user_profiles
  const { data: demographics } = await supabase
    .from('user_profiles')
    .select('academic_status, field_of_study, career_goal_type')
    .eq('user_id', userId)
    .single();

  // Get power skills
  const { data: powerSkills } = await supabase
    .from('user_power_skills')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Get 90-day goals
  const { data: goals } = await supabase
    .from('user_90day_goal')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return {
    userAnswers,
    demographics,
    powerSkills: powerSkills || [],
    goals: goals || []
  };
}

export async function analyzeSkillReframe(skill: string) {
  const startTime = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('analyze-skill-reframe', {
      body: { skill }
    });

    if (error) throw error;
    logAICall('analyze-skill-reframe', true, Date.now() - startTime);
    return data.analysis;
  } catch (err) {
    logAICall('analyze-skill-reframe', false, Date.now() - startTime);
    return {
      recruiter_perspective: "To a recruiter, this shows you're thinking about creating value, though more specifics would strengthen your message.",
      score: 6,
      score_breakdown: {
        clarity: 2,
        relevance: 2,
        realism: 2,
        professional_impression: 1
      },
      coaching_nudge: "Add specific examples or measurable outcomes to make your value proposition stronger.",
      reframed_skill: "I can apply what I've learned to solve real business challenges",
      business_value_type: "quality-improving"
    };
  }
}

export async function analyzeNinetyDayGoal(goalStatement: string) {
  const startTime = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('analyze-90day-goal', {
      body: { goalStatement }
    });

    if (error) throw error;
    logAICall('analyze-90day-goal', true, Date.now() - startTime);
    return data.analysis;
  } catch (err) {
    logAICall('analyze-90day-goal', false, Date.now() - startTime);
    return {
      recruiter_perspective: "To a recruiter, thinking about your 90-day goal shows forward-planning mindset that employers value.",
      score: 6,
      score_breakdown: {
        clarity: 2,
        relevance: 2,
        realism: 2,
        professional_impression: 1
      },
      coaching_nudge: "Add specific steps or measurable outcomes to make your goal more compelling.",
      interpretation: "You're thinking about specific outcomes and taking initiative - that's exactly what employers want to see!",
      initiative_type: "operational",
      clarity_level: "clear"
    };
  }
}

export async function generatePowerMirror(skillReframe: string, goalStatement: string, demographics: StudentDemographics) {
  const startTime = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('generate-power-mirror', {
      body: { 
        skillReframe, 
        goalStatement, 
        demographics 
      }
    });

    if (error) throw error;
    logAICall('generate-power-mirror', true, Date.now() - startTime);
    return data.mirror;
  } catch (err) {
    logAICall('generate-power-mirror', false, Date.now() - startTime);
    return {
      recruiter_perspective: "To a recruiter, looking at all your responses together, this shows you're thinking like someone who wants to create value - that's the foundation of career success!",
      score: 7,
      score_breakdown: {
        clarity: 2,
        relevance: 2,
        realism: 2,
        professional_impression: 1
      },
      coaching_nudge: "Keep building on this foundation - you're on the right track!",
      contradictions: [],
      mirror_message: "You're thinking like someone who wants to create value - that's the foundation of career success!",
      key_strengths: ["Value-focused thinking", "Initiative", "Growth mindset"],
      employer_perspective: "This person understands that work is about creating impact, not just completing tasks.",
      next_level_hint: "Keep building on this foundation - you're on the right track!"
    };
  }
}