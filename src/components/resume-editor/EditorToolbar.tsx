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
import { PDFResumeData } from '@/types/pdf';
import { PAPER_DIMENSIONS } from '@/lib/resumeDocumentModel';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_TOKENS } from '@/types/designTokens';
import type { DesignTokens } from '@/types/designTokens';

interface EditorToolbarProps {
  onSave: () => void;
  data: PDFResumeData;
  isSaving?: boolean;
  dirty?: boolean;
  tokens?: DesignTokens;
  onOpenPreview?: () => void;
}

type ExportFormat = 'pdf' | 'pdf-a' | 'docx' | 'png' | 'jpeg';

export function EditorToolbar({ onSave, data: pdfData, tokens, isSaving, dirty, onOpenPreview }: EditorToolbarProps) {
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

  const legacyClientExport = async (format: 'png' | 'jpeg' | 'pdf') => {
    const pagesRoot = document.querySelector<HTMLElement>('[data-resume-pages]');
    if (!pagesRoot || pagesRoot.dataset.resumeReady !== 'true') throw new Error('Please wait for the pages to finish preparing.');
    const pageElements = Array.from(pagesRoot.querySelectorAll<HTMLElement>('[data-resume-document]'));
    const activeTokens = tokens ?? DEFAULT_TOKENS;
    const paper = PAPER_DIMENSIONS[activeTokens.paper];
    const { domToCanvas } = await import('modern-screenshot');
    const { default: jsPDF } = await import('jspdf');
    await document.fonts.ready;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [paper.w, paper.h], compress: true });
    // Temporarily remove editor zoom so pages are captured at true paper size.
    const zoomHost = pagesRoot.parentElement;
    const prevZoom = zoomHost?.style.zoom ?? '';
    if (zoomHost) zoomHost.style.zoom = '1';
    try {
    for (let i = 0; i < pageElements.length; i++) {
      const el = pageElements[i];
      // Browser-native renderer (SVG foreignObject) so output matches the on-screen page exactly.
      const canvas = await domToCanvas(el, {
        scale: 3, backgroundColor: activeTokens.colors.surface,
        width: el.offsetWidth, height: el.offsetHeight,
        style: { boxShadow: 'none', outline: 'none', margin: '0' },
        fetch: { requestInit: { mode: 'cors' }, bypassingCache: true },
      });
      if (format === 'pdf') {
        if (i > 0) pdf.addPage([paper.w, paper.h]);
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, paper.w, paper.h, undefined, 'FAST');
      } else {
        const link = document.createElement('a');
        link.href = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
        link.download = `resume-page-${i + 1}.${format === 'jpeg' ? 'jpg' : format}`; link.click();
      }
    }
    } finally { if (zoomHost) zoomHost.style.zoom = prevZoom; }
    if (format === 'pdf') pdf.save('resume.pdf');
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      toast({
        title: 'Preparing your resume…',
        description: 'Preparing your selected paper size and all pages.',
      });

      const activeTokens: DesignTokens = tokens ?? { ...DEFAULT_TOKENS };
      const options = { format, paper: activeTokens.paper };

      if (format === 'pdf' || format === 'png' || format === 'jpeg') {
        await legacyClientExport(format);
        toast({ title: 'Resume downloaded', description: 'Your file matches the preview exactly.' });
        return;
      }
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
          throw new Error('Word and archival PDF downloads are not available yet. Choose PDF instead.');
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
    <div className="min-h-14 shrink-0 gap-2 flex-wrap py-2 border-b border-border bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        <div className="h-6 w-px bg-border" />

        <h2 className="font-semibold hidden sm:block">Resume Editor</h2>
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
          disabled={isSaving}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving…' : dirty ? 'Save changes' : 'Save'}
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
              PDF
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
