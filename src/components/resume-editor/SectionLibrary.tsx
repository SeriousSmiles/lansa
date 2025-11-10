import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionComponent, SectionInstance } from '@/types/resumeSection';
import { Plus, GripVertical, Trash2, Eye, EyeOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SectionLibraryProps {
  sectionComponents: SectionComponent[];
  currentSections: SectionInstance[];
  onAddSectionClick: () => void;
  onDeleteSection: (sectionId: string) => void;
  onReorderSections: (fromIndex: number, toIndex: number) => void;
}

export function SectionLibrary({
  sectionComponents,
  currentSections,
  onAddSectionClick,
  onDeleteSection,
  onReorderSections
}: SectionLibraryProps) {
  
  const getSectionName = (type: string) => {
    const component = sectionComponents.find(c => c.type === type);
    return component?.name || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Resume Sections</h2>
        <Button onClick={onAddSectionClick} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Current Sections */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Current Sections</h3>
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-2">
            {currentSections.length === 0 ? (
              <Card className="p-4 text-center text-sm text-muted-foreground">
                No sections yet. Click "Add" to get started.
              </Card>
            ) : (
              currentSections
                .sort((a, b) => a.position - b.position)
                .map((section) => (
                  <Card key={section.id} className="p-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {getSectionName(section.component_type)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            // Toggle visibility
                          }}
                        >
                          {section.is_visible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                        </Button>
                        {section.component_type !== 'header' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => onDeleteSection(section.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">Quick Actions</div>
        <div className="space-y-1">
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            Design & Font
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            Rearrange Sections
          </Button>
        </div>
      </div>
    </div>
  );
}
