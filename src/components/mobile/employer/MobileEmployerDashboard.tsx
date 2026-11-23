import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Briefcase, BarChart3, Heart, MessageCircle, Plus, RefreshCw, UserCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { EmployerEmpty, EmployerGroup, EmployerHeader, EmployerRow } from "./employerUi";
import type { JobListing } from "@/services/jobPostingService";

interface BusinessData { company_name: string; business_size: string; role_function: string; business_services: string; company_logo?: string }
export interface EmployerStats { activeJobs: number; totalApplications: number; candidatesViewed: number; newMatches: number }

interface Props {
  businessData: BusinessData | null;
  stats: EmployerStats;
  statsError: boolean;
  pendingTotal: number;
  attention: Array<JobListing & { pending: number }>;
  jobsLoading: boolean;
  refreshing: boolean;
  canCreateJobs: boolean;
  canViewAnalytics: boolean;
  onRefresh: () => void;
  onCreateJob: () => void;
  onBrowseCandidates: () => void;
  onManageJobs: () => void;
  onOpenApplications: (job: JobListing) => void;
  onViewAnalytics: () => void;
  onOpenInbox: () => void;
}

interface ActivityItem { id: string; title: string; message: string; type: string; created_at: string }
const ACTIVITY_ICONS: Record<string, typeof Bell> = { employer_interest_received: Heart, match_created: UserCheck, chat_request_accepted: MessageCircle, job_application_received: Briefcase };

/** Employer Home: one primary hiring action, grouped real metrics, vacancies waiting on a decision. */
export function MobileEmployerDashboard(p: Props) {
  const { user } = useAuth();
  const [activity, setActivity] = useState<ActivityItem[] | null>(null);
  const [activityError, setActivityError] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    (async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, type, created_at")
        .eq("user_id", user.id)
        .in("type", ["employer_interest_received", "match_created", "chat_request_accepted", "job_application_received"])
        .order("created_at", { ascending: false })
        .limit(5);
      if (!live) return;
      setActivityError(!!error);
      setActivity((data as ActivityItem[]) || []);
    })();
    return () => { live = false; };
  }, [user?.id]);

  const company = p.businessData?.company_name || "Your company";

  return (
    <div className="ee-screen">
      <EmployerHeader
        title="Home"
        actions={<button type="button" className="ee-icon-btn" aria-label="Refresh home" onClick={p.onRefresh} disabled={p.refreshing}><RefreshCw size={20} className={p.refreshing ? "animate-spin" : ""} /></button>}
      />
      <div className="ee-body ee-fade">
        <p className="-mt-2 px-1 text-sm text-muted-foreground truncate">{company}{p.businessData?.business_services ? ` · ${p.businessData.business_services}` : ""}</p>

        {p.canCreateJobs ? (
          <button type="button" className="ee-primary w-full" onClick={p.onCreateJob}><Plus size={20} aria-hidden="true" /> Post a job</button>
        ) : (
          <button type="button" className="ee-primary w-full" onClick={p.onBrowseCandidates}><Users size={20} aria-hidden="true" /> Discover candidates</button>
        )}

        {p.statsError ? (
          <EmployerEmpty title="Couldn't load your numbers" body="Your hiring data is safe. Check your connection and try again." action={<button className="ee-secondary" onClick={p.onRefresh}>Try again</button>} />
        ) : (
          <section aria-label="Hiring numbers" className="ee-metrics">
            <button type="button" className="ee-metric is-lead" onClick={p.onManageJobs}>
              <span className="ee-metric-label">New applications</span>
              <span>
                <span className="ee-metric-value block">{p.jobsLoading ? "–" : p.pendingTotal}</span>
                <span className="ee-metric-note block">waiting for a decision · {p.stats.totalApplications} total</span>
              </span>
            </button>
            <button type="button" className="ee-metric" onClick={p.onManageJobs}>
              <span className="ee-metric-label">Open jobs</span>
              <span className="ee-metric-value">{p.stats.activeJobs}</span>
            </button>
            <button type="button" className="ee-metric" onClick={p.onOpenInbox}>
              <span className="ee-metric-label">Matches</span>
              <span className="ee-metric-value">{p.stats.newMatches}</span>
            </button>
          </section>
        )}

        <EmployerGroup label="Needs your attention">
          {p.jobsLoading ? (
            <div className="ee-skeleton h-14 m-2" aria-label="Loading vacancies" />
          ) : p.attention.length === 0 ? (
            <div className="px-4 py-5 text-sm text-muted-foreground">
              {p.stats.activeJobs === 0 ? "You have no open jobs. Post one to start receiving applications." : "No new applications are waiting. You're up to date."}
            </div>
          ) : (
            p.attention.slice(0, 5).map((job) => (
              <EmployerRow key={job.id} icon={Briefcase} label={job.title} detail={job.location || "Open vacancy"} trail={<span className="ee-count" aria-label={`${job.pending} new applications`}>{job.pending}</span>} onClick={() => p.onOpenApplications(job)} />
            ))
          )}
        </EmployerGroup>

        <EmployerGroup label="Hiring tools">
          <EmployerRow icon={Users} label="Discover candidates" detail={`${p.stats.candidatesViewed} profiles reviewed`} onClick={p.onBrowseCandidates} />
          <EmployerRow icon={Briefcase} label="Jobs & applications" detail="Open, closed and applicants" onClick={p.onManageJobs} />
          {p.canViewAnalytics && <EmployerRow icon={BarChart3} label="Analytics" detail="Applications per job" onClick={p.onViewAnalytics} />}
        </EmployerGroup>

        <EmployerGroup label="Recent activity">
          {activity === null ? (
            <div className="ee-skeleton h-14 m-2" aria-label="Loading activity" />
          ) : activityError ? (
            <div className="px-4 py-5 text-sm text-muted-foreground">Activity couldn't load right now.</div>
          ) : activity.length === 0 ? (
            <div className="px-4 py-5 text-sm text-muted-foreground">New applications, matches and replies will appear here.</div>
          ) : (
            activity.map((a) => {
              const Icon = ACTIVITY_ICONS[a.type] || Bell;
              return (
                <div key={a.id} className="ee-row">
                  <span className="ee-row-icon"><Icon size={18} aria-hidden="true" /></span>
                  <span className="ee-row-text"><span className="ee-row-label">{a.title}</span><span className="ee-row-detail">{a.message}</span></span>
                  <span className="ee-row-trail text-xs">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                </div>
              );
            })
          )}
        </EmployerGroup>
      </div>
    </div>
  );
}
