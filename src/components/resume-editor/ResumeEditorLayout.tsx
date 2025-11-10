import { useState } from 'react';
import { ProfileDataReturn } from '@/hooks/useProfileData';
import { SectionInstance, SectionComponentType, GlobalStyles, LayoutStructure } from '@/types/resumeSection';
import { useResumeSections } from '@/hooks/resume/useResumeSections';
import { ResumeCanvas } from './ResumeCanvas';
import { SectionLibrary } from './SectionLibrary';
import { PropertiesPanel } from './PropertiesPanel';
import { EditorToolbar } from './EditorToolbar';
import { AddSectionModal } from './AddSectionModal';
import { LayoutStructureSelector } from './LayoutStructureSelector';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Section Library */}
        <div
          className={cn(
            "border-r border-border bg-card transition-all duration-300",
            leftPanelOpen ? "w-80" : "w-0"
          )}
        >
          {leftPanelOpen && (
            <div className="h-full overflow-y-auto">
              <LayoutStructureSelector
                currentStructure={layoutStructure}
                onStructureChange={setLayoutStructure}
              />
              
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
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-r-md rounded-l-none"
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
        >
          {leftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>

        {/* Center Panel - Canvas */}
        <div className="flex-1 bg-muted/30 relative">
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
    </div>
  );
}
