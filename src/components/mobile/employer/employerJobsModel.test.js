import { describe, test, expect } from 'bun:test';
import { countApplications, filterJobs, jobsNeedingAttention, totalPending } from './employerJobsModel';
const jobs = [
  { id: 'a', title: 'A', is_active: true, posted_at: '2026-11-01' },
  { id: 'b', title: 'B', is_active: true, posted_at: '2026-11-10' },
  { id: 'c', title: 'C', is_active: false, posted_at: '2026-11-20' },
];
const apps = [
  { job_id: 'a', status: 'pending' }, { job_id: 'a', status: 'accepted' }, { job_id: 'a', status: 'withdrawn' },
  { job_id: 'b', status: 'pending' }, { job_id: 'b', status: 'pending' }, { job_id: 'c', status: 'pending' },
];
describe('employer jobs model', () => {
  test('withdrawn applications are not counted as waiting or total', () => {
    expect(countApplications(apps).a).toEqual({ total: 2, pending: 1 });
  });
  test('only open jobs with new applications need attention, most waiting first', () => {
    expect(jobsNeedingAttention(jobs, countApplications(apps)).map(j => [j.id, j.pending])).toEqual([['b', 2], ['a', 1]]);
  });
  test('status filter uses the existing open/closed flag', () => {
    expect(filterJobs(jobs, 'open').map(j => j.id)).toEqual(['b', 'a']);
    expect(filterJobs(jobs, 'closed').map(j => j.id)).toEqual(['c']);
  });
  test('total new applications sums every job, including closed ones', () => {
    expect(totalPending(countApplications(apps))).toBe(4);
  });
});
