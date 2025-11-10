import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { SectionInstance, GlobalStyles } from '@/types/resumeSection';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface PropertiesPanelProps {
  selectedSection: SectionInstance | null;
  globalStyles: GlobalStyles;
  onGlobalStylesChange: (styles: GlobalStyles) => void;
  onSectionUpdate: (updates: Partial<SectionInstance>) => void;
}

export function PropertiesPanel({ 
  selectedSection, 
  globalStyles, 
  onGlobalStylesChange,
  onSectionUpdate 
}: PropertiesPanelProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Properties</h2>
          <p className="text-sm text-muted-foreground">
            Customize your resume design
          </p>
        </div>

        <Separator />

        {/* Global Styles Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Global Styles</h3>
          
          <div className="space-y-2">
            <Label htmlFor="primary-color" className="text-sm">Primary Color</Label>
            <Input
              id="primary-color"
              type="color"
              value={globalStyles.primaryColor}
              onChange={(e) => onGlobalStylesChange({ ...globalStyles, primaryColor: e.target.value })}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color" className="text-sm">Secondary Color</Label>
            <Input
              id="secondary-color"
              type="color"
              value={globalStyles.secondaryColor}
              onChange={(e) => onGlobalStylesChange({ ...globalStyles, secondaryColor: e.target.value })}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-family" className="text-sm">Font Family</Label>
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
            <Label htmlFor="font-size" className="text-sm">Base Font Size</Label>
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

        <Separator />

        {/* Section-Specific Properties */}
        {selectedSection && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Section: {selectedSection.component_type}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="section-visible" className="text-sm">Visible</Label>
                <Switch 
                  id="section-visible" 
                  checked={selectedSection.is_visible}
                  onCheckedChange={(checked) => onSectionUpdate({ is_visible: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section-width" className="text-sm">Width</Label>
                <Select 
                  value={selectedSection.layout_config.width || 'full'}
                  onValueChange={(value) => onSectionUpdate({ 
                    layout_config: { ...selectedSection.layout_config, width: value as any }
                  })}
                >
                  <SelectTrigger id="section-width">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Width</SelectItem>
                    <SelectItem value="half">Half Width</SelectItem>
                    <SelectItem value="third">Third Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* ATS Mode */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Options</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ats-safe" className="text-sm">ATS-Safe Mode</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Optimize resume formatting for Applicant Tracking Systems
              </p>
            </div>
            <Switch id="ats-safe" />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
