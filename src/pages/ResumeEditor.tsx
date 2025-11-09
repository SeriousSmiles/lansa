import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useResumeDesign } from '@/hooks/resume/useResumeDesign';
import { useResumeTemplates } from '@/hooks/resume/useResumeTemplates';
import { useProfileData } from '@/hooks/useProfileData';
import { ResumeEditorLayout } from '@/components/resume-editor/ResumeEditorLayout';
import { Loader2 } from 'lucide-react';

export default function ResumeEditor() {
  const { user } = useAuth();
  const { designs, currentDesign, setCurrentDesign, loading, saveDesign } = useResumeDesign(user?.id);
  const { templates, loading: templatesLoading } = useResumeTemplates();
  const profileData = useProfileData(user?.id);
  const [canvasState, setCanvasState] = useState<any>(null);

  if (loading || templatesLoading || profileData.isLoading) {
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
      templates={templates}
      currentDesign={currentDesign}
      onDesignChange={setCurrentDesign}
      onSave={saveDesign}
      canvasState={canvasState}
      onCanvasStateChange={setCanvasState}
      profileData={profileData}
    />
  );
}
