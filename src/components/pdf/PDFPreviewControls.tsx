import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface PDFPreviewControlsProps {
  isActualSize: boolean;
  onToggleActualSize: () => void;
  template: string;
  onTemplateChange: (template: string) => void;
  availableTemplates: Array<{ id: string; name: string; }>;
}

export function PDFPreviewControls({ 
  isActualSize, 
  onToggleActualSize, 
  template, 
  onTemplateChange,
  availableTemplates 
}: PDFPreviewControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleActualSize}
        className="flex items-center gap-2"
      >
        {isActualSize ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
        {isActualSize ? 'Fit to View' : 'Actual Size'}
      </Button>
      
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground">Template:</span>
        {availableTemplates.map((t) => (
          <Badge
            key={t.id}
            variant={template === t.id ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => onTemplateChange(t.id)}
          >
            {t.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}