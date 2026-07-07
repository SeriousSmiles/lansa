import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Download, Home, Loader2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { SectionInstance } from '@/types/resumeSection';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import { convertProfileToPDFData } from '@/utils/profileToPDFConverter';
import { DEFAULT_TOKENS } from '@/types/designTokens';
import type { DesignTokens } from '@/types/designTokens';

interface EditorToolbarProps {
  onSave: () => void;
  sections: SectionInstance[];
  tokens?: DesignTokens;
  onOpenPreview?: () => void;
}

type ExportFormat = 'pdf' | 'pdf-a' | 'docx' | 'png' | 'jpeg';

export function EditorToolbar({ onSave, sections, tokens, onOpenPreview }: EditorToolbarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const profileData = useProfileData(user?.id);
  const [isExporting, setIsExporting] = useState(false);

  const handleSave = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('Error saving resume:', error);
    }
  };

  const legacyClientExport = async (format: 'png' | 'jpeg' | 'pdf') => {
    const canvasElement = document.querySelector('[data-resume-canvas]') as HTMLElement;
    if (!canvasElement) throw new Error('Canvas not found');
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(canvasElement, {
      scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff',
      width: canvasElement.scrollWidth, height: canvasElement.scrollHeight,
    });
    if (format === 'pdf') {
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, 297));
      pdf.save('resume.pdf');
    } else {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `resume.${format}`;
      link.click();
    }
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      toast({
        title: 'Preparing your resume…',
        description: 'Rendering pixel-perfect vector output.',
      });

      const pdfData = convertProfileToPDFData(profileData);
      const activeTokens: DesignTokens = tokens ?? { ...DEFAULT_TOKENS };
      const options = { format, paper: activeTokens.paper };

      const { data, error } = await supabase.functions.invoke('export-resume', {
        body: {
          data: pdfData,
          tokens: activeTokens,
          options,
          app_origin: window.location.origin,
        },
      });

      // Worker not deployed yet → 202 with fallback flag
      const needsFallback = !data?.file_url && (data?.fallback === 'client_render' || error);
      if (needsFallback) {
        if (format === 'docx' || format === 'pdf-a') {
          throw new Error('DOCX and PDF/A require the render worker. Deploy render-worker/ to Fly.io and set RENDER_WORKER_URL.');
        }
        console.warn('Vector engine unavailable, falling back to client render', data, error);
        await legacyClientExport(format as 'pdf' | 'png' | 'jpeg');
      } else if (data?.file_url) {
        const link = document.createElement('a');
        link.href = data.file_url;
        const ext = format === 'jpeg' ? 'jpg' : format === 'pdf-a' ? 'pdf' : format;
        link.download = `resume.${ext}`;
        link.rel = 'noopener';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (error) {
        throw error;
      }

      toast({
        title: 'Export complete',
        description: `Downloaded as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: (error as Error)?.message ?? 'There was an error exporting your resume.',
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
        {onOpenPreview ? (
          <Button variant="outline" size="sm" onClick={onOpenPreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        ) : null}
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
              PDF (vector)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf-a')}>
              PDF/A (archival)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('docx')}>
              Word (.docx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('png')}>
              PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('jpeg')}>
              JPEG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
