import { useState } from 'react';
import { SectionInstance, SectionComponent, LayoutStructure, ZoneName } from '@/types/resumeSection';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Eye, EyeOff, GripVertical, MoveHorizontal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SectionLibraryProps {
  sections: SectionInstance[];
  sectionComponents: SectionComponent[];
  layoutStructure: LayoutStructure;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
  onReorderSections: (sections: SectionInstance[]) => void;
  onSectionZoneChange: (sectionId: string, newZone: string) => void;
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string | null) => void;
}

export function SectionLibrary({
  sections,
  sectionComponents,
  layoutStructure,
  onAddSection,
  onDeleteSection,
  onReorderSections,
  onSectionZoneChange,
  selectedSectionId,
  onSectionSelect
}: SectionLibraryProps) {
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  
  const getSectionName = (type: string) => {
    const component = sectionComponents.find(c => c.type === type);
    return component?.name || type;
  };

  const getZoneName = (zone: ZoneName) => {
    const names: Record<ZoneName, string> = {
      header: 'Header',
      leftSidebar: 'Left Sidebar',
      main: 'Main',
      rightSidebar: 'Right Sidebar',
      footer: 'Footer'
    };
    return names[zone] || zone;
  };

  const getAvailableZones = (): ZoneName[] => {
    switch (layoutStructure) {
      case 'single':
        return ['header', 'main'];
      case 'sidebar-left':
      case 'two-column':
        return ['header', 'leftSidebar', 'main'];
      case 'sidebar-right':
        return ['header', 'main', 'rightSidebar'];
      case 'three-column':
        return ['header', 'leftSidebar', 'main', 'rightSidebar'];
      default:
        return ['header', 'main'];
    }
  };

  const sectionsByZone = sections.reduce((acc, section) => {
    const zone = section.zone || 'main';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(section);
    return acc;
  }, {} as Record<string, SectionInstance[]>);

  const availableZones = getAvailableZones();

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSection(sectionId);
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    
    if (!draggedSection || draggedSection === targetSectionId) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }

    const draggedIdx = sections.findIndex(s => s.id === draggedSection);
    const targetIdx = sections.findIndex(s => s.id === targetSectionId);
    
    if (draggedIdx === -1 || targetIdx === -1) return;

    // Check if both sections are in the same zone
    const draggedSec = sections[draggedIdx];
    const targetSec = sections[targetIdx];
    
    if (draggedSec.zone !== targetSec.zone) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }

    // Reorder sections
    const newSections = [...sections];
    const [removed] = newSections.splice(draggedIdx, 1);
    newSections.splice(targetIdx, 0, removed);
    
    // Update positions
    const updated = newSections.map((s, idx) => ({ ...s, position: idx }));
    
    onReorderSections(updated);
    setDraggedSection(null);
    setDragOverSection(null);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
    setDragOverSection(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-2">Resume Sections</h2>
        <Button onClick={onAddSection} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {availableZones.map(zoneName => {
            const zoneSections = sectionsByZone[zoneName] || [];
            if (zoneSections.length === 0) return null;

            return (
              <div key={zoneName} className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                  {getZoneName(zoneName)}
                </Label>
                
                <div className="space-y-2">
                  {zoneSections.map((section) => (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, section.id)}
                      onDragOver={(e) => handleDragOver(e, section.id)}
                      onDrop={(e) => handleDrop(e, section.id)}
                      onDragEnd={handleDragEnd}
                      className={`group p-3 border border-border rounded-lg transition-all hover:border-primary cursor-pointer ${
                        selectedSectionId === section.id ? 'border-primary bg-primary/5' : ''
                      } ${draggedSection === section.id ? 'opacity-50' : ''} ${
                        dragOverSection === section.id && draggedSection !== section.id ? 'border-t-4 border-t-primary' : ''
                      }`}
                      onClick={() => onSectionSelect(section.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {getSectionName(section.component_type)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Width: {section.width}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoveHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {availableZones.map(zone => (
                                <DropdownMenuItem
                                  key={zone}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSectionZoneChange(section.id, zone);
                                  }}
                                >
                                  Move to {getZoneName(zone)}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onReorderSections(
                                sections.map(s =>
                                  s.id === section.id
                                    ? { ...s, is_visible: !s.is_visible }
                                    : s
                                )
                              );
                            }}
                          >
                            {section.is_visible ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>

                          {section.component_type !== 'header' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSection(section.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {sections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No sections yet. Click "Add Section" to get started.
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator />
      
      <div className="p-4">
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Click sections to edit</div>
          <div>• Use <MoveHorizontal className="w-3 h-3 inline" /> to move between zones</div>
          <div>• Drag sections to reorder</div>
        </div>
      </div>
    </div>
  );
}
