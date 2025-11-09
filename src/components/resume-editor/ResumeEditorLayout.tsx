import { useState } from 'react';
import { TemplateLibrary } from './TemplateLibrary';
import { ResumeCanvas } from './ResumeCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { EditorToolbar } from './EditorToolbar';
import { ResumeTemplate } from '@/hooks/resume/useResumeTemplates';
import { ResumeDesign } from '@/hooks/resume/useResumeDesign';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResumeEditorLayoutProps {
  templates: ResumeTemplate[];
  currentDesign: ResumeDesign | null;
  onDesignChange: (design: ResumeDesign | null) => void;
  onSave: (design: Partial<ResumeDesign>, designId?: string) => Promise<any>;
  canvasState: any;
  onCanvasStateChange: (state: any) => void;
}

export function ResumeEditorLayout({
  templates,
  currentDesign,
  onDesignChange,
  onSave,
  canvasState,
  onCanvasStateChange
}: ResumeEditorLayoutProps) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);

  const handleApplyTemplate = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    
    // Create a design from the template
    const newDesign: ResumeDesign = {
      id: template.id,
      name: template.name,
      template_id: template.id,
      design_json: template.design_json,
      thumbnail_url: template.thumbnail_url,
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    onDesignChange(newDesign);
    onCanvasStateChange({
      ...canvasState,
      template_id: template.id,
      design_json: template.design_json
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <EditorToolbar
        currentDesign={currentDesign}
        onSave={onSave}
        canvasState={canvasState}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Template Library */}
        <div
          className={cn(
            "border-r border-border bg-card transition-all duration-300",
            leftPanelOpen ? "w-80" : "w-0"
          )}
        >
          {leftPanelOpen && (
            <div className="h-full overflow-y-auto p-4">
              <TemplateLibrary
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleApplyTemplate}
              />
            </div>
          )}
        </div>

        {/* Toggle Left Panel */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-r-md rounded-l-none"
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
        >
          {leftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>

        {/* Center Panel - Canvas */}
        <div className="flex-1 bg-muted/30 relative">
          <ResumeCanvas
            design={currentDesign}
            canvasState={canvasState}
            onCanvasStateChange={onCanvasStateChange}
          />
        </div>

        {/* Toggle Right Panel */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-l-md rounded-r-none"
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
        >
          {rightPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>

        {/* Right Panel - Properties */}
        <div
          className={cn(
            "border-l border-border bg-card transition-all duration-300",
            rightPanelOpen ? "w-80" : "w-0"
          )}
        >
          {rightPanelOpen && (
            <div className="h-full overflow-y-auto p-4">
              <PropertiesPanel
                canvasState={canvasState}
                onCanvasStateChange={onCanvasStateChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
