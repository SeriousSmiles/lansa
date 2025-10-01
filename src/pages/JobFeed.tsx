import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobPostCard } from "@/components/jobs/JobPostCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobDetailModal } from "@/components/jobs/JobDetailModal";
import { jobFeedService, JobListing } from "@/services/jobFeedService";
import { useIsMobile } from "@/hooks/use-mobile";
import { SEOHead } from "@/components/SEOHead";
import { PreferenceSetupModal } from "@/components/preferences/PreferenceSetupModal";
import { useJobPreferences } from "@/hooks/useJobPreferences";
import { useAuth } from "@/contexts/AuthContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function JobFeed() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    jobType: 'all',
    isRemote: false,
    search: '',
  });

  const {
    showPreferenceSetup,
    setShowPreferenceSetup,
    refreshPreferences
  } = useJobPreferences();

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const handlePreferenceSetupClose = () => {
    setShowPreferenceSetup(false);
    refreshPreferences();
    loadJobs(); // Reload jobs with new preferences
  };

  const loadJobs = async () => {
    setLoading(true);
    const response = await jobFeedService.fetchJobs({
      category: filters.category !== 'all' ? filters.category : undefined,
      jobType: filters.jobType !== 'all' ? filters.jobType : undefined,
      isRemote: filters.isRemote ? true : undefined,
      search: filters.search || undefined,
    });
    setJobs(response.jobs);
    setLoading(false);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = async (jobId: string) => {
    const success = await jobFeedService.applyForJob(jobId);
    if (success) {
      loadJobs(); // Refresh to show applied status
      setSelectedJob(null);
    }
  };

  return (
    <>
      <SEOHead
        title="Job Opportunities | Lansa"
        description="Discover internships and job opportunities tailored to your profile"
      />
      
      {user && (
        <PreferenceSetupModal
          open={showPreferenceSetup}
          onClose={handlePreferenceSetupClose}
          userId={user.id}
        />
      )}
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Find Opportunities</h1>
                <p className="text-sm text-muted-foreground">
                  Discover jobs and internships that match your profile
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Mobile Filters */}
            {isMobile ? (
              <div className="mb-4">
                <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Filter className="w-4 h-4 mr-2" />
                      {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <JobFilters
                      filters={filters}
                      onFilterChange={handleFilterChange}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ) : (
              /* Desktop Filters Sidebar */
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <JobFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>
            )}

            {/* Jobs Feed */}
            <div className={isMobile ? "col-span-1" : "lg:col-span-3"}>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-lg text-muted-foreground">
                    No opportunities found matching your criteria
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setFilters({
                      category: 'all',
                      jobType: 'all',
                      isRemote: false,
                      search: '',
                    })}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
                  {jobs.map((job) => (
                    <JobPostCard
                      key={job.id}
                      job={job}
                      onApply={handleApply}
                      onViewDetails={setSelectedJob}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Detail Modal */}
        <JobDetailModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
        />
      </div>
    </>
  );
}
