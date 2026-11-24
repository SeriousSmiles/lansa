import { Illustration } from "@/components/common/Illustration";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Calendar, FileText, Eye } from "lucide-react";
import { useOrgPermissions } from "@/hooks/useOrgPermissions";
import { APPLICATION_STATUS_LABEL, ApplicationStatus } from "@/components/mobile/employer/employerUi";
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
  const { canManageApplications } = useOrgPermissions();
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

  const [filter, setFilter] = useState<"all" | JobApplication['status']>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const visible = filter === "all" ? applications : applications.filter(a => a.status === filter);
  const countOf = (f: string) => f === "all" ? applications.length : applications.filter(a => a.status === f).length;
  const decide = async (id: string, status: JobApplication['status']) => {
    setUpdatingId(id);
    try { await handleStatusUpdate(id, status); } finally { setUpdatingId(null); }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="employer-theme ee-sheet h-[90dvh] flex flex-col gap-0 p-0">
        <SheetHeader className="px-5 pt-6 pb-3 text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Applicants</p>
          <SheetTitle className="ee-title text-2xl font-extrabold leading-tight pr-8 break-words">{jobTitle}</SheetTitle>
        </SheetHeader>
        <div className="px-5 pb-3">
          <div className="ee-chips" role="tablist" aria-label="Application status">
            {(["all", "pending", "accepted", "declined"] as const).map(f => (
              <button key={f} type="button" role="tab" className="ee-chip" aria-selected={filter === f} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : APPLICATION_STATUS_LABEL[f]} <span className="opacity-60">{countOf(f)}</span>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading applicants" />
          </div>
        ) : visible.length === 0 ? (
          <div className="px-5"><div className="ee-empty">
            {applications.length === 0 ? <Illustration name="hiring" size={132} /> : <User className="h-8 w-8 text-muted-foreground" aria-hidden="true" />}
            <h3>{applications.length === 0 ? "No applications yet" : "Nothing in this status"}</h3>
            <p>{applications.length === 0 ? "Applications for this job will appear here." : "Choose another status to see more applicants."}</p>
          </div></div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
            <ul className="flex flex-col gap-3">
              {visible.map((application) => (
                <li key={application.id} className="ee-group p-4 flex flex-col gap-3">
                  <button type="button" className="flex items-start gap-3 text-left w-full" onClick={() => handleViewDetails(application.applicant_user_id)} aria-label={`View profile of ${application.applicant?.name || 'applicant'}`}>
                    <Avatar className="h-14 w-14 rounded-2xl">
                      <AvatarImage src={application.applicant?.profile_image || undefined} className="object-cover object-[center_25%]" />
                      <AvatarFallback className="rounded-2xl bg-primary text-primary-foreground font-bold text-lg">
                        {application.applicant?.name?.[0]?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 min-w-0">
                      <span className="block ee-title font-bold text-[17px] break-words">{application.applicant?.name || 'Applicant'}</span>
                      {application.applicant?.title && <span className="block text-sm text-muted-foreground break-words">{application.applicant.title}</span>}
                      <span className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                      </span>
                    </span>
                    <ApplicationStatus status={application.status} />
                  </button>

                  {application.cover_note && (
                    <div className="rounded-xl bg-muted/60 p-3">
                      <div className="flex items-center gap-2 mb-1"><FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" /><span className="text-sm font-semibold">Cover note</span></div>
                      <p className="text-sm text-muted-foreground line-clamp-4">{application.cover_note}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" className="ee-secondary !min-h-[44px] !px-2 text-sm" onClick={() => handleViewDetails(application.applicant_user_id)}><Eye className="h-4 w-4" /> Profile</button>
                    {application.status === 'pending' && canManageApplications && (
                      <>
                        <button type="button" className="ee-secondary !min-h-[44px] !px-2 text-sm" disabled={updatingId === application.id} onClick={() => decide(application.id, 'declined')}>Decline</button>
                        <button type="button" className="ee-primary !min-h-[44px] !px-2 text-sm" disabled={updatingId === application.id} onClick={() => decide(application.id, 'accepted')}>Accept</button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
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
