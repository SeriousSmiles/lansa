import { useMemo, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";

interface HireRateScore {
  score: number;
  breakdown: {
    profile_completion: number;
    profile_quality: number;
    engagement_level: number;
    onboarding_completion: number;
  };
  readinessLevel: string;
  nextAction: {
    title: string;
    description: string;
    link: string;
  } | null;
}

export function useHireRateScore(profile: ProfileDataReturn): HireRateScore {
  const { user } = useAuth();
  const [savedScore, setSavedScore] = useState<number>(0);
  const [savedBreakdown, setSavedBreakdown] = useState({
    profile_completion: 0,
    profile_quality: 0,
    engagement_level: 0,
    onboarding_completion: 0,
  });

  // Calculate current score based on profile data
  const calculated = useMemo(() => {
    // Profile completion (40% weight)
    let completionScore = 0;
    const fields = [
      { field: profile.profileImage, weight: 8 },
      { field: profile.userTitle?.trim(), weight: 10 },
      { field: profile.aboutText?.trim() && profile.aboutText.length > 20, weight: 12 },
      { field: profile.userSkills?.length >= 3, weight: 10 },
    ];
    
    fields.forEach(({ field, weight }) => {
      if (field) completionScore += weight;
    });

    // Profile quality (30% weight) - based on content depth
    let qualityScore = 0;
    if (profile.aboutText && profile.aboutText.length > 100) qualityScore += 10;
    if (profile.userSkills && profile.userSkills.length >= 5) qualityScore += 8;
    if (profile.professionalGoal && profile.professionalGoal.length > 20) qualityScore += 7;
    if (profile.experiences && profile.experiences.length > 0) qualityScore += 5;

    // Onboarding completion (20% weight)
    let onboardingScore = 0;
    if (profile.userAnswers?.identity) onboardingScore += 10;
    if (profile.userAnswers?.desired_outcome) onboardingScore += 10;

    // Engagement level (10% weight) - placeholder for future metrics
    let engagementScore = 0;
    if (profile.professionalGoal && profile.biggestChallenge) engagementScore += 5;
    if (profile.userSkills && profile.userSkills.length > 0) engagementScore += 5;

    const totalScore = Math.min(100, completionScore + qualityScore + onboardingScore + engagementScore);

    return {
      score: totalScore,
      breakdown: {
        profile_completion: completionScore,
        profile_quality: qualityScore,
        engagement_level: engagementScore,
        onboarding_completion: onboardingScore,
      }
    };
  }, [profile]);

  // Determine readiness level and next action
  const readinessLevel = useMemo(() => {
    if (calculated.score >= 90) return "Hire-Ready";
    if (calculated.score >= 70) return "Almost There";
    if (calculated.score >= 50) return "Growing Strong";
    return "Just Getting Started";
  }, [calculated.score]);

  const nextAction = useMemo(() => {
    if (!profile.profileImage) {
      return {
        title: "Add Profile Photo",
        description: "A professional photo increases your visibility by 40%",
        link: "/profile#photo"
      };
    }
    if (!profile.userTitle?.trim()) {
      return {
        title: "Write Professional Title",
        description: "Tell recruiters what you do in one clear line",
        link: "/profile#title"
      };
    }
    if (!profile.aboutText || profile.aboutText.length < 20) {
      return {
        title: "Complete About Section", 
        description: "Share your story - this is what gets you noticed",
        link: "/profile#about"
      };
    }
    if (!profile.userSkills || profile.userSkills.length < 3) {
      return {
        title: "Add More Skills",
        description: "Add at least 3 skills to match with opportunities",
        link: "/profile#skills"
      };
    }
    if (!profile.experiences || profile.experiences.length === 0) {
      return {
        title: "Add Experience",
        description: "Show what you've accomplished - even projects count",
        link: "/profile#experience"
      };
    }
    return null;
  }, [profile]);

  // Save score to database when it changes significantly
  useEffect(() => {
    if (!user?.id || Math.abs(calculated.score - savedScore) < 5) return;
    
    const updateScore = async () => {
      try {
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            hire_rate_score: calculated.score,
            score_breakdown: calculated.breakdown
          });
        setSavedScore(calculated.score);
        setSavedBreakdown(calculated.breakdown);
      } catch (error) {
        console.error('Error updating hire rate score:', error);
      }
    };

    updateScore();
  }, [calculated.score, calculated.breakdown, user?.id, savedScore]);

  // Load existing score on mount
  useEffect(() => {
    if (!user?.id) return;

    const loadScore = async () => {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('hire_rate_score, score_breakdown')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setSavedScore(data.hire_rate_score || 0);
          if (data.score_breakdown && typeof data.score_breakdown === 'object') {
            setSavedBreakdown(data.score_breakdown as typeof savedBreakdown);
          }
        }
      } catch (error) {
        console.error('Error loading hire rate score:', error);
      }
    };

    loadScore();
  }, [user?.id]);

  return {
    score: calculated.score,
    breakdown: calculated.breakdown,
    readinessLevel,
    nextAction,
  };
}