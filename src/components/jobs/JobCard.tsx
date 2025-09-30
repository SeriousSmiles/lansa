import { MapPin, Briefcase, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobListing } from "@/services/jobFeedService";

interface JobCardProps {
  job: JobListing;
  onApply: (jobId: string) => void;
  onViewDetails: (job: JobListing) => void;
}

export function JobCard({ job, onApply, onViewDetails }: JobCardProps) {
  const hasApplied = job.job_applications && job.job_applications.length > 0;
  const applicationStatus = hasApplied ? job.job_applications[0].status : null;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">{job.title}</h3>
            <p className="text-muted-foreground">
              {job.business_profiles?.company_name}
            </p>
          </div>
          {job.mode === 'internship' && (
            <Badge variant="secondary">Internship</Badge>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
          )}
          {job.job_type && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
            </div>
          )}
          {job.is_remote && (
            <Badge variant="outline">Remote</Badge>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <p className="text-sm line-clamp-3">{job.description}</p>
        )}

        {/* Skills */}
        {job.top_skills && job.top_skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.top_skills.slice(0, 5).map((skill, idx) => (
              <Badge key={idx} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails(job)}
          >
            View Details
          </Button>
          {hasApplied ? (
            <Button
              disabled
              className="flex-1"
              variant="outline"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
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

        {/* Posted time */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
}
