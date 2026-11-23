/** Pure helpers for the employer Home and Jobs screens. Uses only existing job/application statuses. */
export type JobLike = { id: string; title: string; is_active: boolean; posted_at: string };
export type ApplicationLike = { job_id: string; status: string };
export type JobCounts = Record<string, { total: number; pending: number }>;
export type JobFilter = "open" | "closed" | "all";

export function countApplications(apps: ApplicationLike[]): JobCounts {
  const out: JobCounts = {};
  for (const a of apps) {
    const c = (out[a.job_id] ??= { total: 0, pending: 0 });
    if (a.status === "withdrawn") continue;
    c.total += 1;
    if (a.status === "pending") c.pending += 1;
  }
  return out;
}

export function filterJobs<T extends JobLike>(jobs: T[], filter: JobFilter): T[] {
  const list = filter === "all" ? jobs : jobs.filter((j) => j.is_active === (filter === "open"));
  return [...list].sort((a, b) => Number(b.is_active) - Number(a.is_active) || Date.parse(b.posted_at) - Date.parse(a.posted_at));
}

/** Open vacancies with applications waiting for a decision, most waiting first. */
export function jobsNeedingAttention<T extends JobLike>(jobs: T[], counts: JobCounts): Array<T & { pending: number }> {
  return jobs
    .filter((j) => j.is_active && (counts[j.id]?.pending ?? 0) > 0)
    .map((j) => ({ ...j, pending: counts[j.id].pending }))
    .sort((a, b) => b.pending - a.pending);
}

export function totalPending(counts: JobCounts): number {
  return Object.values(counts).reduce((n, c) => n + c.pending, 0);
}
