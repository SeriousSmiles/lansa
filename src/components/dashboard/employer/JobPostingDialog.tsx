import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { JobPostingWizard } from "@/components/jobs/JobPostingWizard";

interface JobListing {
  id: string;
  title: string;
  description: string;
  location: string;
  is_active: boolean;
  skills_required?: any;
  target_user_types?: any;
  category?: string;
  job_type?: string;
  is_remote?: boolean;
  salary_range?: string;
  expires_at?: string;
  posted_at: string;
  company_id: string;
  image_url?: string;
}

interface JobPostingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onJobSaved: () => void;
  editingJob?: JobListing | null;
}


export function JobPostingDialog({ isOpen, onClose, onJobSaved, editingJob }: JobPostingDialogProps) {
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();

  if (!user?.id || !activeOrganization?.id) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {editingJob ? "Edit Job Listing" : "Post New Job"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto -mx-6 px-6" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          <JobPostingWizard
            userId={user.id}
            organizationId={activeOrganization.id}
            onComplete={() => {
              onJobSaved();
              onClose();
            }}
            onCancel={onClose}
            initialData={editingJob ? {
              title: editingJob.title,
              description: editingJob.description,
              location: editingJob.location,
              category: editingJob.category || "",
              jobType: editingJob.job_type || "",
              skills: editingJob.skills_required || [],
              targetUserTypes: editingJob.target_user_types || [],
              isRemote: editingJob.is_remote || false,
              jobImageUrl: editingJob.image_url || ""
            } : {}}
            variant="desktop"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
