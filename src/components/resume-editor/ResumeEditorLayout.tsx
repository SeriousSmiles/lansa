import { useState } from 'react';
import { ResumeCanvas } from './ResumeCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { EditorToolbar } from './EditorToolbar';
import { SectionLibrary } from './SectionLibrary';
import { AddSectionModal } from './AddSectionModal';
import { ProfileDataReturn } from '@/hooks/useProfileData';
import { SectionInstance, GlobalStyles, SectionComponentType } from '@/types/resumeSection';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResumeSections } from '@/hooks/resume/useResumeSections';

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
    : [
        {
          id: 'header-default',
          component_type: 'header',
          position: 0,
          is_visible: true,
          layout_config: { width: 'full' }
        }
      ];

  const handleAddSection = (componentType: SectionComponentType) => {
    const newSection: SectionInstance = {
      id: `section-${Date.now()}`,
      component_type: componentType,
      position: sections.length,
      is_visible: true,
      layout_config: { width: 'full' }
    };

    setSectionInstances([...sections, newSection]);
    setShowAddSectionModal(false);
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = sections
      .filter(s => s.id !== sectionId)
      .map((s, index) => ({ ...s, position: index }));
    setSectionInstances(updatedSections);
  };

  const handleReorderSections = (fromIndex: number, toIndex: number) => {
    const reordered = [...sections];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    
    const updated = reordered.map((section, index) => ({
      ...section,
      position: index
    }));
    
    setSectionInstances(updated);
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
            <div className="h-full overflow-y-auto p-4">
              <SectionLibrary
                sectionComponents={sectionComponents}
                currentSections={sections}
                onAddSectionClick={() => setShowAddSectionModal(true)}
                onDeleteSection={handleDeleteSection}
                onReorderSections={handleReorderSections}
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
            <div className="h-full overflow-y-auto p-4">
              <PropertiesPanel
                selectedSection={sections.find(s => s.id === selectedSectionId) || null}
                globalStyles={globalStyles}
                onGlobalStylesChange={setGlobalStyles}
                onSectionUpdate={(updates) => {
                  if (selectedSectionId) {
                    const updated = sections.map(s => 
                      s.id === selectedSectionId ? { ...s, ...updates } : s
                    );
                    setSectionInstances(updated);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={showAddSectionModal}
        onClose={() => setShowAddSectionModal(false)}
        sectionComponents={sectionComponents}
        onSelectSection={handleAddSection}
      />
    </div>
  );
}
