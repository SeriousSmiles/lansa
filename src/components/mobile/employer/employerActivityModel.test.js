import { describe, test, expect } from 'bun:test';
import { EMPLOYER_ACTIVITY_TYPES, isEmployerActivity } from './employerActivityModel';

describe('employer hiring activity', () => {
  test('candidate-only employer interest is excluded, never relabelled as candidate interest', () => {
    expect(EMPLOYER_ACTIVITY_TYPES.includes('employer_interest_received')).toBe(false);
    expect(isEmployerActivity({ type: 'employer_interest_received' }, 'owner')).toBe(false);
    expect(isEmployerActivity({ type: 'employer_nudge_received' }, 'owner')).toBe(false);
  });
  test('real applications, mutual matches and accepted connections remain visible', () => {
    for (const type of ['job_application_received', 'match_created', 'chat_request_accepted']) {
      expect(isEmployerActivity({ type, metadata: { other_user_id: 'candidate' } }, 'owner')).toBe(true);
    }
  });
  test('a historical self-match is not presented as a candidate match', () => {
    expect(isEmployerActivity({ type: 'match_created', metadata: { other_user_id: 'owner' } }, 'owner')).toBe(false);
    expect(isEmployerActivity({ type: 'match_created', metadata: null }, 'owner')).toBe(true);
  });
});