import { MapPin, Briefcase, DollarSign, Users, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobListing } from "@/services/jobFeedService";
import { useState } from "react";
import { JobImageModal } from "./JobImageModal";

interface JobDetailModalProps {
  job: JobListing | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (jobId: string) => void;
}

export function JobDetailModal({ job, isOpen, onClose, onApply }: JobDetailModalProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  
  if (!job) return null;

  const hasApplied = job.job_applications && job.job_applications.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Job Image at top */}
        {job.image_url && (
          <div 
            className="w-full aspect-square -mt-6 -mx-6 mb-4 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowImageModal(true)}
          >
            <img 
              src={job.image_url} 
              alt={job.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="text-2xl">{job.title}</DialogTitle>
          <DialogDescription>
            {job.business_profiles?.company_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            {job.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{job.location}</span>
              </div>
            )}
            {job.job_type && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
              </div>
            )}
            {job.salary_range && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span>{job.salary_range}</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {job.is_remote && <Badge>Remote</Badge>}
            {job.mode === 'internship' && <Badge variant="secondary">Internship</Badge>}
            {job.category && <Badge variant="outline">{job.category}</Badge>}
          </div>

          <Separator />

          {/* Description */}
          {job.description && (
            <div>
              <h3 className="font-semibold mb-2">Job Description</h3>
              <p className="text-sm whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {/* Skills */}
          {job.top_skills && job.top_skills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.top_skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Company Info */}
          {job.business_profiles && (
            <div>
              <h3 className="font-semibold mb-2">About the Company</h3>
              <div className="space-y-2 text-sm">
                {job.business_profiles.industry && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{job.business_profiles.industry}</span>
                  </div>
                )}
                {job.business_profiles.website && (
                  <a
                    href={job.business_profiles.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit Website</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {!hasApplied && (
              <Button onClick={() => onApply(job.id)} className="flex-1">
                Apply Now
              </Button>
            )}
          </div>
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
      </DialogContent>
    </Dialog>
  );
}
