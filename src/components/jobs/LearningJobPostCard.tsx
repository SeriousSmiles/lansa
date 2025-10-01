import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, MapPin, Clock, Sparkles, Bookmark } from "lucide-react";
import { LearningJobListing, learningJobFeedService } from "@/services/learningJobFeedService";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface LearningJobPostCardProps {
  job: LearningJobListing;
  onApply: (jobId: string) => void;
  onViewDetails: (job: LearningJobListing) => void;
  disableApply?: boolean;
}

export function LearningJobPostCard({ job, onApply, onViewDetails, disableApply }: LearningJobPostCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasRecordedView, setHasRecordedView] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

  const handleApply = async () => {
    if (disableApply) {
      toast.error("Complete certification to apply for jobs");
      return;
    }
    onApply(job.id);
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

  return (
    <Card ref={cardRef} className="p-6 hover:shadow-lg transition-shadow">
      {/* Job Image */}
      {job.image_url && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img 
            src={job.image_url} 
            alt={job.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {job.companies?.logo_url && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
            <img 
              src={job.companies.logo_url} 
              alt={job.companies.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span>{job.companies?.name || 'Company'}</span>
          </div>
        </div>
      </div>

      {/* Recommendation Reason */}
      {job.recommendation_reason && (
        <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{job.recommendation_reason}</p>
        </div>
      )}

      {/* Job Details */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary">
          {learningJobFeedService.prettifyJobType(job.job_type)}
        </Badge>
        <Badge variant="outline">{job.category}</Badge>
        {job.is_remote && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Remote
          </Badge>
        )}
        {job.location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{job.location}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {job.description}
      </p>

      {/* Skills */}
      {job.skills_required && job.skills_required.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-1">
            {job.skills_required.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills_required.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{job.skills_required.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Salary Range */}
      {job.salary_range && (
        <p className="text-sm font-medium text-primary mb-4">{job.salary_range}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>
            Posted {formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={disableApply || isSaved}
            className="gap-1"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(job)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={disableApply}
          >
            {disableApply ? "🔒 Unlock" : "I'm Interested"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
