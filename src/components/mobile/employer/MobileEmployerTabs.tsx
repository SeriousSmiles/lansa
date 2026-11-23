import { useCallback, useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Briefcase, Building2, LayoutDashboard, Mail, RefreshCw, Users } from "lucide-react";
import { MobileEmployerDashboard, type EmployerStats } from "./MobileEmployerDashboard";
import { MobileCandidateBrowser } from "./MobileCandidateBrowser";
import { MobileChatInbox } from "@/components/chat/mobile/MobileChatInbox";
import { MobileJobCreator } from "./MobileJobCreator";
import { EmployerJobsPanel } from "./EmployerJobsPanel";
import { EmployerCompanyHub } from "./EmployerCompanyHub";
import { EmployerEmpty, EmployerGroup, EmployerHeader, EmployerRow } from "./employerUi";
import { countApplications, jobsNeedingAttention, totalPending, type JobCounts } from "./employerJobsModel";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrgPermissions } from "@/hooks/useOrgPermissions";
import { useUnreadChatCount } from "@/hooks/useUnreadChatCount";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { matchService } from "@/services/matchService";
import { jobPostingService, type JobListing } from "@/services/jobPostingService";
import { toast } from "sonner";
import { ApplicationsSheet } from "@/components/employer/ApplicationsSheet";

interface BusinessData { company_name: string; business_size: string; role_function: string; business_services: string; company_logo?: string }

type Tab = "candidates" | "jobs" | "messages" | "dashboard" | "analytics" | "company";
const URL_TAB: Record<Tab, string> = { candidates: "discover", jobs: "jobs", messages: "messages", dashboard: "overview", analytics: "analytics", company: "company" };

/** Reads existing tab aliases so older links (applications, inbox, dashboard, settings) keep working. */
function resolveTab(params: URLSearchParams): Tab {
  if (params.has("jobId")) return "jobs";
  const t = params.get("tab");
  if (t === "messages" || t === "inbox") return "messages";
  if (t === "overview" || t === "dashboard") return "dashboard";
  if (t === "applications" || t === "jobs") return "jobs";
  if (t === "analytics") return "analytics";
  if (t === "company" || t === "settings" || t === "account") return "company";
  return "candidates";
}

export function MobileEmployerTabs({ businessData }: { businessData: BusinessData | null }) {
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();
  const { canCreateJobs, canEditJobs, canViewAnalytics } = useOrgPermissions();
  const navigate = useNavigate();
  const unreadCount = useUnreadChatCount();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = resolveTab(searchParams);
  const setActiveTab = (tab: Tab) => setSearchParams(prev => { const next = new URLSearchParams(prev); next.set("tab", URL_TAB[tab]); next.delete("jobId"); return next; });

  const [showJobCreator, setShowJobCreator] = useState(false);
  const [stats, setStats] = useState<EmployerStats>({ activeJobs: 0, totalApplications: 0, candidatesViewed: 0, newMatches: 0 });
  const [statsError, setStatsError] = useState(false);
  const [refreshingStats, setRefreshingStats] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [counts, setCounts] = useState<JobCounts>({});
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(false);
  const [sheetJob, setSheetJobState] = useState<{ id: string; title: string } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Keep the sheet mounted while it animates closed so the page never stays locked after dismissal.
  const setSheetJob = (job: { id: string; title: string }) => { setSheetJobState(job); setSheetOpen(true); };

  const loadStats = useCallback(async () => {
    if (!user?.id || !activeOrganization?.id) return;
    setRefreshingStats(true);
    try {
      const [jobsRes, appsRes, swipesRes, matches] = await Promise.all([
        supabase.from("job_listings_v2").select("*", { count: "exact", head: true }).eq("organization_id", activeOrganization.id).eq("is_active", true),
        supabase.from("job_applications_v2").select("*", { count: "exact", head: true }).eq("organization_id", activeOrganization.id),
        supabase.from("swipes").select("*", { count: "exact", head: true }).eq("swiper_user_id", user.id),
        matchService.getMatches(user.id),
      ]);
      if (jobsRes.error || appsRes.error) throw jobsRes.error || appsRes.error;
      setStats({ activeJobs: jobsRes.count || 0, totalApplications: appsRes.count || 0, candidatesViewed: swipesRes.count || 0, newMatches: matches.length });
      setStatsError(false);
    } catch (error) {
      console.error("Error loading employer stats:", error);
      setStatsError(true);
    } finally {
      setRefreshingStats(false);
    }
  }, [user?.id, activeOrganization?.id]);

  const loadJobs = useCallback(async () => {
    if (!user?.id) return;
    setJobsLoading(true);
    try {
      const listings = await jobPostingService.getJobListings(user.id);
      setJobs(listings);
      if (activeOrganization?.id) {
        const { data, error } = await supabase.from("job_applications_v2").select("job_id, status").eq("organization_id", activeOrganization.id);
        if (error) throw error;
        setCounts(countApplications((data as { job_id: string; status: string }[]) || []));
      }
      setJobsError(false);
    } catch (error) {
      console.error("Error loading jobs:", error);
      setJobsError(true);
    } finally {
      setJobsLoading(false);
    }
  }, [user?.id, activeOrganization?.id]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadJobs(); }, [loadJobs]);

  // Deep link: /employer-dashboard?tab=applications&jobId=...
  const deepJobId = searchParams.get("jobId");
  useEffect(() => {
    if (!deepJobId) return;
    setSheetJob({ id: deepJobId, title: jobs.find(j => j.id === deepJobId)?.title || "Job applications" });
  }, [deepJobId, jobs]);

  const refreshAll = () => Promise.all([loadStats(), loadJobs()]);
  const attention = useMemo(() => jobsNeedingAttention(jobs, counts), [jobs, counts]);

  const handleJobCreated = async () => { setShowJobCreator(false); setActiveTab("jobs"); await refreshAll(); };

  const toggleJob = async (job: JobListing) => {
    const ok = await jobPostingService.toggleJobStatus(job.id, !job.is_active);
    if (ok) await refreshAll();
    return ok;
  };

  if (showJobCreator && activeOrganization?.id) {
    return (
      <div className="employer-theme">
        <MobileJobCreator userId={user?.id || ""} organizationId={activeOrganization.id} onComplete={handleJobCreated} onClose={() => setShowJobCreator(false)} companyName={businessData?.company_name} />
      </div>
    );
  }

  const NAV: Array<{ tab: Tab; label: string; icon: typeof Users; also?: Tab[] }> = [
    { tab: "candidates", label: "Discover", icon: Users },
    { tab: "jobs", label: "Jobs", icon: Briefcase },
    { tab: "messages", label: "Inbox", icon: Mail },
    { tab: "dashboard", label: "Home", icon: LayoutDashboard, also: ["analytics"] },
    { tab: "company", label: "Company", icon: Building2 },
  ];
  const fills = activeTab === "candidates" || activeTab === "messages";

  return (
    <div className="employer-theme employer-phone">
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as Tab)} className="flex flex-col flex-1 min-h-0">
        <div className={`flex-1 min-h-0 ${fills ? "overflow-hidden flex flex-col" : "overflow-y-auto overscroll-contain"} employer-scroll-container`}>
          <TabsContent value="dashboard" className="m-0">
            <MobileEmployerDashboard
              businessData={businessData}
              stats={stats}
              statsError={statsError}
              pendingTotal={totalPending(counts)}
              attention={attention}
              jobsLoading={jobsLoading}
              refreshing={refreshingStats}
              canCreateJobs={canCreateJobs}
              canViewAnalytics={canViewAnalytics}
              onRefresh={refreshAll}
              onCreateJob={() => setShowJobCreator(true)}
              onBrowseCandidates={() => setActiveTab("candidates")}
              onManageJobs={() => setActiveTab("jobs")}
              onOpenApplications={job => setSheetJob({ id: job.id, title: job.title })}
              onViewAnalytics={() => setActiveTab("analytics")}
              onOpenInbox={() => setActiveTab("messages")}
            />
          </TabsContent>

          <TabsContent value="jobs" className="m-0">
            <EmployerJobsPanel
              jobs={jobs}
              counts={counts}
              loading={jobsLoading}
              error={jobsError}
              canCreate={canCreateJobs}
              canEdit={canEditJobs}
              onRefresh={loadJobs}
              onCreate={() => setShowJobCreator(true)}
              onToggle={toggleJob}
              onOpenApplications={job => setSheetJob({ id: job.id, title: job.title })}
            />
          </TabsContent>

          <TabsContent value="candidates" className="flex-1 min-h-0 m-0 data-[state=active]:flex flex-col">
            {user?.id && <MobileCandidateBrowser userId={user.id} onBack={() => setActiveTab("dashboard")} employerName={businessData?.company_name || activeOrganization?.name} employerAvatar={businessData?.company_logo || activeOrganization?.logo_url || undefined} />}
          </TabsContent>

          <TabsContent value="messages" className="flex-1 min-h-0 m-0 data-[state=active]:flex flex-col">
            <MobileChatInbox embedded activeThreadId={null} onSelectThread={id => navigate(`/chat/${id}`)} onBack={() => setActiveTab("candidates")} />
          </TabsContent>

          <TabsContent value="analytics" className="m-0">
            <div className="ee-screen">
              <EmployerHeader title="Analytics" onBack={() => setActiveTab("dashboard")} backLabel="Back to home" actions={<button type="button" className="ee-icon-btn" aria-label="Refresh analytics" disabled={refreshingStats} onClick={refreshAll}><RefreshCw size={20} className={refreshingStats ? "animate-spin" : ""} /></button>} />
              <div className="ee-body ee-fade">
                {!canViewAnalytics ? (
                  <EmployerEmpty title="Analytics aren't available for your role" body="Ask an organization admin if you need access." />
                ) : statsError ? (
                  <EmployerEmpty title="Couldn't load analytics" body="Try again in a moment." action={<button className="ee-secondary" onClick={refreshAll}>Try again</button>} />
                ) : (
                  <>
                    <section aria-label="Totals" className="ee-metrics">
                      <div className="ee-metric is-lead"><span className="ee-metric-label">Applications</span><span><span className="ee-metric-value block">{stats.totalApplications}</span><span className="ee-metric-note block">{totalPending(counts)} waiting for a decision</span></span></div>
                      <div className="ee-metric"><span className="ee-metric-label">Open jobs</span><span className="ee-metric-value">{stats.activeJobs}</span></div>
                      <div className="ee-metric"><span className="ee-metric-label">Matches</span><span className="ee-metric-value">{stats.newMatches}</span></div>
                    </section>
                    <div className="ee-metric" style={{ minHeight: 0 }}><span className="ee-metric-label">Candidate profiles reviewed</span><span className="ee-metric-value">{stats.candidatesViewed}</span></div>
                    <EmployerGroup label="Applications per job">
                      {jobs.length === 0 ? <div className="px-4 py-5 text-sm text-muted-foreground">Post a job to see applications per vacancy.</div> :
                        jobs.map(j => <EmployerRow key={j.id} icon={Briefcase} label={j.title} detail={j.is_active ? "Open" : "Closed"} trail={<span className="font-semibold text-foreground">{counts[j.id]?.total ?? 0}</span>} onClick={() => setSheetJob({ id: j.id, title: j.title })} />)}
                    </EmployerGroup>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="company" className="m-0">
            <EmployerCompanyHub onOpenSection={s => navigate(`/organization/settings?section=${s}`)} />
          </TabsContent>
        </div>

        <nav className="employer-phone-nav" aria-label="Employer navigation">
          {NAV.map(({ tab, label, icon: Icon, also }) => {
            const current = activeTab === tab || !!also?.includes(activeTab);
            const isInbox = tab === "messages";
            return (
              <button key={tab} type="button" aria-label={label} aria-current={current ? "page" : undefined} className={current ? "" : "text-muted-foreground"} onClick={() => setActiveTab(tab)}>
                <span className="relative inline-flex self-center"><Icon size={23} aria-hidden="true" />{isInbox && unreadCount > 0 && <span className="employer-unread" aria-hidden="true">{unreadCount > 9 ? "9+" : unreadCount}</span>}</span>
                <span>{label}</span>
                {isInbox && unreadCount > 0 && <span className="sr-only">{unreadCount} unread messages</span>}
              </button>
            );
          })}
        </nav>
      </Tabs>

      {sheetJob && (
        <ApplicationsSheet
          jobId={sheetJob.id}
          jobTitle={sheetJob.title}
          open={sheetOpen}
          onOpenChange={open => {
            if (open) return;
            setSheetOpen(false);
            loadJobs();
            if (searchParams.has("jobId")) setSearchParams(prev => { const next = new URLSearchParams(prev); next.delete("jobId"); return next; }, { replace: true });
          }}
        />
      )}

    </div>
  );
}
