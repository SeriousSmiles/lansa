import { Button } from '@/components/ui/button';
import { ResumeDesign } from '@/hooks/resume/useResumeDesign';
import { useResumeExport } from '@/hooks/resume/useResumeExport';
import { Save, Download, Eye, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EditorToolbarProps {
  currentDesign: ResumeDesign | null;
  onSave: (design: Partial<ResumeDesign>, designId?: string) => Promise<any>;
  canvasState: any;
}

export function EditorToolbar({
  currentDesign,
  onSave,
  canvasState
}: EditorToolbarProps) {
  const navigate = useNavigate();
  const { exportResume, isExporting } = useResumeExport();

  const handleSave = async () => {
    if (!canvasState) return;

    await onSave(
      {
        name: currentDesign?.name || 'My Resume',
        design_json: canvasState,
      },
      currentDesign?.id
    );
  };

  const handleExport = async (format: 'pdf' | 'png' | 'jpeg') => {
    await exportResume(currentDesign?.id, canvasState, {
      format,
      dpi: 300,
      include_photo: true
    });
  };

  return (
    <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        <div className="h-6 w-px bg-border" />

        <h2 className="font-semibold">Resume Editor</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" disabled={isExporting}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('png')}>
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('jpeg')}>
              Export as JPEG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
