import { Button } from '@/components/ui/button';
import { Save, Download, Home } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { SectionInstance } from '@/types/resumeSection';

interface EditorToolbarProps {
  onSave: () => void;
  sections: SectionInstance[];
}

export function EditorToolbar({ onSave, sections }: EditorToolbarProps) {
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('Error saving resume:', error);
    }
  };

  const handleExport = async (format: 'pdf' | 'png' | 'jpeg') => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`, sections);
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
            <Button size="sm">
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
