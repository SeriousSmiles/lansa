import { useMemo } from "react";
import { useProfileProgress } from "./useProfileProgress";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";

interface HireRateScore {
  score: number;
  level: 'Getting Started' | 'Building Strong' | 'Almost Ready' | 'Hire-Ready';
  nextAction: string;
  coachingMessage: string;
  breakdown: {
    profileCompletion: number;
    onboardingQuality: number;
    goalClarity: number;
  };
}

export function useHireRateScore(profile: ProfileDataReturn): HireRateScore {
  const { user } = useAuth();
  const { completionPercentage } = useProfileProgress(profile);

  // Fetch power skills data
  const { data: powerSkills } = useQuery({
    queryKey: ['user-power-skills', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_power_skills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch 90-day goal data
  const { data: ninetyDayGoal } = useQuery({
    queryKey: ['user-90day-goal', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_90day_goal')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  return useMemo(() => {
    // Calculate component scores
    const profileScore = completionPercentage;
    
    const onboardingScore = powerSkills 
      ? Math.min(100, (powerSkills.overall_strength || 0) * 100)
      : 0;
      
    const goalScore = ninetyDayGoal 
      ? Math.min(100, (ninetyDayGoal.overall_strength || 0) * 100)
      : 0;

    // Weighted final score: Profile 30%, Onboarding 40%, Goal 30%
    const finalScore = Math.round(
      (profileScore * 0.3) + (onboardingScore * 0.4) + (goalScore * 0.3)
    );

    // Determine readiness level
    let level: HireRateScore['level'];
    let coachingMessage: string;
    let nextAction: string;

    if (finalScore >= 85) {
      level = 'Hire-Ready';
      coachingMessage = "You're shining bright! Employers can see your potential clearly.";
      nextAction = "Start applying to roles that excite you";
    } else if (finalScore >= 65) {
      level = 'Almost Ready';
      coachingMessage = "You're so close! A few more touches and you'll be irresistible.";
      nextAction = goalScore < 70 ? "Refine your 90-day goal" : "Complete your profile sections";
    } else if (finalScore >= 35) {
      level = 'Building Strong';
      coachingMessage = "Great momentum! Each step makes you more visible to employers.";
      nextAction = onboardingScore < 50 ? "Complete your skill analysis" : "Add more experience details";
    } else {
      level = 'Getting Started';
      coachingMessage = "Every expert was once a beginner. You're building something amazing.";
      nextAction = profileScore < 40 ? "Add your professional title" : "Share your career story";
    }

    return {
      score: finalScore,
      level,
      nextAction,
      coachingMessage,
      breakdown: {
        profileCompletion: profileScore,
        onboardingQuality: onboardingScore,
        goalClarity: goalScore,
      },
    };
  }, [completionPercentage, powerSkills, ninetyDayGoal]);
}