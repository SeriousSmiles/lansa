import { useMemo } from "react";
import { useProfileProgress } from "./useProfileProgress";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { analyzeHireRateWithAI, type AIHireRateRecommendation } from "@/services/aiHireRateAnalyzer";

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
  aiRecommendation?: AIHireRateRecommendation;
  isAnalyzing: boolean;
  lastAnalyzed?: Date;
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

  // Fetch user answers for AI analysis
  const { data: userAnswers } = useQuery({
    queryKey: ['user-answers', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_answers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // AI-powered hire rate analysis
  const { data: aiRecommendation, isLoading: isAnalyzing } = useQuery({
    queryKey: ['hire-rate-ai-analysis', user?.id, completionPercentage, powerSkills?.id, ninetyDayGoal?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await analyzeHireRateWithAI(user.id, {
        profileData: profile,
        userAnswers,
        powerSkills,
        ninetyDayGoal,
        completionPercentage
      });
    },
    enabled: !!user?.id && completionPercentage > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
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

    // Use AI recommendation if available, otherwise fall back to static logic
    let level: HireRateScore['level'];
    let coachingMessage: string;
    let nextAction: string;

    if (aiRecommendation) {
      // Use AI-powered recommendations
      coachingMessage = aiRecommendation.coachingMessage;
      nextAction = aiRecommendation.nextAction;
    } else {
      // Fallback to static recommendations
      if (finalScore >= 85) {
        coachingMessage = "You're shining bright! Employers can see your potential clearly.";
        nextAction = "Start applying to roles that excite you";
      } else if (finalScore >= 65) {
        coachingMessage = "You're so close! A few more touches and you'll be irresistible.";
        nextAction = goalScore < 70 ? "Refine your 90-day goal" : "Complete your profile sections";
      } else if (finalScore >= 35) {
        coachingMessage = "Great momentum! Each step makes you more visible to employers.";
        nextAction = onboardingScore < 50 ? "Complete your skill analysis" : "Add more experience details";
      } else {
        coachingMessage = "Every expert was once a beginner. You're building something amazing.";
        nextAction = profileScore < 40 ? "Add your professional title" : "Share your career story";
      }
    }

    // Determine level based on score
    if (finalScore >= 85) {
      level = 'Hire-Ready';
    } else if (finalScore >= 65) {
      level = 'Almost Ready';
    } else if (finalScore >= 35) {
      level = 'Building Strong';
    } else {
      level = 'Getting Started';
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
      aiRecommendation: aiRecommendation || undefined,
      isAnalyzing,
      lastAnalyzed: aiRecommendation ? new Date() : undefined,
    };
  }, [completionPercentage, powerSkills, ninetyDayGoal, aiRecommendation, isAnalyzing]);
}