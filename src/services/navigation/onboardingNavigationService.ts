/**
 * Onboarding Navigation Service
 * Centralized logic for determining post-onboarding destinations
 * Makes routing logic testable, maintainable, and extensible
 */

export type UserType = 'job_seeker' | 'employer' | 'freelancer' | 'visionary' | 'business' | 'mentor';
export type CareerPath = 'student' | 'professional' | 'career_changer' | 'entrepreneur';

/**
 * Get the correct destination after onboarding completion
 * @param userType - The type of user completing onboarding
 * @param careerPath - Optional career path for job seekers
 * @returns The route path to navigate to
 */
export function getPostOnboardingDestination(
  userType: UserType,
  careerPath?: CareerPath
): string {
  // Employer users go to employer dashboard
  if (userType === 'employer' || userType === 'business') {
    return '/employer-dashboard';
  }

  // Job seekers go to profile page (can be changed based on requirements)
  if (userType === 'job_seeker') {
    // Future: Could route differently based on career path
    // if (careerPath === 'student') return '/student-dashboard';
    // if (careerPath === 'professional') return '/professional-dashboard';
    return '/profile';
  }

  // Mentor users go to mentor dashboard
  if (userType === 'mentor') {
    return '/mentor-dashboard';
  }

  // Future user types
  if (userType === 'freelancer') {
    return '/freelancer-dashboard';
  }

  if (userType === 'visionary') {
    return '/visionary-dashboard';
  }

  // Default fallback (should not happen in production)
  console.warn(`Unknown user type: ${userType}, defaulting to /dashboard`);
  return '/dashboard';
}

/**
 * Get a user-friendly label for the destination
 * Useful for loading messages and UI feedback
 */
export function getDestinationLabel(userType: UserType): string {
  const labels: Record<UserType, string> = {
    employer: 'Employer Dashboard',
    business: 'Business Dashboard',
    job_seeker: 'Your Profile',
    freelancer: 'Freelancer Hub',
    visionary: 'Visionary Space',
    mentor: 'Mentor Dashboard'
  };

  return labels[userType] || 'Dashboard';
}

/**
 * Validate if a user type is allowed to complete onboarding
 * Future: Add business logic for restricted user types
 */
export function canCompleteOnboarding(userType: UserType): boolean {
  const allowedTypes: UserType[] = ['job_seeker', 'employer', 'business', 'mentor'];
  return allowedTypes.includes(userType);
}
