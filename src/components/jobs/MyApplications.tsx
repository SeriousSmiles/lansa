import { useState, useEffect } from "react";
import { Loader2, Calendar, Building2, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { jobFeedService } from "@/services/jobFeedService";
import { JobDetailModal } from "./JobDetailModal";
import { formatDistanceToNow } from "date-fns";

interface Application {
  id: string;
  status: string;
  created_at: string;
  cover_note?: string;
  job: {
    id: string;
    title: string;
    description: string;
    location?: string;
    category: string;
    job_type: string;
    is_remote: boolean;
    salary_range?: string;
    company_name: string;
    company_logo?: string;
  };
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  reviewed: { label: "Reviewed", variant: "default" },
  accepted: { label: "Accepted", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  withdrawn: { label: "Withdrawn", variant: "outline" },
};

export function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const data = await jobFeedService.getMyApplications();
    setApplications(data);
    setLoading(false);
  };

  const handleWithdraw = async (applicationId: string) => {
    const success = await jobFeedService.withdrawApplication(applicationId);
    if (success) {
      loadApplications();
    }
  };

  const handleViewDetails = (app: Application) => {
    // Convert to JobListing format for modal
    setSelectedJob({
      id: app.job.id,
      title: app.job.title,
      description: app.job.description,
      location: app.job.location,
      category: app.job.category,
      job_type: app.job.job_type,
      is_remote: app.job.is_remote,
      salary_range: app.job.salary_range,
      business_profiles: {
        company_name: app.job.company_name,
      },
      organizations: {
        logo_url: app.job.company_logo,
        name: app.job.company_name,
      },
      job_applications: [{ id: app.id, status: app.status, created_at: app.created_at }],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">
          You haven't applied to any jobs yet
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Discover opportunities and start applying!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {applications.map((app) => {
          const status = statusConfig[app.status] || statusConfig.pending;
          
          return (
            <Card 
              key={app.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(app)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <Avatar className="h-12 w-12 rounded-lg flex-shrink-0">
                    <AvatarImage src={app.job.company_logo} alt={app.job.company_name} />
                    <AvatarFallback className="rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </AvatarFallback>
                  </Avatar>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground truncate">
                          {app.job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {app.job.company_name}
                        </p>
                      </div>
                      <Badge variant={status.variant} className="flex-shrink-0">
                        {status.label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {app.job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {app.job.location}
                        </span>
                      )}
                      {app.job.is_remote && (
                        <Badge variant="outline" className="text-xs">Remote</Badge>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Applied {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(app);
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      {app.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWithdraw(app.id);
                          }}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={() => {}} // Already applied, no action needed
      />
    </>
  );
}
