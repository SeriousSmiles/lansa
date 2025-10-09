import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public code: 'unauthorized' | 'onboarding_required' | 'forbidden'
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export interface UserAuthState {
  userId: string;
  userType?: 'job_seeker' | 'employer';
  careerPath?: string;
  onboardingCompleted: boolean;
}

/**
 * Get authenticated user from JWT token
 */
export async function getAuthenticatedUser(
  supabase: SupabaseClient
): Promise<UserAuthState> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new AuthorizationError('Not authenticated', 'unauthorized');
  }

  // Fetch user state from database
  const [answersResult, profileResult] = await Promise.all([
    supabase
      .from('user_answers')
      .select('user_type, career_path, career_path_onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle()
  ]);

  // BACKWARD COMPATIBILITY: Check both flags during migration period
  const newFlag = !!profileResult.data?.onboarding_completed;
  const oldFlag = !!answersResult.data?.career_path_onboarding_completed;

  return {
    userId: user.id,
    userType: answersResult.data?.user_type as 'job_seeker' | 'employer' | undefined,
    careerPath: answersResult.data?.career_path,
    onboardingCompleted: newFlag || oldFlag, // Consider complete if EITHER flag is true
  };
}

/**
 * Require user to have completed onboarding
 */
export function requireOnboarding(state: UserAuthState): void {
  if (!state.onboardingCompleted) {
    throw new AuthorizationError(
      'Onboarding must be completed to access this resource',
      'onboarding_required'
    );
  }
}

/**
 * Require user to have specific user type(s)
 */
export function requireUserType(
  state: UserAuthState,
  allowedTypes: Array<'job_seeker' | 'employer'>
): void {
  if (!state.userType || !allowedTypes.includes(state.userType)) {
    throw new AuthorizationError(
      `Access restricted to ${allowedTypes.join(' or ')} users. Current type: ${state.userType || 'unknown'}`,
      'forbidden'
    );
  }
}

/**
 * Combined guard: require auth + onboarding + user type
 */
export async function requireRole(
  supabase: SupabaseClient,
  allowedTypes: Array<'job_seeker' | 'employer'>
): Promise<UserAuthState> {
  const state = await getAuthenticatedUser(supabase);
  requireOnboarding(state);
  requireUserType(state, allowedTypes);
  return state;
}

/**
 * Format error response for edge functions
 */
export function formatAuthError(error: unknown): Response {
  if (error instanceof AuthorizationError) {
    const statusCode = error.code === 'unauthorized' ? 401 : 403;
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code,
      }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Generic error
  return new Response(
    JSON.stringify({
      error: 'Internal server error',
      code: 'internal_error',
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
