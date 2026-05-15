import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageShell } from "@/components/dashboard/portal/PortalPageShell";
import { LearningJobPostCard } from "@/components/jobs/LearningJobPostCard";
import { CertificationTeaserBanner } from "@/components/jobs/CertificationTeaserBanner";
import { JobDetailPanel } from "@/components/jobs/JobDetailPanel";
import { LearningJobFilters } from "@/components/jobs/LearningJobFilters";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { 
  LearningJobListing, 
  learningJobFeedService,
  LearningFeedFilters 
} from "@/services/learningJobFeedService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function LearningJobFeed() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<LearningJobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<LearningJobListing | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isCertified, setIsCertified] = useState(false);
  const [isTeaser, setIsTeaser] = useState(false);
  const [hasRecommendations, setHasRecommendations] = useState(false);
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

  const filtersAndList = (
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

      <JobDetailPanel
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={handleApply}
        disableApply={!isCertified}
      />
    </>
  );

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
