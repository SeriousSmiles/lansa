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
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
        <h2 className="font-semibold text-lg">Create Job Posting</h2>
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
