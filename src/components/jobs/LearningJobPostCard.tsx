import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, MapPin, Clock, Sparkles, Bookmark, ThumbsUp, MessageSquare, Share2 } from "lucide-react";
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

  const getJobTypeBadgeVariant = (jobType: string) => {
    const type = jobType.toLowerCase();
    if (type.includes('full')) return 'secondary';
    if (type.includes('part')) return 'success';
    if (type.includes('contract')) return 'purple';
    if (type.includes('internship')) return 'teal';
    return 'default';
  };

  return (
    <Card ref={cardRef} className="w-full overflow-hidden hover:shadow-xl transition-all duration-300 bg-card border-border">
      {/* LinkedIn-style Company Header */}
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex items-start gap-3 sm:gap-4">
          {job.companies?.logo_url ? (
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-muted border border-border">
              <img 
                src={job.companies.logo_url} 
                alt={job.companies.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg mb-1 text-foreground line-clamp-2">{job.title}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
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

      {/* Recommendation Reason - LinkedIn style */}
      {job.recommendation_reason && (
        <div className="px-4 sm:px-6 pt-4 pb-2">
          <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary mb-1">Recommended for you</p>
              <p className="text-sm text-foreground">{job.recommendation_reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Job Image - Square format for 1080x1080 */}
      {job.image_url && (
        <div className="px-4 sm:px-6 pt-4">
          <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted border border-border">
            <img 
              src={job.image_url} 
              alt={job.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Job Details & Description */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Badges - Full width on mobile, wrapped on desktop */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={getJobTypeBadgeVariant(job.job_type)}>
            {learningJobFeedService.prettifyJobType(job.job_type)}
          </Badge>
          <Badge variant="purple">{job.category}</Badge>
          {job.is_remote && (
            <Badge variant="success">
              Remote
            </Badge>
          )}
        </div>

        {/* Description */}
        <div>
          <p className="text-sm text-foreground leading-relaxed line-clamp-3">
            {job.description}
          </p>
        </div>

        {/* Skills */}
        {job.skills_required && job.skills_required.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.skills_required.slice(0, 8).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills_required.length > 8 && (
                <Badge variant="outline" className="text-xs font-semibold">
                  +{job.skills_required.length - 8}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Salary Range */}
        {job.salary_range && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm font-semibold text-foreground">{job.salary_range}</span>
          </div>
        )}
      </div>

      {/* LinkedIn-style Engagement Bar */}
      <div className="px-4 sm:px-6 pb-3 border-t border-border pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground mb-3">
          <span>47 people viewed this</span>
          <span>12 applications</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 pb-3 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-accent w-full justify-center text-muted-foreground hover:text-foreground"
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="hidden sm:inline">Like</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-accent w-full justify-center text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Comment</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-accent w-full justify-center text-muted-foreground hover:text-foreground"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleSave}
            disabled={disableApply || isSaved}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save for later'}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails(job)}
          >
            View Details
          </Button>
          <Button
            className="flex-1 sm:flex-[1.5] font-semibold"
            onClick={handleApply}
            disabled={disableApply}
          >
            {disableApply ? "🔒 Complete Certification" : "Apply Now"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
