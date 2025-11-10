import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LayoutStructure } from '@/types/resumeSection';
import { Columns, Columns2, Columns3, LayoutGrid, LayoutPanelLeft } from 'lucide-react';

interface LayoutStructureSelectorProps {
  currentStructure: LayoutStructure;
  onStructureChange: (structure: LayoutStructure) => void;
}

const structures: { value: LayoutStructure; label: string; icon: any; description: string }[] = [
  {
    value: 'single',
    label: 'Single Column',
    icon: Columns,
    description: 'Traditional single column layout'
  },
  {
    value: 'sidebar-left',
    label: 'Left Sidebar',
    icon: LayoutPanelLeft,
    description: 'Main content with left sidebar'
  },
  {
    value: 'sidebar-right',
    label: 'Right Sidebar',
    icon: LayoutGrid,
    description: 'Main content with right sidebar'
  },
  {
    value: 'two-column',
    label: 'Two Columns',
    icon: Columns2,
    description: 'Equal two-column layout'
  },
  {
    value: 'three-column',
    label: 'Three Columns',
    icon: Columns3,
    description: 'Three equal columns'
  }
];

export function LayoutStructureSelector({ currentStructure, onStructureChange }: LayoutStructureSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Page Layout</Label>
      <div className="grid grid-cols-2 gap-2">
        {structures.map((structure) => {
          const Icon = structure.icon;
          const isSelected = currentStructure === structure.value;
          
          return (
            <Card
              key={structure.value}
              className={`p-3 cursor-pointer transition-all hover:border-primary ${
                isSelected ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => onStructureChange(structure.value)}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <div className="font-medium text-xs">{structure.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {structure.description}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
