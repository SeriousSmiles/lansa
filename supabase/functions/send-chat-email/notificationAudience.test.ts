import { expect, test } from 'bun:test';
import { shouldSendAudienceNotification } from './notificationAudience';

test('interest and nudge emails are only for a seeker receiving interest from a different employer', () => {
  for (const type of ['employer_interest_received', 'employer_nudge_received']) {
    expect(shouldSendAudienceNotification(type, 'seeker', 'employer', 'job_seeker', 'employer')).toBe(true);
    expect(shouldSendAudienceNotification(type, 'employer', 'seeker', 'employer', 'job_seeker')).toBe(false);
    expect(shouldSendAudienceNotification(type, 'seeker', 'other', 'job_seeker', 'job_seeker')).toBe(false);
    expect(shouldSendAudienceNotification(type, 'seeker', 'seeker', 'job_seeker', 'employer')).toBe(false);
    expect(shouldSendAudienceNotification(type, 'seeker', null, 'job_seeker', null)).toBe(false);
  }
});
test('self-match email is suppressed without affecting genuine matches and messages', () => {
  expect(shouldSendAudienceNotification('match_created', 'owner', 'owner', null, null)).toBe(false);
  expect(shouldSendAudienceNotification('match_created', 'owner', 'candidate', null, null)).toBe(true);
  expect(shouldSendAudienceNotification('message_received', 'owner', null, null, null)).toBe(true);
});