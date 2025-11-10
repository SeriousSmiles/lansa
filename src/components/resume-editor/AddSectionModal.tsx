import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { SectionComponent, SectionComponentType } from '@/types/resumeSection';
import { 
  User, FileText, Briefcase, GraduationCap, Wrench, 
  Globe, FolderOpen, Award, Trophy 
} from 'lucide-react';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionComponents: SectionComponent[];
  onSelectSection: (type: SectionComponentType) => void;
}

const iconMap: Record<string, any> = {
  'User': User,
  'FileText': FileText,
  'Briefcase': Briefcase,
  'GraduationCap': GraduationCap,
  'Wrench': Wrench,
  'Globe': Globe,
  'FolderOpen': FolderOpen,
  'Award': Award,
  'Trophy': Trophy,
};

export function AddSectionModal({
  isOpen,
  onClose,
  sectionComponents,
  onSelectSection
}: AddSectionModalProps) {
  
  const handleSelect = (type: SectionComponentType) => {
    onSelectSection(type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Section</DialogTitle>
          <DialogDescription>
            Choose a section to add to your resume
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          {sectionComponents.map((component) => {
            const Icon = iconMap[component.icon] || FileText;
            
            return (
              <Card
                key={component.id}
                className="p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all"
                onClick={() => handleSelect(component.type)}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{component.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {component.description}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
