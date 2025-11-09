import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Palette, Type, Layout } from 'lucide-react';

interface PropertiesPanelProps {
  canvasState: any;
  onCanvasStateChange: (state: any) => void;
}

export function PropertiesPanel({
  canvasState,
  onCanvasStateChange
}: PropertiesPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Properties</h3>
        <p className="text-sm text-muted-foreground">
          Customize your resume design
        </p>
      </div>

      <Separator />

      {/* Colors Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-medium">Colors</h4>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="primary-color">Primary Color</Label>
            <Input
              id="primary-color"
              type="color"
              defaultValue="#1A1F71"
              className="h-10"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="secondary-color">Secondary Color</Label>
            <Input
              id="secondary-color"
              type="color"
              defaultValue="#F3F4F6"
              className="h-10"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Typography Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-medium">Typography</h4>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="font-family">Font Family</Label>
            <Select defaultValue="inter">
              <SelectTrigger id="font-family">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="roboto">Roboto</SelectItem>
                <SelectItem value="urbanist">Urbanist</SelectItem>
                <SelectItem value="poppins">Poppins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="font-size">Base Font Size</Label>
            <Select defaultValue="14">
              <SelectTrigger id="font-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12pt</SelectItem>
                <SelectItem value="14">14pt</SelectItem>
                <SelectItem value="16">16pt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Sections Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-medium">Sections</h4>
        </div>

        <div className="space-y-3">
          {['Photo', 'Summary', 'Experience', 'Education', 'Skills', 'Languages'].map((section) => (
            <div key={section} className="flex items-center justify-between">
              <Label htmlFor={`show-${section.toLowerCase()}`}>{section}</Label>
              <Switch id={`show-${section.toLowerCase()}`} defaultChecked />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Options */}
      <div className="space-y-3">
        <h4 className="font-medium">Options</h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ats-mode">ATS-Safe Mode</Label>
              <p className="text-xs text-muted-foreground">Optimize for applicant tracking systems</p>
            </div>
            <Switch id="ats-mode" />
          </div>
        </div>
      </div>
    </div>
  );
}
