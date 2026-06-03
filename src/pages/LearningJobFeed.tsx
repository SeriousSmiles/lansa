import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageShell } from "@/components/dashboard/portal/PortalPageShell";
import { LearningJobPostCard } from "@/components/jobs/LearningJobPostCard";
import { CertificationTeaserBanner } from "@/components/jobs/CertificationTeaserBanner";
import { JobDetailPanel } from "@/components/jobs/JobDetailPanel";
import { LearningJobFilters } from "@/components/jobs/LearningJobFilters";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Search, Bookmark, ChevronLeft, SlidersHorizontal } from "lucide-react";
import { 
  LearningJobListing, 
  learningJobFeedService,
  LearningFeedFilters 
} from "@/services/learningJobFeedService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { JobSwipeDeck } from "@/components/mobile/jobs/JobSwipeDeck";
import { SavedJobsList } from "@/components/mobile/jobs/SavedJobsList";
import { savedJobsService } from "@/services/savedJobsService";
import type { JobListing } from "@/services/jobFeedService";
import { cn } from "@/lib/utils";

type MobileTab = "discover" | "saved";

export default function LearningJobFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [jobs, setJobs] = useState<LearningJobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<LearningJobListing | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isCertified, setIsCertified] = useState(false);
  const [isTeaser, setIsTeaser] = useState(false);
  const [hasRecommendations, setHasRecommendations] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("discover");
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [sessionSwiped, setSessionSwiped] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<LearningFeedFilters>({
    categories: [],
    job_types: [],
    remote_only: false,
    search: "",
  });

  useEffect(() => {
    if (user) {
      checkCertification();
      loadJobs();
    }
  }, [user, filters]);

  useEffect(() => {
    if (!user || !isMobile) return;
    let alive = true;
    savedJobsService.getSwipedJobIds(user.id).then((ids) => {
      if (alive) setSwipedIds(new Set(ids));
    });
    return () => { alive = false; };
  }, [user, isMobile]);

  const checkCertification = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_certifications')
      .select('lansa_certified, verified')
      .eq('user_id', user.id)
      .maybeSingle();

    setIsCertified((data?.lansa_certified && data?.verified) || false);
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await learningJobFeedService.fetchJobs(filters);
      setJobs(response.jobs);
      setIsTeaser(response.teaser);
      setHasRecommendations(response.has_recommendations);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<LearningFeedFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const deckJobs = useMemo(
    () => (jobs as unknown as JobListing[]).filter(
      (j) => !swipedIds.has(j.id) && !sessionSwiped.has(j.id)
    ),
    [jobs, swipedIds, sessionSwiped]
  );

  const handleJobSwiped = (jobId: string) => {
    setSessionSwiped((prev) => {
      const next = new Set(prev);
      next.add(jobId);
      return next;
    });
  };

  const handleApply = async (jobId: string) => {
    if (!isCertified) {
      toast.error("Complete certification to apply for jobs");
      return;
    }

    try {
      const result = await learningJobFeedService.applyForJob(jobId);
      
      if (result.alreadyApplied) {
        toast.info(`You've already applied to this job${result.status ? ` (status: ${result.status})` : ''}`);
      } else {
        toast.success("Application submitted successfully!");
        
        // Update local state to reflect applied status
        setJobs(prevJobs => prevJobs.map(job => 
          job.id === jobId 
            ? { 
                ...job, 
                user_application_status: 'pending', 
                user_applied_at: new Date().toISOString() 
              }
            : job
        ));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    }
  };

  const mobileFilterSheet = showFilters && (
    <div className="mb-4 p-4 rounded-2xl border border-border bg-card">
      <LearningJobFilters filters={filters} onFilterChange={handleFilterChange} />
    </div>
  );

  const filtersAndList = (
    <>
      <>
      {showFilters && (
        <div className="mb-6">
          <LearningJobFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <LearningJobPostCard
              key={job.id}
              job={job}
              onViewDetails={setSelectedJob}
            />
          ))}
        </div>
      )}

      {isTeaser && !loading && (
        <div className="mt-8">
          <CertificationTeaserBanner />
        </div>
      )}

      {!loading && jobs.length === 0 && !isTeaser && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No jobs found matching your criteria. Try adjusting your filters.
          </p>
        </div>
      )}
      </>

      <JobDetailPanel
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={handleApply}
        disableApply={!isCertified}
      />
    </>
  );

  // Mobile: full-bleed swipe surface with slim top bar, no PortalPageShell, no bottom nav (hidden in BottomNav)
  if (isMobile && user) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-background">
        {/* Slim top bar */}
        <div
          className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 bg-background/90 backdrop-blur border-b border-border/40"
          style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex-1 h-8 gap-1.5 rounded-md text-xs",
                mobileTab === "discover" && "bg-background shadow-sm"
              )}
              onClick={() => setMobileTab("discover")}
            >
              <Search className="h-3.5 w-3.5" /> Discover
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex-1 h-8 gap-1.5 rounded-md text-xs",
                mobileTab === "saved" && "bg-background shadow-sm"
              )}
              onClick={() => setMobileTab("saved")}
            >
              <Bookmark className="h-3.5 w-3.5" /> Saved
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setShowFilters((s) => !s)}
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {mobileTab === "saved" ? (
          <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-4">
            <SavedJobsList
              swiperId={user.id}
              onApply={handleApply}
              onViewDetails={(j) => setSelectedJob(j as unknown as LearningJobListing)}
            />
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col px-3 pt-2">
            {mobileFilterSheet}
            {loading ? (
              <div className="flex-1 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <JobSwipeDeck
                jobs={deckJobs}
                swiperId={user.id}
                onOpenDetails={(j) => setSelectedJob(j as unknown as LearningJobListing)}
                onRefresh={loadJobs}
                onJobSwiped={handleJobSwiped}
              />
            )}
          </div>
        )}

        <JobDetailPanel
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
          disableApply={!isCertified}
        />
      </div>
    );
  }

  return (
    <PortalPageShell
      eyebrow="Discover"
      title={
        <span className="inline-flex items-center gap-3">
          Job feed
          {hasRecommendations && <Sparkles className="w-7 h-7 text-primary" />}
        </span>
      }
      subtitle={
        hasRecommendations
          ? "Personalized recommendations based on your profile and preferences."
          : "Browse curated opportunities from verified employers in your sector."
      }
      actions={
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? "Hide" : "Show"} Filters
        </Button>
      }
    >
      {filtersAndList}
    </PortalPageShell>
  );
}
