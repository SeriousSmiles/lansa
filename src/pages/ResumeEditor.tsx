import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import { ResumeEditorLayout } from '@/components/resume-editor/ResumeEditorLayout';
import { Loader2 } from 'lucide-react';

export default function ResumeEditor() {
  const { user } = useAuth();
  const profileData = useProfileData(user?.id);

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

  return (
    <ResumeEditorLayout
      profileData={profileData}
      resumeDesignId={undefined}
    />
  );
}
