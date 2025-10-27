import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, User, Calendar, FileText, Eye, Clock, CheckCircle, XCircle, Undo2 } from "lucide-react";
import { applicationService, JobApplication } from "@/services/applicationService";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ApplicantProfileModal } from "./ApplicantProfileModal";
import { DiscoveryProfile } from "@/services/discoveryService";

interface ApplicationsSheetProps {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationsSheet({ jobId, jobTitle, open, onOpenChange }: ApplicationsSheetProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<DiscoveryProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    if (open && jobId) {
      loadApplications();
    }
  }, [open, jobId]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await applicationService.getApplicationsForJob(jobId);
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load applications",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: JobApplication['status']) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, newStatus);
      toast({
        title: "Status updated",
        description: `Application marked as ${newStatus}`,
      });
      loadApplications();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update application status",
      });
    }
  };

  const handleViewDetails = async (applicantUserId: string) => {
    setSelectedApplicantId(applicantUserId);
    setIsProfileModalOpen(true);
    setIsLoadingProfile(true);
    
    try {
      const profile = await applicationService.getApplicantProfile(applicantUserId);
      setSelectedProfile(profile);
    } catch (error) {
      console.error('Error loading applicant profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load applicant profile",
      });
      setIsProfileModalOpen(false);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedProfile(null);
    setSelectedApplicantId(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': 
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'accepted': 
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'declined': 
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'withdrawn': 
        return <Undo2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      default: 
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle>Applications for {jobTitle}</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-sm text-muted-foreground">
              Applications for this job will appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(85vh-8rem)] mt-4">
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={application.applicant?.profile_image || undefined} />
                      <AvatarFallback>
                        {application.applicant?.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">
                    {application.applicant?.name || 'Anonymous User'}
                  </h4>
                      {application.applicant?.title && (
                        <p className="text-sm text-muted-foreground truncate">
                          {application.applicant.title}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0" title={application.status}>
                      {getStatusIcon(application.status)}
                    </div>
                  </div>

                  {application.cover_note && (
                    <div className="bg-muted/50 rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Cover Note</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {application.cover_note}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(application.applicant_user_id)}
                      className="text-primary border-primary hover:bg-primary hover:text-white"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    {application.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                          onClick={() => handleStatusUpdate(application.id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                          onClick={() => handleStatusUpdate(application.id, 'declined')}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>

      <ApplicantProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        profile={selectedProfile}
        isLoading={isLoadingProfile}
        applicantName={
          applications.find(app => app.applicant_user_id === selectedApplicantId)
            ?.applicant?.name || undefined
        }
      />
    </Sheet>
  );
}
