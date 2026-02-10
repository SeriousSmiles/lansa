import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Download, Home, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { SectionInstance } from '@/types/resumeSection';
import { HTMLToPDFGenerator } from '@/services/htmlToPDFGenerator';
import { useToast } from '@/hooks/use-toast';

interface EditorToolbarProps {
  onSave: () => void;
  sections: SectionInstance[];
}

export function EditorToolbar({ onSave, sections }: EditorToolbarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleSave = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('Error saving resume:', error);
    }
  };

  const handleExport = async (format: 'pdf' | 'png' | 'jpeg') => {
    setIsExporting(true);
    try {
      // Find the resume canvas element
      const canvasElement = document.querySelector('[data-resume-canvas]') as HTMLElement;
      if (!canvasElement) {
        toast({
          title: 'Export Failed',
          description: 'Could not find the resume canvas. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Generating PDF...',
        description: 'Please wait while we create your resume.',
      });

      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(canvasElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: canvasElement.scrollWidth,
        height: canvasElement.scrollHeight,
      });

      if (format === 'pdf') {
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, 297));

        pdf.save('resume.pdf');
      } else {
        // PNG or JPEG
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, 0.95);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `resume.${format}`;
        link.click();
      }

      toast({
        title: 'Export Complete!',
        description: `Your resume has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
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
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
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
