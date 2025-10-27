import { MapPin, Briefcase, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobListing } from "@/services/jobFeedService";
import { useState } from "react";
import { JobImageModal } from "./JobImageModal";

interface JobPostCardProps {
  job: JobListing;
  onApply: (jobId: string) => void;
  onViewDetails: (job: JobListing) => void;
}

export function JobPostCard({ job, onApply, onViewDetails }: JobPostCardProps) {
  const applied = job.job_applications && job.job_applications.length > 0;
  const [showImageModal, setShowImageModal] = useState(false);
  
  return (
    <Card className="w-full max-w-[400px] overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-card border">
      {job.image_url && (
        <div 
          className="w-full aspect-video bg-muted/10 max-h-64 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setShowImageModal(true)}
        >
          <img 
            src={job.image_url} 
            alt={`${job.title} at ${job.business_profiles?.company_name}`} 
            className="object-cover w-full h-full" 
          />
        </div>
      )}
      <div className="p-5 sm:p-6 space-y-3">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1">{job.title}</h3>
          <p className="text-sm text-muted-foreground">
            {job.business_profiles?.company_name}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {job.location}
            </span>
          )}
          {job.job_type && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> {job.job_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          )}
          {job.is_remote && <Badge variant="outline">Remote</Badge>}
        </div>

        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {job.description}
          </p>
        )}

        {job.top_skills && job.top_skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.top_skills.slice(0, 4).map((skill, idx) => (
              <Badge key={idx} variant="secondary">{skill}</Badge>
            ))}
            {job.top_skills.length > 4 && (
              <Badge variant="outline">+{job.top_skills.length - 4} more</Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => onViewDetails(job)}
          >
            View Details
          </Button>
          {applied ? (
            <Button disabled className="flex-1">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Applied
            </Button>
          ) : (
            <Button 
              className="flex-1" 
              onClick={() => onApply(job.id)}
            >
              I'm Interested
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Posted {new Date(job.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Image Modal */}
      {job.image_url && (
        <JobImageModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          imageUrl={job.image_url}
          jobTitle={job.title}
        />
      )}
    </Card>
  );
}
