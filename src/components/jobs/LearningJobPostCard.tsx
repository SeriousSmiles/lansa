import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Building2, MapPin, Clock } from "lucide-react";
import { LearningJobListing, learningJobFeedService } from "@/services/learningJobFeedService";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { getJobLogo } from "@/utils/getJobLogo";

interface LearningJobPostCardProps {
  job: LearningJobListing;
  onViewDetails: (job: LearningJobListing) => void;
}

export function LearningJobPostCard({ job, onViewDetails }: LearningJobPostCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasRecordedView, setHasRecordedView] = useState(false);

  // Record view interaction when card is in viewport
  useEffect(() => {
    if (hasRecordedView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRecordedView) {
            learningJobFeedService.recordInteraction(job.id, 'view').catch(console.error);
            setHasRecordedView(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [job.id, hasRecordedView]);

  const getJobTypeBadgeVariant = (jobType: string) => {
    const type = jobType.toLowerCase();
    if (type.includes('full')) return 'secondary';
    if (type.includes('part')) return 'success';
    if (type.includes('contract')) return 'purple';
    if (type.includes('internship')) return 'teal';
    return 'default';
  };

  return (
    <Card
      ref={cardRef}
      className="w-full max-w-[440px] overflow-hidden hover:shadow-xl transition-all duration-300 bg-card border-border cursor-pointer"
      onClick={() => onViewDetails(job)}
    >
      {/* Company Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {getJobLogo(job) ? (
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-muted border border-border">
              <img
                src={getJobLogo(job)!}
                alt={job.organizations?.name || job.companies?.name || 'Company'}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg mb-0.5 text-foreground line-clamp-2">{job.title}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{job.organizations?.name || job.companies?.name || 'Company'}</span>
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
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Clock className="w-3 h-3" />
              <span>Posted {formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Image */}
      {job.image_url && (
        <div className="px-4 sm:px-5 pb-3">
          <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted border border-border">
            <img
              src={job.image_url}
              alt={job.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Badges + Salary */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={getJobTypeBadgeVariant(job.job_type)}>
            {learningJobFeedService.prettifyJobType(job.job_type)}
          </Badge>
          <Badge variant="purple">{job.category}</Badge>
          {job.is_remote && (
            <Badge variant="success">Remote</Badge>
          )}
        </div>

        {job.salary_range && (
          <p className="text-sm font-semibold text-foreground">{job.salary_range}</p>
        )}
      </div>
    </Card>
  );
}
