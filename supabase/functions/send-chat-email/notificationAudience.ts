export function shouldSendAudienceNotification(
  type: string,
  recipientId: string,
  otherUserId: unknown,
  recipientType: string | null,
  senderType: string | null,
): boolean {
  if (type === 'match_created') return otherUserId !== recipientId;
  if (type === 'employer_interest_received' || type === 'employer_nudge_received') {
    return recipientType === 'job_seeker' && senderType === 'employer'
      && typeof otherUserId === 'string' && otherUserId !== recipientId;
  }
  return true;
}