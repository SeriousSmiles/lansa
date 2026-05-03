import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import { ResumeEditorLayout } from '@/components/resume-editor/ResumeEditorLayout';
import { Loader2 } from 'lucide-react';
import { usePortalMode } from '@/hooks/usePortalMode';
import { PortalPageShell } from '@/components/dashboard/portal/PortalPageShell';

export default function ResumeEditor() {
  const { user } = useAuth();
  const profileData = useProfileData(user?.id);
  const { portalV2 } = usePortalMode();

  if (profileData.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading Resume Editor...</p>
        </div>
      </div>
    );
  }

  if (portalV2) {
    return (
      <PortalPageShell fullBleed>
        <ResumeEditorLayout
          profileData={profileData}
          resumeDesignId={undefined}
        />
      </PortalPageShell>
    );
  }

  return (
    <ResumeEditorLayout
      profileData={profileData}
      resumeDesignId={undefined}
    />
  );
}
