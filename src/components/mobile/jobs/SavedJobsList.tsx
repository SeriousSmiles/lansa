import { useEffect, useState, useCallback } from "react";
import { Loader2, Bookmark, Trash2 } from "lucide-react";
import { savedJobsService } from "@/services/savedJobsService";
import { JobListing } from "@/services/jobFeedService";
import { JobPostCard } from "@/components/jobs/JobPostCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SavedJobsListProps {
  swiperId: string;
  onApply: (jobId: string) => void;
  onViewDetails: (job: JobListing) => void;
}

export function SavedJobsList({ swiperId, onApply, onViewDetails }: SavedJobsListProps) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await savedJobsService.getSavedJobs(swiperId);
    setJobs(list);
    setLoading(false);
  }, [swiperId]);

  useEffect(() => { load(); }, [load]);

  const handleRemove = async (jobId: string) => {
    try {
      await savedJobsService.removeSavedJob(swiperId, jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast("Removed from Saved");
    } catch {
      toast.error("Couldn't remove");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className="text-center py-16 px-6">
        <Bookmark className="w-8 h-8 text-primary mx-auto mb-3" />
        <p className="text-base text-foreground">Nothing saved yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Swipe right on jobs in Discover to save them here for later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.id} className="relative">
          <JobPostCard
            job={job}
            onApply={onApply}
            onViewDetails={onViewDetails}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRemove(job.id)}
            className="absolute top-3 right-3 h-8 px-2 text-muted-foreground hover:text-rose-500"
            aria-label="Remove from saved"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}