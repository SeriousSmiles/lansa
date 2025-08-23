import { useMemo } from "react";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";

interface ProfileProgress {
  completionPercentage: number;
  completedSteps: string[];
  nextStep: string | null;
  totalSteps: number;
}

const PROFILE_STEPS = [
  { id: 'photo', weight: 10, label: 'Profile Photo' },
  { id: 'title', weight: 15, label: 'Professional Title' },
  { id: 'about', weight: 20, label: 'About Me' },
  { id: 'skills', weight: 15, label: 'Skills' },
  { id: 'goal', weight: 10, label: 'Professional Goal' },
  { id: 'challenge', weight: 10, label: 'Biggest Challenge' },
  { id: 'experience', weight: 15, label: 'Experience' },
  { id: 'education', weight: 5, label: 'Education' }
];

export function useProfileProgress(profile: ProfileDataReturn): ProfileProgress {
  return useMemo(() => {
    let totalWeight = 0;
    let completedWeight = 0;
    const completedSteps: string[] = [];
    let nextStep: string | null = null;

    for (const step of PROFILE_STEPS) {
      totalWeight += step.weight;
      let isCompleted = false;

      switch (step.id) {
        case 'photo':
          isCompleted = !!profile.profileImage;
          break;
        case 'title':
          isCompleted = !!profile.userTitle && profile.userTitle.trim().length > 0;
          break;
        case 'about':
          isCompleted = !!profile.aboutText && profile.aboutText.trim().length > 20;
          break;
        case 'skills':
          isCompleted = !!(profile.userSkills && profile.userSkills.length >= 3);
          break;
        case 'goal':
          isCompleted = !!profile.professionalGoal && profile.professionalGoal.trim().length > 10;
          break;
        case 'challenge':
          isCompleted = !!profile.biggestChallenge && profile.biggestChallenge.trim().length > 10;
          break;
        case 'experience':
          isCompleted = !!(profile.experiences && profile.experiences.length > 0);
          break;
        case 'education':
          isCompleted = !!(profile.educationItems && profile.educationItems.length > 0);
          break;
      }

      if (isCompleted) {
        completedWeight += step.weight;
        completedSteps.push(step.id);
      } else if (!nextStep) {
        nextStep = step.id;
      }
    }

    const completionPercentage = Math.round((completedWeight / totalWeight) * 100);

    return {
      completionPercentage,
      completedSteps,
      nextStep,
      totalSteps: PROFILE_STEPS.length
    };
  }, [
    profile.profileImage,
    profile.userTitle,
    profile.aboutText,
    profile.userSkills,
    profile.professionalGoal,
    profile.biggestChallenge,
    profile.experiences,
    profile.educationItems
  ]);
}