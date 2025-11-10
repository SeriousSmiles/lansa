import { SectionInstance, GlobalStyles, LayoutStructure } from '@/types/resumeSection';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PropertiesPanelProps {
  selectedSection: SectionInstance | null;
  globalStyles: GlobalStyles;
  layoutStructure: LayoutStructure;
  onGlobalStylesChange: (styles: GlobalStyles) => void;
  onSectionUpdate: (sectionId: string, updates: Partial<SectionInstance>) => void;
  onSectionWidthChange: (sectionId: string, width: 'full' | 'half' | 'third') => void;
}

export function PropertiesPanel({
  selectedSection,
  globalStyles,
  layoutStructure,
  onGlobalStylesChange,
  onSectionUpdate,
  onSectionWidthChange
}: PropertiesPanelProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Properties</h2>
          <p className="text-sm text-muted-foreground">
            Customize your resume design
          </p>
        </div>

        {/* Global Styles */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Global Styles</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <Input
                id="primary-color"
                type="color"
                value={globalStyles.primaryColor}
                onChange={(e) => onGlobalStylesChange({ ...globalStyles, primaryColor: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <Input
                id="secondary-color"
                type="color"
                value={globalStyles.secondaryColor}
                onChange={(e) => onGlobalStylesChange({ ...globalStyles, secondaryColor: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <Select 
                value={globalStyles.fontFamily}
                onValueChange={(value) => onGlobalStylesChange({ ...globalStyles, fontFamily: value })}
              >
                <SelectTrigger id="font-family">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-size">Base Font Size</Label>
              <Select 
                value={globalStyles.baseFontSize.toString()}
                onValueChange={(value) => onGlobalStylesChange({ ...globalStyles, baseFontSize: parseInt(value) })}
              >
                <SelectTrigger id="font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10pt</SelectItem>
                  <SelectItem value="11">11pt</SelectItem>
                  <SelectItem value="12">12pt</SelectItem>
                  <SelectItem value="14">14pt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Section-Specific Properties */}
        {selectedSection && (
          <>
            <Separator />
            
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Section Properties</h3>
              
              <div className="space-y-4">
                {/* Section Type */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <div className="text-sm font-medium capitalize">
                    {selectedSection.component_type}
                  </div>
                </div>

                {/* Zone */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Zone</Label>
                  <div className="text-sm font-medium capitalize">
                    {selectedSection.zone}
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="section-visible">Visible</Label>
                  <Switch
                    id="section-visible"
                    checked={selectedSection.is_visible}
                    onCheckedChange={(checked) =>
                      onSectionUpdate(selectedSection.id, { is_visible: checked })
                    }
                  />
                </div>

                {/* Section Width */}
                <div className="space-y-2">
                  <Label htmlFor="section-width">Section Width</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedSection.width === 'full' ? 'primary' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => onSectionWidthChange(selectedSection.id, 'full')}
                    >
                      Full
                    </Button>
                    <Button
                      variant={selectedSection.width === 'half' ? 'primary' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => onSectionWidthChange(selectedSection.id, 'half')}
                    >
                      Half
                    </Button>
                    <Button
                      variant={selectedSection.width === 'third' ? 'primary' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => onSectionWidthChange(selectedSection.id, 'third')}
                    >
                      Third
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Width adapts to zone size automatically
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}

        <Separator />

        {/* ATS Mode */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Options</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ats-safe">ATS-Safe Mode</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Optimize resume formatting for Applicant Tracking Systems
              </p>
            </div>
            <Switch id="ats-safe" />
          </div>
        </Card>
      </div>
    </ScrollArea>
  );
}
