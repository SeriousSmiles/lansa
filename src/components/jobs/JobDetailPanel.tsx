import { useIsMobile } from "@/hooks/use-mobile";
import { LearningJobListing, learningJobFeedService } from "@/services/learningJobFeedService";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Clock, Sparkles, Bookmark, Eye, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface JobDetailPanelProps {
  job: LearningJobListing | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (jobId: string) => void;
  disableApply?: boolean;
}

function JobDetailContent({ job, onApply, disableApply, onClose }: Omit<JobDetailPanelProps, 'isOpen'> & { job: LearningJobListing }) {
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(!!job.user_application_status);
  const [applicationStatus, setApplicationStatus] = useState(job.user_application_status);

  useEffect(() => {
    setHasApplied(!!job.user_application_status);
    setApplicationStatus(job.user_application_status);
    setIsSaved(false);
  }, [job.id, job.user_application_status]);

  const handleApply = () => {
    if (disableApply) {
      toast.error("Complete certification to apply for jobs");
      return;
    }
    onApply(job.id);
    setHasApplied(true);
    setApplicationStatus('pending');
  };

  const handleSave = async () => {
    if (disableApply) {
      toast.error("Complete certification to save jobs");
      return;
    }
    try {
      await learningJobFeedService.recordInteraction(job.id, 'save');
      setIsSaved(true);
      toast.success("Job saved!");
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error("Failed to save job");
    }
  };

  const getJobTypeBadgeVariant = (jobType: string) => {
    const type = jobType.toLowerCase();
    if (type.includes('full')) return 'secondary';
    if (type.includes('part')) return 'success';
    if (type.includes('contract')) return 'purple';
    if (type.includes('internship')) return 'teal';
    return 'default';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border">
          <div className="flex items-start gap-3 sm:gap-4">
            {job.companies?.logo_url ? (
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-muted border border-border">
                <img src={job.companies.logo_url} alt={job.companies.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border">
                <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg sm:text-xl text-foreground line-clamp-2">{job.title}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-sm text-muted-foreground mt-1">
                <span className="font-medium">{job.companies?.name || 'Company'}</span>
                {job.location && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{job.location}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="w-3 h-3" />
                <span>Posted {formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        {job.recommendation_reason && (
          <div className="px-5 sm:px-6 pt-4">
            <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary mb-1">Recommended for you</p>
                <p className="text-sm text-foreground">{job.recommendation_reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Image */}
        {job.image_url && (
          <div className="px-5 sm:px-6 pt-4">
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted border border-border">
              <img src={job.image_url} alt={job.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Details */}
        <div className="px-5 sm:px-6 py-4 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={getJobTypeBadgeVariant(job.job_type)}>
              {learningJobFeedService.prettifyJobType(job.job_type)}
            </Badge>
            <Badge variant="purple">{job.category}</Badge>
            {job.is_remote && <Badge variant="success">Remote</Badge>}
          </div>

          {/* Salary */}
          {job.salary_range && (
            <p className="text-base font-semibold text-foreground">{job.salary_range}</p>
          )}

          {/* Engagement stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{job.view_count ?? 0} views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{job.application_count ?? 0} applications</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">About this role</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Skills */}
          {job.skills_required && job.skills_required.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Company info */}
          {job.companies && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Company</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{job.companies.name}</p>
                {job.companies.industry && <p>Industry: {job.companies.industry}</p>}
                {job.companies.location && <p>Location: {job.companies.location}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="border-t border-border p-4 sm:p-5 bg-background flex flex-col gap-2">
        <Button
          className="w-full font-semibold"
          onClick={handleApply}
          disabled={disableApply || hasApplied}
          variant={hasApplied ? "outline" : "primary"}
        >
          {disableApply
            ? "🔒 Complete Certification"
            : hasApplied
              ? `✓ Applied${applicationStatus ? ` (${applicationStatus})` : ''}`
              : "Apply Now"
          }
        </Button>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleSave}
          disabled={disableApply || isSaved}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          {isSaved ? 'Saved' : 'Save for later'}
        </Button>
      </div>
    </div>
  );
}

export function JobDetailPanel({ job, isOpen, onClose, onApply, disableApply }: JobDetailPanelProps) {
  const isMobile = useIsMobile();

  if (!job) return null;

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{job.title}</DrawerTitle>
            <DrawerDescription>Job details for {job.title}</DrawerDescription>
          </DrawerHeader>
          <JobDetailContent job={job} onApply={onApply} disableApply={disableApply} onClose={onClose} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 flex flex-col">
        <SheetHeader className="sr-only">
          <SheetTitle>{job.title}</SheetTitle>
          <SheetDescription>Job details for {job.title}</SheetDescription>
        </SheetHeader>
        <JobDetailContent job={job} onApply={onApply} disableApply={disableApply} onClose={onClose} />
      </SheetContent>
    </Sheet>
  );
}
