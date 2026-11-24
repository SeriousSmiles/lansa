import { test, expect } from 'bun:test';
import { excludesSeekerInterest, SEEKER_INTEREST_TYPES, selfMatchExclusion } from './notificationAudienceModel';

test('employers exclude seeker interest and super-interest without changing seeker or mentor notifications', () => {
  expect(SEEKER_INTEREST_TYPES).toEqual(['employer_interest_received', 'employer_nudge_received']);
  expect(excludesSeekerInterest('employer')).toBe(true);
  for (const role of ['job_seeker', 'mentor', null]) expect(excludesSeekerInterest(role)).toBe(false);
});
test('all notification reads exclude matches with the current user as their own other party', () => {
  expect(selfMatchExclusion('owner')).toBe('type.neq.match_created,metadata->>other_user_id.is.null,metadata->>other_user_id.neq.owner');
});