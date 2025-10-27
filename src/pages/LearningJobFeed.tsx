import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LearningJobPostCard } from "@/components/jobs/LearningJobPostCard";
import { CertificationTeaserBanner } from "@/components/jobs/CertificationTeaserBanner";
import { JobDetailModal } from "@/components/jobs/JobDetailModal";
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

  return (
    <DashboardLayout 
      userName={user?.email?.split('@')[0] || 'User'} 
      email={user?.email || ''}
    >
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Job Feed
              {hasRecommendations && (
                <Sparkles className="w-6 h-6 text-primary" />
              )}
            </h1>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>
          {hasRecommendations && (
            <p className="text-sm text-muted-foreground">
              Personalized recommendations based on your profile and preferences
            </p>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <LearningJobFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Jobs List */}
        {!loading && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <LearningJobPostCard
                key={job.id}
                job={job}
                onApply={handleApply}
                onViewDetails={setSelectedJob}
                disableApply={!isCertified}
              />
            ))}
          </div>
        )}

        {/* Certification Teaser */}
        {isTeaser && !loading && (
          <div className="mt-8">
            <CertificationTeaserBanner />
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && !isTeaser && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No jobs found matching your criteria. Try adjusting your filters.
            </p>
          </div>
        )}

        {/* Job Detail Modal */}
        {selectedJob && (
          <JobDetailModal
            job={selectedJob as any}
            isOpen={!!selectedJob}
            onClose={() => setSelectedJob(null)}
            onApply={handleApply}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
