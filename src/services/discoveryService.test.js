import { test, expect, mock } from 'bun:test';
let profiles = [];
let certs = [];
let history = [];
let failTable = null;
const query = table => {
  const clauses = [];
  let start = 0, end = Infinity;
  return {
    select() { return this; },
    eq(key, value) { clauses.push(row => row[key] === value); return this; },
    neq(key, value) { clauses.push(row => row[key] !== value); return this; },
    not(key, op, value) { const ids = value.slice(1, -1).split(','); clauses.push(row => !ids.includes(row[key])); return this; },
    order() { return this; },
    range(a, b) { start = a; end = b + 1; return this; },
    limit(n) { end = n; return this; },
    then(resolve) {
      const source = table === 'swipes' ? history : table === 'user_certifications' ? certs : profiles;
      resolve({ data: failTable === table ? null : source.filter(row => clauses.every(clause => clause(row))).slice(start, end), error: failTable === table ? new Error('read refused') : null });
    },
  };
};
mock.module('../integrations/supabase/client', () => ({ supabase: { from: query } }));
const { discoveryService } = await import('./discoveryService');
const person = id => ({ user_id: id, name: id, title: 'Professional', skills: ['Guest relations'] });
test('mobile only surfaces lansa_certified=true AND verified=true, excluding prior decisions', async () => {
  profiles = ['qualified', 'not-verified', 'not-certified', 'already-passed'].map(person);
  certs = [
    { user_id: 'qualified', lansa_certified: true, verified: true },
    { user_id: 'not-verified', lansa_certified: true, verified: false },
    { user_id: 'not-certified', lansa_certified: false, verified: true },
    { user_id: 'already-passed', lansa_certified: true, verified: true },
  ];
  history = [{ swiper_user_id: 'employer', target_user_id: 'already-passed', context: 'employee' }];
  failTable = null;
  const result = await discoveryService.getDiscoveryProfiles('employer', 'employee', {}, 20, true, true);
  expect(result.map(p => p.user_id)).toEqual(['qualified']);
  expect(result[0].isCertified).toBe(true);
});
test('skill filtering scans beyond the initial page instead of showing a false filtered-empty state', async () => {
  profiles = Array.from({ length: 101 }, (_, i) => ({ ...person(String(i)), skills: i === 100 ? ['Accounting'] : ['Guest relations'] }));
  certs = profiles.map(p => ({ user_id: p.user_id, lansa_certified: true, verified: true }));
  history = []; failTable = null;
  const result = await discoveryService.getDiscoveryProfiles('employer', 'employee', { skills: ['account'] }, 20, true, true);
  expect(result.map(p => p.user_id)).toEqual(['100']);
});
test('read failures are errors, not an empty certified-talent pool', async () => {
  profiles = [person('qualified')]; history = [];
  certs = [{ user_id: 'qualified', lansa_certified: true, verified: true }];
  for (const table of ['swipes', 'user_certifications', 'user_profiles_public']) {
    failTable = table;
    await expect(discoveryService.getDiscoveryProfiles('employer', 'employee', {}, 20, true, true)).rejects.toThrow('read refused');
  }
  failTable = null;
});
