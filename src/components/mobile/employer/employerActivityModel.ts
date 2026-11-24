/** Hiring activity only: employer_interest_received is addressed to a seeker,
 * not evidence that a candidate expressed interest in an employer. */
export const EMPLOYER_ACTIVITY_TYPES = [
  "match_created",
  "chat_request_accepted",
  "job_application_received",
] as const;

interface ActivityEvent {
  type: string;
  metadata?: { other_user_id?: unknown } | null;
}

export function isEmployerActivity(event: ActivityEvent, userId: string): boolean {
  return EMPLOYER_ACTIVITY_TYPES.some(type => type === event.type)
    && !(event.type === "match_created" && event.metadata?.other_user_id === userId);
}