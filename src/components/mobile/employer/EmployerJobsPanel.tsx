import { useState } from "react";
import { format } from "date-fns";
import { Briefcase, Eye, Lock, MapPin, Plus, RefreshCw, Unlock } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { JobListing } from "@/services/jobPostingService";
import { EmployerEmpty, EmployerHeader, JOB_TYPE_LABEL, JobStatus } from "./employerUi";
import { filterJobs, type JobCounts, type JobFilter } from "./employerJobsModel";

interface Props {
  jobs: JobListing[];
  counts: JobCounts;
  loading: boolean;
  error: boolean;
  canCreate: boolean;
  canEdit: boolean;
  onRefresh: () => void;
  onCreate: () => void;
  onToggle: (job: JobListing) => Promise<boolean>;
  onOpenApplications: (job: JobListing) => void;
}

const FILTERS: Array<[JobFilter, string]> = [["open", "Open"], ["closed", "Closed"], ["all", "All"]];

const postedLabel = (d: string) => { const t = Date.parse(d); return Number.isFinite(t) ? `Posted ${format(t, "d MMM yyyy")}` : "Posted recently"; };

export function EmployerJobsPanel(p: Props) {
  const [filter, setFilter] = useState<JobFilter>("open");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const list = filterJobs(p.jobs, filter);
  const detail = p.jobs.find((j) => j.id === detailId) || null;
  const n = (f: JobFilter) => filterJobs(p.jobs, f).length;

  const toggle = async (job: JobListing) => {
    setBusy(true);
    try { await p.onToggle(job); } finally { setBusy(false); }
  };

  return (
    <div className="ee-screen">
      <EmployerHeader
        title="Jobs"
        actions={<>
          <button type="button" className="ee-icon-btn" aria-label="Refresh jobs" onClick={p.onRefresh} disabled={p.loading}><RefreshCw size={20} className={p.loading ? "animate-spin" : ""} /></button>
          {p.canCreate && <button type="button" className="ee-icon-btn" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }} aria-label="Post a job" onClick={p.onCreate}><Plus size={22} /></button>}
        </>}
      />
      <div className="ee-body">
        <div className="ee-chips" role="tablist" aria-label="Job status">
          {FILTERS.map(([key, label]) => (
            <button key={key} type="button" role="tab" className="ee-chip" aria-selected={filter === key} onClick={() => setFilter(key)}>
              {label} <span className="opacity-60">{n(key)}</span>
            </button>
          ))}
        </div>

        {p.loading && p.jobs.length === 0 ? (
          <div className="flex flex-col gap-3" aria-label="Loading jobs">{[0, 1, 2].map((i) => <div key={i} className="ee-skeleton h-24" />)}</div>
        ) : p.error ? (
          <EmployerEmpty icon={Briefcase} title="Couldn't load your jobs" body="Nothing was changed. Try again in a moment." action={<button className="ee-secondary" onClick={p.onRefresh}>Try again</button>} />
        ) : list.length === 0 ? (
          <EmployerEmpty
            icon={Briefcase}
            title={p.jobs.length === 0 ? "No jobs posted yet" : filter === "open" ? "No open jobs" : "No closed jobs"}
            body={p.jobs.length === 0 ? "Post a vacancy and applications will appear here." : "Switch the filter to see your other postings."}
            action={p.canCreate && p.jobs.length === 0 ? <button className="ee-primary" onClick={p.onCreate}><Plus size={18} /> Post a job</button> : undefined}
          />
        ) : (
          <ul className="flex flex-col gap-3 ee-fade">
            {list.map((job) => {
              const c = p.counts[job.id];
              return (
                <li key={job.id}>
                  <button type="button" className="ee-job" onClick={() => setDetailId(job.id)} aria-label={`${job.title}, ${job.is_active ? "open" : "closed"}, ${c?.total ?? 0} applicants`}>
                    <span className="flex items-start justify-between gap-3 w-full">
                      <span className="ee-job-title">{job.title}</span>
                      <JobStatus active={job.is_active} />
                    </span>
                    <span className="ee-job-meta">{[job.location, JOB_TYPE_LABEL[job.job_type] || job.job_type].filter(Boolean).join(" · ")}</span>
                    <span className="flex items-center justify-between w-full text-sm">
                      <span className="text-muted-foreground">{postedLabel(job.posted_at)}</span>
                      <span className="font-semibold">{c?.total ?? 0} {(c?.total ?? 0) === 1 ? "applicant" : "applicants"}{c?.pending ? <span className="ee-count ml-2">{c.pending} new</span> : null}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent side="bottom" className="employer-theme ee-sheet max-h-[90dvh] overflow-y-auto">
          {detail && (
            <div className="px-5 pt-6 pb-[calc(20px+env(safe-area-inset-bottom))] flex flex-col gap-5">
              <div className="flex flex-col items-start gap-2 pr-8">
                <JobStatus active={detail.is_active} />
                <SheetTitle className="ee-title text-[28px] font-extrabold leading-tight break-words">{detail.title}</SheetTitle>
                <SheetDescription className="flex items-center gap-1 text-sm">
                  <MapPin size={14} aria-hidden="true" />{[detail.location || "Location not set", JOB_TYPE_LABEL[detail.job_type] || detail.job_type, detail.is_remote ? "Remote" : null].filter(Boolean).join(" · ")}
                </SheetDescription>
              </div>
              <div className="ee-metrics" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="ee-metric"><span className="ee-metric-label">Applicants</span><span className="ee-metric-value">{p.counts[detail.id]?.total ?? 0}</span></div>
                <div className="ee-metric"><span className="ee-metric-label">New</span><span className="ee-metric-value">{p.counts[detail.id]?.pending ?? 0}</span></div>
              </div>
              <button type="button" className="ee-primary w-full" onClick={() => { const j = detail; setDetailId(null); p.onOpenApplications(j); }}><Eye size={18} /> Review applicants</button>
              {(detail.salary_range || detail.description) && (
                <div className="ee-group p-4 flex flex-col gap-2">
                  {detail.salary_range && <p className="font-semibold">{detail.salary_range}</p>}
                  <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-[12]">{detail.description}</p>
                  <p className="text-xs text-muted-foreground">{postedLabel(detail.posted_at)}</p>
                </div>
              )}
              {p.canEdit && (
                <div className="grid grid-cols-1">
                  <button type="button" className="ee-secondary" disabled={busy} onClick={() => toggle(detail)}>
                    {detail.is_active ? <><Lock size={16} /> Close job</> : <><Unlock size={16} /> Reopen job</>}
                  </button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
