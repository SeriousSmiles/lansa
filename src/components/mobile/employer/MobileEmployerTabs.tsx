import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Briefcase, Plus, Eye, CheckCircle2, XCircle, RefreshCw, Mail } from "lucide-react";
import { MobileEmployerDashboard } from "./MobileEmployerDashboard";
import { MobileCandidateBrowser } from "./MobileCandidateBrowser";
import { MobileChatInbox } from "@/components/chat/mobile/MobileChatInbox";
import { MobileJobCreator } from "./MobileJobCreator";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrgPermissions } from "@/hooks/useOrgPermissions";
import { useUnreadChatCount } from "@/hooks/useUnreadChatCount";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { matchService } from "@/services/matchService";
import { jobPostingService, type JobListing } from "@/services/jobPostingService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplicationsSheet } from "@/components/employer/ApplicationsSheet";

interface BusinessData {
  company_name: string;
  business_size: string;
  role_function: string;
  business_services: string;
  company_logo?: string;
}

interface EmployerStats {
  activeJobs: number;
  totalApplications: number;
  candidatesViewed: number;
  newMatches: number;
}

interface MobileEmployerTabsProps {
  businessData: BusinessData | null;
}

export function MobileEmployerTabs({ businessData }: MobileEmployerTabsProps) {
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();
  const { canManageOrgSettings } = useOrgPermissions();
  const navigate = useNavigate();
  const unreadCount = useUnreadChatCount();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const activeTab = searchParams.has('jobId') ? 'jobs' : requestedTab === 'messages' || requestedTab === 'inbox' ? 'messages' : requestedTab === 'overview' || requestedTab === 'dashboard' ? 'dashboard' : requestedTab === 'applications' || requestedTab === 'jobs' ? 'jobs' : requestedTab === 'analytics' ? 'analytics' : 'candidates';
  const setActiveTab = (tab: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab === 'dashboard' ? 'overview' : tab === 'candidates' ? 'discover' : tab);
      next.delete('jobId');
      return next;
    });
  };
  const [showJobCreator, setShowJobCreator] = useState(false);
  
  // Data states
  const [stats, setStats] = useState<EmployerStats>({
    activeJobs: 0,
    totalApplications: 0,
    candidatesViewed: 0,
    newMatches: 0
  });
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>("");
  const [showApplicationsSheet, setShowApplicationsSheet] = useState(false);

  useEffect(() => {
    if (user?.id && activeOrganization?.id) {
      loadEmployerStats();
    }
  }, [user?.id, activeOrganization?.id]);

  useEffect(() => {
    if (user?.id && activeTab === 'jobs') {
      loadJobs();
    }
  }, [user?.id, activeTab]);

  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (!jobId) return;
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobs.find(job => job.id === jobId)?.title || 'Job applications');
    setShowApplicationsSheet(true);
  }, [searchParams, jobs]);

  const loadEmployerStats = async () => {
    if (!user?.id || !activeOrganization?.id) return;

    setIsRefreshingStats(true);
    try {
      // ✅ FIXED: Count active job listings by organization_id (aligned with desktop)
      const { count: jobCount } = await supabase
        .from('job_listings_v2')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', activeOrganization.id)
        .eq('is_active', true);

      // ✅ FIXED: Count organization-wide applications (aligned with desktop)
      const { count: appCount } = await supabase
        .from('job_applications_v2')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', activeOrganization.id);

      // Count total swipes (candidate views)
      const { count: swipeCount } = await supabase
        .from('swipes')
        .select('*', { count: 'exact', head: true })
        .eq('swiper_user_id', user.id);

      // Get matches
      const matches = await matchService.getMatches(user.id);

      setStats({
        activeJobs: jobCount || 0,
        totalApplications: appCount || 0,
        candidatesViewed: swipeCount || 0,
        newMatches: matches.length
      });
    } catch (error) {
      console.error('Error loading employer stats:', error);
    } finally {
      setIsRefreshingStats(false);
    }
  };

  const loadJobs = async () => {
    if (!user?.id) return;

    try {
      setIsLoadingJobs(true);
      const jobListings = await jobPostingService.getJobListings(user.id);
      setJobs(jobListings);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error("Failed to load job listings");
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleCreateJob = () => setShowJobCreator(true);
  const handleBrowseCandidates = () => setActiveTab('candidates');

  // JobPostingWizard owns persistence; completion here only refreshes its result.
  const handleJobCreated = async () => {
    setShowJobCreator(false);
    setActiveTab('jobs');
    await Promise.all([loadEmployerStats(), loadJobs()]);
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const success = await jobPostingService.toggleJobStatus(jobId, !currentStatus);
      if (success) {
        toast.success(`Job ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        await Promise.all([loadJobs(), loadEmployerStats()]);
      }
    } catch (error) {
      console.error('Error toggling job status:', error);
      toast.error("Failed to update job status");
    }
  };

  // Show full-screen components
  if (showJobCreator && activeOrganization?.id) {
    return (
      <MobileJobCreator
        userId={user?.id || ""}
        organizationId={activeOrganization.id}
        onComplete={handleJobCreated}
        onClose={() => setShowJobCreator(false)}
        companyName={businessData?.company_name}
      />
    );
  }

  return (
    <div className="employer-theme employer-phone">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
        <div className={`flex-1 min-h-0 ${activeTab === 'candidates' || activeTab === 'messages' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto overscroll-contain'} employer-scroll-container`}>
          <TabsContent value="dashboard" className="m-0">
            <div className="md:hidden">
              <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
                <h2 className="text-xl font-bold">Hiring workspace</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Refresh hiring workspace"
                  onClick={loadEmployerStats}
                  disabled={isRefreshingStats}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshingStats ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <MobileEmployerDashboard
                userName={user?.displayName || businessData?.company_name || "Employer"}
                businessData={businessData}
                stats={stats}
                onCreateJob={handleCreateJob}
                onBrowseCandidates={handleBrowseCandidates}
                onManageJobs={() => setActiveTab('jobs')}
                onViewAnalytics={() => setActiveTab('analytics')}
                canManageOrgSettings={canManageOrgSettings}
              />
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="m-0 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Job Postings</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Refresh jobs"
                    onClick={loadJobs}
                    disabled={isLoadingJobs}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingJobs ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button onClick={handleCreateJob} size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    New Job
                  </Button>
                </div>
              </div>

              {isLoadingJobs ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">Loading jobs...</p>
                  </CardContent>
                </Card>
              ) : jobs.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Jobs Posted</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start by posting your first job listing
                    </p>
                    <Button onClick={handleCreateJob} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{job.title}</h3>
                              <Badge variant={job.is_active ? "default" : "secondary"}>
                                {job.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {job.location} • {job.job_type?.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Posted {new Date(job.posted_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleToggleJobStatus(job.id, job.is_active)}
                          >
                            {job.is_active ? (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setSelectedJobTitle(job.title);
                              setShowApplicationsSheet(true);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Applications
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="flex-1 min-h-0 m-0 data-[state=active]:flex flex-col">
            {user?.id && <MobileCandidateBrowser userId={user.id} onBack={() => setActiveTab('dashboard')} employerName={businessData?.company_name || activeOrganization?.name} employerAvatar={businessData?.company_logo || activeOrganization?.logo_url || undefined} />}
          </TabsContent>

          <TabsContent value="messages" className="flex-1 min-h-0 m-0 data-[state=active]:flex flex-col">
            <MobileChatInbox embedded activeThreadId={null} onSelectThread={id => navigate(`/chat/${id}`)} onBack={() => setActiveTab('candidates')} />
          </TabsContent>

          <TabsContent value="analytics" className="m-0 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between"><h2 className="text-2xl font-black">Analytics</h2><Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Refresh analytics" disabled={isRefreshingStats} onClick={loadEmployerStats}><RefreshCw size={20} /></Button></div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Active Jobs</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-4xl font-black">{stats.activeJobs}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Candidates Viewed</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-4xl font-black">{stats.candidatesViewed}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Matches</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-4xl font-black">{stats.newMatches}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Applications</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-4xl font-black">{stats.totalApplications}</div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </TabsContent>
        </div>

        <nav className="employer-phone-nav" aria-label="Employer navigation">
          <Button variant="ghost" aria-current={activeTab === 'candidates' ? 'page' : undefined} className={activeTab === 'candidates' ? 'text-primary' : 'text-muted-foreground'} onClick={() => setActiveTab('candidates')}><Users size={23} /><span>Discover</span></Button>
          <Button variant="ghost" aria-current={activeTab === 'jobs' ? 'page' : undefined} className={activeTab === 'jobs' ? 'text-primary' : 'text-muted-foreground'} onClick={() => setActiveTab('jobs')}><Briefcase size={23} /><span>Jobs</span></Button>
          <Button variant="ghost" aria-label="Inbox" aria-current={activeTab === 'messages' ? 'page' : undefined} className={activeTab === 'messages' ? 'text-primary relative' : 'text-muted-foreground relative'} onClick={() => setActiveTab('messages')}><span className="relative"><Mail size={23} />{unreadCount > 0 && <span className="employer-unread">{unreadCount > 9 ? '9+' : unreadCount}</span>}</span><span>Inbox</span>{unreadCount > 0 && <span className="sr-only">{unreadCount} unread messages</span>}</Button>
          <Button variant="ghost" aria-current={activeTab === 'dashboard' || activeTab === 'analytics' ? 'page' : undefined} className={activeTab === 'dashboard' || activeTab === 'analytics' ? 'text-primary' : 'text-muted-foreground'} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={23} /><span>Home</span></Button>
        </nav>
      </Tabs>

      {/* Applications Sheet */}
      {selectedJobId && (
        <ApplicationsSheet
          jobId={selectedJobId}
          jobTitle={selectedJobTitle}
          open={showApplicationsSheet}
          onOpenChange={open => {
            setShowApplicationsSheet(open);
            if (!open && searchParams.has('jobId')) setSearchParams(prev => { const next = new URLSearchParams(prev); next.delete('jobId'); return next; }, { replace: true });
          }}
        />
      )}
    </div>
  );
}