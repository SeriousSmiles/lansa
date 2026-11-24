import { describe, it, expect } from 'bun:test';
import { resumeStep, progressFor, isSwipeable, shouldAutoCompleteLegacy, sanitizeDraft, validateSeekerIdentity, validateSkills, validateCompanyName, validateWebsite, addSkill, FLOW_VERSION } from './onboardingFlowModel';

describe('onboarding flow rules', () => {
  it('open v2 seeker draft is not auto-completed from career_path alone', () => {
    expect(shouldAutoCompleteLegacy({ flow_version: FLOW_VERSION, user_intent: 'job_seeker' }, 'student')).toBe(false);
    expect(shouldAutoCompleteLegacy({ user_intent: 'job_seeker' }, 'student')).toBe(true);
    expect(shouldAutoCompleteLegacy({ user_intent: 'job_seeker' }, null)).toBe(false);
  });
  it('created company resumes at logo, never re-creates', () => {
    expect(resumeStep('create_org', 'review', { orgCreated: true })).toBe('logo');
    expect(resumeStep('create_org', 'logo', {})).toBe('review');
  });
  it('sent join request resumes at pending done', () => {
    expect(resumeStep('join_org', 'confirm', { requestSent: true })).toBe('done');
  });
  it('unknown step resumes at intro; seeker done resumes at last real step', () => {
    expect(resumeStep('job_seeker', 'bogus')).toBe('intro');
    expect(resumeStep('job_seeker', 'done')).toBe('visibility');
  });
  it('progress counts real steps only', () => {
    expect(progressFor('job_seeker', 'stage')).toEqual({ index: 1, total: 6 });
    expect(progressFor('create_org', 'logo')).toEqual({ index: 6, total: 6 });
    expect(progressFor('join_org', 'confirm')).toEqual({ index: 2, total: 2 });
  });
  it('only intro is swipeable', () => {
    expect(isSwipeable('intro')).toBe(true);
    expect(isSwipeable('identity')).toBe(false);
    expect(isSwipeable('skills')).toBe(false);
  });
  it('drafts drop credential-like keys', () => {
    expect(sanitizeDraft({ a: 1, password: 'x', nested: { otpCode: '1', b: 2 } })).toEqual({ a: 1, nested: { b: 2 } });
  });
  it('identity requires names and a headline under 80 chars', () => {
    expect(Object.keys(validateSeekerIdentity({ firstName: '', lastName: '', title: '' }))).toEqual(['firstName', 'lastName', 'title']);
    expect(validateSeekerIdentity({ firstName: 'A', lastName: 'B', title: 'x'.repeat(81) }).title).toBeTruthy();
    expect(validateSeekerIdentity({ firstName: 'A', lastName: 'B', title: 'Barista' })).toEqual({});
  });
  it('skills need 1 to 15, deduplicated', () => {
    expect(validateSkills([]).skills).toBeTruthy();
    expect(addSkill(['Excel'], ' excel ')).toEqual(['Excel']);
    expect(addSkill(Array.from({ length: 15 }, (_, i) => 's' + i), 'new')).toHaveLength(15);
  });
  it('company name and website rules', () => {
    expect(validateCompanyName(' ').name).toBeTruthy();
    expect(validateCompanyName('Acme')).toEqual({});
    expect(validateWebsite('ftp://x').website).toBeTruthy();
    expect(validateWebsite('')).toEqual({});
  });
});
