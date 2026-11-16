import { ArrowUpRight, Building2, FileText, Search, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardActionBand } from "./DashboardActionBand";
import { PortalMessagesCard } from "./portal/messages/PortalMessagesCard";

interface EmployerWorkspaceProps {
  stats: { activeJobs: number; totalApplications: number; candidatesViewed: number };
  loading?: boolean;
  onPostJob: () => void;
  onBrowseCandidates: () => void;
  onManageJobs: () => void;
  onViewAnalytics?: () => void;
  onSettings?: () => void;
  children?: React.ReactNode;
}

export function EmployerWorkspace({ stats, loading, onPostJob, onBrowseCandidates, onManageJobs, onViewAnalytics, onSettings, children }: EmployerWorkspaceProps) {
  const hasApplications = stats.totalApplications > 0;
  const hasJobs = stats.activeJobs > 0;
  return (
    <div className="w-full min-w-0 space-y-8">
      <DashboardActionBand
        label="Your next step"
        title={hasApplications ? "Your next hire could be here" : hasJobs ? "Meet the people behind the profiles" : "Make room for your next great hire"}
        description={hasApplications ? "Open your job listings to review applications and continue the conversation." : hasJobs ? "Discover certified professionals and find the right fit for your team." : "Start with an open role. Give people a clear picture of the opportunity."}
        actionLabel={hasApplications ? "Review applications" : hasJobs ? "Browse candidates" : "Post a job"}
        onAction={hasApplications ? onManageJobs : hasJobs ? onBrowseCandidates : onPostJob}
        icon={hasApplications ? Users : hasJobs ? Search : FileText}
        loading={loading}
      />
      <section aria-label="Hiring overview" className="grid grid-cols-3 gap-3 border-b border-border pb-6">
        {[{ label: "Active jobs", value: stats.activeJobs }, { label: "Applications", value: stats.totalApplications }, { label: "Candidates viewed", value: stats.candidatesViewed }].map(item => (
          <div key={item.label} className="min-w-0 border-l-2 border-primary pl-3 sm:pl-5"><p className="text-3xl font-bold tabular-nums text-dashboard-blue-text">{loading ? "—" : item.value}</p><p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">{item.label}</p></div>
        ))}
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="min-w-0 lg:col-span-7 space-y-6">
          <section>
            <h2 className="dashboard-section-title text-lg font-bold mb-4">Your hiring workspace</h2>
            <div className="space-y-3">
              {[{ label: "Job listings & applications", detail: "Your open roles and the people who applied.", icon: FileText, action: onManageJobs }, { label: "Discover candidates", detail: "Real people. Certified skills. A stronger team.", icon: Users, action: onBrowseCandidates }].map(item => (
                <Button key={item.label} variant="outline" onClick={item.action} className="dashboard-shortcut dashboard-shortcut-blue w-full h-auto min-h-28 justify-start p-5 gap-4 whitespace-normal text-left rounded-lg"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-dashboard-blue-text"><item.icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block font-semibold text-base text-foreground">{item.label}</span><span className="block mt-1 text-xs font-normal text-muted-foreground">{item.detail}</span></span><ArrowUpRight className="h-4 w-4 shrink-0 text-dashboard-blue-text" /></Button>
              ))}
            </div>
            <Button variant="outline" className="mt-4 min-h-11" onClick={onPostJob}><FileText className="mr-2 h-4 w-4" />Post a new job</Button>
          </section>
          {children}
        </div>
        <aside className="min-w-0 lg:col-span-5 space-y-7">
          <PortalMessagesCard navigation="route" audience="employer" />
          <section className="border-t border-border pt-5">
            <h2 className="dashboard-section-title text-lg font-bold mb-3">Organization</h2>
            <div className="flex flex-wrap gap-2">
              {onViewAnalytics && <Button variant="outline" onClick={onViewAnalytics}><Building2 className="mr-2 h-4 w-4" />Hiring insights</Button>}
              {onSettings && <Button variant="ghost" onClick={onSettings}><Settings className="mr-2 h-4 w-4" />Settings</Button>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
