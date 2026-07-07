/**
 * DocumentPreviewDialog — renders <ResumeDocument> with the current
 * DesignTokens exactly as the vector export will produce it.
 * This is the migration bridge: what you preview here is what you export.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResumeDocument } from '@/components/resume/ResumeDocument';
import { DesignTokens } from '@/types/designTokens';
import { PDFResumeData } from '@/types/pdf';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PDFResumeData;
  tokens: DesignTokens;
}

export function DocumentPreviewDialog({ open, onOpenChange, data, tokens }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Export preview</DialogTitle>
          <p className="text-xs text-muted-foreground">
            This matches the exported PDF exactly. Zoom with your browser.
          </p>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-auto bg-muted/40 p-6">
          <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
            <ResumeDocument data={data} tokens={tokens} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}