/**
 * Resolves the best available logo URL for a job listing.
 * Checks: organizations logo → companies logo → top-level logo_url → null
 */
export function getJobLogo(job: Record<string, any>): string | null {
  return (
    job.organizations?.logo_url ||
    job.companies?.logo_url ||
    job.logo_url ||
    job.business_profiles?.organizations?.logo_url ||
    null
  );
}
