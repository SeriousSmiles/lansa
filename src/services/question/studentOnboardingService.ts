import { supabase } from "@/integrations/supabase/client";
import { UserAnswers } from "./types";

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
    console.error('Error saving student demographics:', error);
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
    console.error('Error saving power skill:', error);
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
    console.error('Error saving 90-day goal:', error);
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
      console.error('Error marking student onboarding complete:', error);
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
        console.error('Error updating user profile:', profileError);
        // Don't throw here as the main onboarding completion succeeded
      }
    }
  } catch (error) {
    console.error('Error marking student onboarding complete:', error);
    throw error;
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
  try {
    const { data, error } = await supabase.functions.invoke('analyze-skill-reframe', {
      body: { skill }
    });

    if (error) throw error;
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing skill reframe:', error);
    return {
      reframed_skill: "I can apply what I've learned to solve real business challenges",
      business_value_type: "quality-improving",
      ai_category: "general",
      encouragement: "You're thinking about how your skills create value - that's exactly what employers want to see!"
    };
  }
}

export async function analyzeNinetyDayGoal(goalStatement: string) {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-90day-goal', {
      body: { goalStatement }
    });

    if (error) throw error;
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing 90-day goal:', error);
    return {
      interpretation: "You're thinking about specific outcomes and taking initiative - that's exactly what employers want to see!",
      initiative_type: "operational",
      clarity_level: "clear",
      strengths: "Shows forward-thinking and desire to contribute meaningfully",
      employer_perspective: "This person thinks about results and wants to make an impact from day one."
    };
  }
}

export async function generatePowerMirror(skillReframe: string, goalStatement: string, demographics: StudentDemographics) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-power-mirror', {
      body: { 
        skillReframe, 
        goalStatement, 
        demographics 
      }
    });

    if (error) throw error;
    return data.mirror;
  } catch (error) {
    console.error('Error generating power mirror:', error);
    return {
      mirror_message: "You're thinking like someone who wants to create value - that's the foundation of career success!",
      key_strengths: ["Value-focused thinking", "Initiative", "Growth mindset"],
      employer_perspective: "This person understands that work is about creating impact, not just completing tasks.",
      next_level_hint: "Keep building on this foundation - you're on the right track!"
    };
  }
}