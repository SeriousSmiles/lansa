export const SEEKER_INTEREST_TYPES = ['employer_interest_received', 'employer_nudge_received'] as const;

export function excludesSeekerInterest(userType: string | null | undefined): boolean {
  return userType === 'employer';
}

export function selfMatchExclusion(userId: string): string {
  return `type.neq.match_created,metadata->>other_user_id.is.null,metadata->>other_user_id.neq.${userId}`;
}