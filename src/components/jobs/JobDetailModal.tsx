import { MapPin, Briefcase, DollarSign, Users, ExternalLink, Building2, X, Clock, Bookmark, Share2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JobListing } from "@/services/jobFeedService";
import { useState } from "react";
import { JobImageModal } from "./JobImageModal";
import { formatDistanceToNow } from "date-fns";

interface JobDetailModalProps {
  job: JobListing | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (jobId: string) => void;
}

export function JobDetailModal({ job, isOpen, onClose, onApply }: JobDetailModalProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  if (!job) return null;

  const hasApplied = job.job_applications && job.job_applications.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden animate-scale-in">
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {job.business_profiles && 'logo_url' in job.business_profiles && job.business_profiles.logo_url ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden border">
                <img 
                  src={String(job.business_profiles.logo_url)}
                  alt={job.business_profiles.company_name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <h2 className="font-semibold text-sm line-clamp-1">{job.business_profiles?.company_name}</h2>
              <p className="text-xs text-muted-foreground">Job Details</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Hero Image Section */}
          {job.image_url && (
            <div 
              className="w-full aspect-video bg-muted cursor-pointer hover:opacity-95 transition-opacity relative overflow-hidden group"
              onClick={() => setShowImageModal(true)}
            >
              <img 
                src={job.image_url} 
                alt={job.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Job Title & Meta */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{job.title}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSaved(!isSaved)}
                  className="rounded-full hover:bg-accent flex-shrink-0"
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current text-primary' : ''}`} />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {job.created_at && !isNaN(new Date(job.created_at).getTime())
                    ? `Posted ${formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}`
                    : 'Posted recently'}
                </span>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {job.location && (
                <Card className="border-border">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium truncate">{job.location}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {job.job_type && (
                <Card className="border-border">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Job Type</p>
                      <p className="text-sm font-medium capitalize truncate">{job.job_type.replace('_', ' ')}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {job.salary_range && (
                <Card className="border-border">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Salary</p>
                      <p className="text-sm font-medium truncate">{job.salary_range}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {job.is_remote && <Badge variant="success">Remote</Badge>}
              {job.mode === 'internship' && <Badge variant="secondary">Internship</Badge>}
              {job.category && <Badge variant="outline">{job.category}</Badge>}
            </div>

            {/* Description Section */}
            {job.description && (
              <Card className="border-border">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold text-lg">Job Description</h3>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Skills Section */}
            {job.top_skills && job.top_skills.length > 0 && (
              <Card className="border-border">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold text-lg">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.top_skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm py-1 px-3">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Company Info Section */}
            {job.business_profiles && (
              <Card className="border-border">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-lg">About the Company</h3>
                  <div className="space-y-3">
                    {job.business_profiles.industry && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <span>{job.business_profiles.industry}</span>
                      </div>
                    )}
                    {job.business_profiles.website && (
                      <a
                        href={job.business_profiles.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-primary hover:underline transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ExternalLink className="w-4 h-4 text-primary" />
                        </div>
                        <span>Visit Company Website</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sticky Footer with Actions */}
        <div className="sticky bottom-0 z-10 border-t bg-card/95 backdrop-blur-sm p-6">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            {!hasApplied && (
              <Button
                size="lg"
                onClick={() => onApply(job.id)}
                className="flex-[2] font-semibold"
              >
                Apply Now
              </Button>
            )}
            {hasApplied && (
              <Button
                size="lg"
                variant="outline"
                disabled
                className="flex-[2]"
              >
                ✓ Applied
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
