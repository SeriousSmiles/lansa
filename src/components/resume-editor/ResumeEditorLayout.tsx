import React, { useState } from 'react';
import { ProfileDataReturn } from '@/hooks/useProfileData';
import { SectionInstance, SectionComponentType, GlobalStyles, LayoutStructure } from '@/types/resumeSection';
import { useResumeSections } from '@/hooks/resume/useResumeSections';
import { ResumeCanvas } from './ResumeCanvas';
import { ResumeDocument } from '@/components/resume/ResumeDocument';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { SectionLibrary } from './SectionLibrary';
import { PropertiesPanel } from './PropertiesPanel';
import { EditorToolbar } from './EditorToolbar';
import { AddSectionModal } from './AddSectionModal';
import { LayoutStructureSelector } from './LayoutStructureSelector';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { DesignTokens } from '@/types/designTokens';
import { getTemplatePreset } from '@/config/templatePresets';
import { DocumentPreviewDialog } from './DocumentPreviewDialog';
import { useProfileData } from '@/hooks/useProfileData';
import { useAuth } from '@/contexts/AuthContext';
import { convertProfileToPDFData } from '@/utils/profileToPDFConverter';

interface ResumeEditorLayoutProps {
  profileData: ProfileDataReturn;
  resumeDesignId?: string;
}

export function ResumeEditorLayout({
  profileData,
  resumeDesignId
}: ResumeEditorLayoutProps) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [layoutStructure, setLayoutStructure] = useState<LayoutStructure>('single');
  const [tokens, setTokens] = useState<DesignTokens>(() => getTemplatePreset('professional'));
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const editorProfile = useProfileData(user?.id);
  const pdfData = convertProfileToPDFData(editorProfile);
  const [zoom, setZoom] = useState(0.75);
  const [useLivePreview, setUseLivePreview] = useState(true);

  const { sectionComponents, sectionInstances, setSectionInstances } = useResumeSections(resumeDesignId);

  // Global styles state
  const [globalStyles, setGlobalStyles] = useState<GlobalStyles>({
    fontFamily: 'Inter',
    primaryColor: '#000000',
    secondaryColor: '#666666',
    baseFontSize: 12
  });

  // Initialize with header section if no sections exist
  const sections: SectionInstance[] = sectionInstances.length > 0 
    ? sectionInstances 
    : [{
        id: 'default-header',
        component_type: 'header',
        position: 0,
        zone: 'header',
        width: 'full',
        is_visible: true,
        layout_config: { width: 'full' }
      }];

  const handleAddSection = (type: SectionComponentType, targetZone?: string) => {
    const newSection: SectionInstance = {
      id: `section-${Date.now()}`,
      component_type: type,
      position: sections.length,
      zone: (targetZone as any) || 'main',
      width: 'full',
      is_visible: true,
      layout_config: { width: 'full' }
    };
    
    setSectionInstances([...sections, newSection]);
    setShowAddSectionModal(false);
    toast({
      title: 'Section Added',
      description: `${type} section has been added to your resume.`
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = sections
      .filter(s => s.id !== sectionId)
      .map((s, index) => ({ ...s, position: index }));
    setSectionInstances(updatedSections);
  };

  const handleReorderSections = (reorderedSections: SectionInstance[]) => {
    setSectionInstances(reorderedSections);
  };

  const handleSectionZoneChange = (sectionId: string, newZone: string) => {
    setSectionInstances(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, zone: newZone as any }
          : section
      )
    );
  };

  const handleSectionWidthChange = (sectionId: string, newWidth: 'full' | 'half' | 'third') => {
    setSectionInstances(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, width: newWidth }
          : section
      )
    );
  };

  const handleSave = async () => {
    // TODO: Implement save functionality
    console.log('Saving resume...', sections);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <EditorToolbar
        onSave={handleSave}
        sections={sections}
        tokens={tokens}
        onOpenPreview={() => setPreviewOpen(true)}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Section Library */}
        <div
          className={cn(
            "relative shrink-0 border-r border-border bg-card transition-all duration-300 overflow-hidden",
            leftPanelOpen ? "w-72 xl:w-80" : "w-0 border-r-0"
          )}
        >
          {leftPanelOpen && (
            <div className="h-full overflow-y-auto">
              {useLivePreview ? (
                <div className="p-4 border-b border-border">
                  <p className="text-sm font-semibold">Page layout</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pick a template and structure in the Design panel on the right. Changes show instantly in the preview.
                  </p>
                </div>
              ) : (
                <div className="p-4 border-b border-border">
                  <LayoutStructureSelector
                    currentStructure={layoutStructure}
                    onStructureChange={setLayoutStructure}
                  />
                </div>
              )}
              
              <SectionLibrary
                sections={sections}
                sectionComponents={sectionComponents}
                layoutStructure={layoutStructure}
                onAddSection={() => setShowAddSectionModal(true)}
                onDeleteSection={handleDeleteSection}
                onReorderSections={handleReorderSections}
                onSectionZoneChange={handleSectionZoneChange}
                selectedSectionId={selectedSectionId}
                onSectionSelect={setSelectedSectionId}
              />
            </div>
          )}
        </div>

        {/* Toggle Left Panel */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 self-center h-12 w-5 rounded-none border-y border-r border-border bg-card px-0"
          aria-label={leftPanelOpen ? 'Hide sections panel' : 'Show sections panel'}
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
        >
          {leftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>

        {/* Center Panel - Canvas */}
        <div className="flex-1 min-w-0 bg-muted/30 relative">
          {useLivePreview ? (
            <div className="h-full flex flex-col">
              <div className="p-3 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" aria-label="Reset zoom" onClick={() => setZoom(0.75)}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setUseLivePreview(false)}>
                  Section editor
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-6 lg:p-8">
                <div className="flex items-start justify-center min-h-full w-max min-w-full">
                  <div
                    style={{ zoom } as React.CSSProperties}
                    className="shadow-2xl bg-card"
                  >
                    <ResumeDocument data={pdfData} tokens={tokens} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute top-3 right-3 z-20">
                <Button variant="outline" size="sm" onClick={() => setUseLivePreview(true)}>
                  Live preview
                </Button>
              </div>
              <ResumeCanvas
                sections={sections}
                onSectionsChange={setSectionInstances}
                profileData={profileData}
                globalStyles={globalStyles}
                layoutStructure={layoutStructure}
                selectedSectionId={selectedSectionId}
                onSectionSelect={setSelectedSectionId}
                onAddSectionClick={() => setShowAddSectionModal(true)}
              />
            </>
          )}
        </div>

        {/* Toggle Right Panel */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 self-center h-12 w-5 rounded-none border-y border-l border-border bg-card px-0"
          aria-label={rightPanelOpen ? 'Hide design panel' : 'Show design panel'}
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
        >
          {rightPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>

        {/* Right Panel - Properties */}
        <div
          className={cn(
            "relative shrink-0 border-l border-border bg-card transition-all duration-300 overflow-hidden",
            rightPanelOpen ? "w-80 xl:w-[22rem]" : "w-0 border-l-0"
          )}
        >
          {rightPanelOpen && (
            <PropertiesPanel
              selectedSection={sections.find(s => s.id === selectedSectionId) || null}
              globalStyles={globalStyles}
              layoutStructure={layoutStructure}
              onGlobalStylesChange={setGlobalStyles}
              onSectionUpdate={(sectionId, updates) => {
                setSectionInstances(prev =>
                  prev.map(s => s.id === sectionId ? { ...s, ...updates } : s)
                );
              }}
              onSectionWidthChange={handleSectionWidthChange}
              tokens={tokens}
              onTokensChange={setTokens}
            />
          )}
        </div>
      </div>

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={showAddSectionModal}
        onClose={() => setShowAddSectionModal(false)}
        sectionComponents={sectionComponents}
        onSelectSection={(type) => handleAddSection(type)}
      />

      <DocumentPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={pdfData}
        tokens={tokens}
      />
    </div>
  );
}
