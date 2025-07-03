import { supabase } from "@/integrations/supabase/client";

export interface ProfileStatus {
  isOnboardingComplete: boolean;
  isProfileReady: boolean;
  hasBasicInfo: boolean;
  hasAboutText: boolean;
  hasProfessionalInfo: boolean;
}

export async function getProfileStatus(userId: string): Promise<ProfileStatus> {
  try {
    // Get user answers to check onboarding
    const { data: answersData } = await supabase
      .from('user_answers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Get user profile to check completeness
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const isOnboardingComplete = Boolean(
      answersData?.onboarding_completed && 
      (answersData?.identity || answersData?.desired_outcome)
    );

    const hasBasicInfo = Boolean(profileData?.name);
    const hasAboutText = Boolean(profileData?.about_text && profileData.about_text.length > 20);
    const hasProfessionalInfo = Boolean(
      profileData?.title ||
      (profileData?.experiences && Array.isArray(profileData.experiences) && profileData.experiences.length > 0) ||
      (profileData?.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0)
    );

    // Profile is considered "ready" for dashboard if onboarding is complete
    // Full profile completeness is checked separately for other features
    const isProfileReady = isOnboardingComplete;

    return {
      isOnboardingComplete,
      isProfileReady,
      hasBasicInfo,
      hasAboutText,
      hasProfessionalInfo
    };
  } catch (error) {
    console.error('Error checking profile status:', error);
    return {
      isOnboardingComplete: false,
      isProfileReady: false,
      hasBasicInfo: false,
      hasAboutText: false,
      hasProfessionalInfo: false
    };
  }
}

export function getProfileCompletionMessage(status: ProfileStatus): string {
  if (!status.isOnboardingComplete) {
    return "Complete your onboarding to get started";
  }
  
  if (!status.hasBasicInfo) {
    return "Add your name to make your profile discoverable";
  }
  
  if (!status.hasAboutText && !status.hasProfessionalInfo) {
    return "Add some details about yourself or your experience";
  }
  
  return "Your profile is ready! Access your dashboard to continue growing.";
}