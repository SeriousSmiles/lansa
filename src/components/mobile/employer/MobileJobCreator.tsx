import { X } from "lucide-react";
import { JobPostingWizard } from "@/components/jobs/JobPostingWizard";
import { JobFormData } from "@/services/jobPostingService";

interface MobileJobCreatorProps {
  onComplete: (jobData: JobFormData) => void;
  onClose: () => void;
  initialData?: Partial<JobFormData>;
  companyName?: string;
  userId: string;
  organizationId: string;
}

export function MobileJobCreator({ 
  onComplete, 
  onClose, 
  initialData = {},
  userId,
  organizationId
}: MobileJobCreatorProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="ee-header" style={{ paddingTop: "calc(6px + env(safe-area-inset-top, 0px))" }}>
        <h1>Post a job</h1>
        <button type="button" className="ee-icon-btn" aria-label="Close job posting" onClick={onClose}><X size={22} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <JobPostingWizard
          userId={userId}
          organizationId={organizationId}
          onComplete={() => {
            onComplete({} as JobFormData);
            onClose();
          }}
          onCancel={onClose}
          initialData={initialData}
          variant="mobile"
        />
      </div>
    </div>
  );
}
