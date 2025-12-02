import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Palette, 
  Check,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { LIGHT_PALETTES, DARK_PALETTES, getContrastRatio, getContrastLevel, type ProfilePalette as PaletteType } from "@/utils/colorUtils";

interface DesignerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: 'light' | 'dark';
  currentPaletteId: string;
  onPaletteChange: (paletteId: string) => Promise<void>;
  onModeToggle: () => Promise<void>;
}

// Combine all palettes for display
const ALL_PALETTES = [...LIGHT_PALETTES, ...DARK_PALETTES];

export function DesignerSidebar({
  isOpen,
  onClose,
  currentMode,
  currentPaletteId,
  onPaletteChange,
  onModeToggle,
}: DesignerSidebarProps) {
  // Local preview state (not saved until Apply)
  const [previewPaletteId, setPreviewPaletteId] = useState<string>(currentPaletteId);
  const [hasChanges, setHasChanges] = useState(false);
  const [contrastRatios, setContrastRatios] = useState<{
    primaryOnSurface: number;
    textOnBackground: number;
    textOnPrimary: number;
  }>({ primaryOnSurface: 0, textOnBackground: 0, textOnPrimary: 0 });

  // Get preview palette for live preview
  const previewPalette = ALL_PALETTES.find(p => p.id === previewPaletteId) || ALL_PALETTES[0];

  // Reset preview when sidebar opens or currentPaletteId changes
  useEffect(() => {
    setPreviewPaletteId(currentPaletteId);
    setHasChanges(false);
  }, [currentPaletteId, isOpen]);

  // Calculate contrast ratios for preview palette
  useEffect(() => {
    if (previewPalette) {
      const primaryOnSurface = getContrastRatio(previewPalette.primary, previewPalette.surface);
      const textOnBackground = getContrastRatio(previewPalette.textPrimary, previewPalette.background);
      const textOnPrimary = getContrastRatio(previewPalette.textOnPrimary, previewPalette.primary);
      
      setContrastRatios({
        primaryOnSurface,
        textOnBackground,
        textOnPrimary,
      });
    }
  }, [previewPaletteId, previewPalette]);

  // Handle palette card click - UPDATE LOCAL STATE ONLY
  const handlePaletteSelect = (paletteId: string) => {
    setPreviewPaletteId(paletteId);
    setHasChanges(paletteId !== currentPaletteId);
  };

  // Handle Apply - SAVE TO DATABASE
  const handleApply = async () => {
    if (hasChanges) {
      await onPaletteChange(previewPaletteId);
      setHasChanges(false);
    }
    onClose();
  };

  // Handle Reset - DISCARD CHANGES
  const handleReset = () => {
    setPreviewPaletteId(currentPaletteId);
    setHasChanges(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[400px] lg:w-[480px] overflow-y-auto p-4 sm:p-6"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Palette className="h-5 w-5" />
            Profile Designer
          </SheetTitle>
        </SheetHeader>

        {/* Color Palettes - All in one list */}
        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">Color Palettes</p>
          
          {/* Light Backgrounds Section */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide mb-2">
              Light Backgrounds
            </p>
            <div className="grid grid-cols-1 gap-3">
              {LIGHT_PALETTES.map((palette) => (
                <Card
                  key={palette.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md relative ${
                    previewPaletteId === palette.id
                      ? 'ring-2 ring-primary shadow-md'
                      : 'hover:ring-1 hover:ring-border'
                  }`}
                  onClick={() => handlePaletteSelect(palette.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{palette.name}</span>
                      {currentPaletteId === palette.id && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 fill-green-100" />
                      )}
                    </div>
                  </div>
                  
                  {/* Color Preview */}
                  <div className="flex gap-2 h-8">
                    <div
                      className="flex-1 rounded border border-border"
                      style={{ backgroundColor: palette.primary }}
                      title="Primary"
                    />
                    <div
                      className="flex-1 rounded border border-border"
                      style={{ backgroundColor: palette.surface }}
                      title="Surface"
                    />
                    <div
                      className="flex-1 rounded border border-border"
                      style={{ backgroundColor: palette.background }}
                      title="Background"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Dark Backgrounds Section */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide mb-2">
              Dark Backgrounds
            </p>
            <div className="grid grid-cols-1 gap-3">
              {DARK_PALETTES.map((palette) => (
                <Card
                  key={palette.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md relative ${
                    previewPaletteId === palette.id
                      ? 'ring-2 ring-primary shadow-md'
                      : 'hover:ring-1 hover:ring-border'
                  }`}
                  onClick={() => handlePaletteSelect(palette.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{palette.name}</span>
                      {currentPaletteId === palette.id && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 fill-green-100" />
                      )}
                    </div>
                  </div>
                  
                  {/* Color Preview */}
                  <div className="flex gap-2 h-8">
                    <div
                      className="flex-1 rounded border border-border"
                      style={{ backgroundColor: palette.primary }}
                      title="Primary"
                    />
                    <div
                      className="flex-1 rounded border border-border"
                      style={{ backgroundColor: palette.surface }}
                      title="Surface"
                    />
                    <div
                      className="flex-1 rounded border border-border"
                      style={{ backgroundColor: palette.background }}
                      title="Background"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Live Preview */}
        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">Live Preview</p>
          <Card 
            className="p-4 overflow-hidden"
            style={{ 
              backgroundColor: previewPalette.surface,
              color: previewPalette.textPrimary,
              borderColor: previewPalette.borderDefault,
            }}
          >
            {/* Mini profile header */}
            <div 
              className="p-3 rounded-lg mb-3 -mx-4 -mt-4"
              style={{ backgroundColor: previewPalette.primary }}
            >
              <h4 
                className="font-semibold text-sm"
                style={{ color: previewPalette.textOnPrimary }}
              >
                Your Name
              </h4>
              <p 
                className="text-xs opacity-90"
                style={{ color: previewPalette.textOnPrimary }}
              >
                Your Title
              </p>
            </div>

            {/* Sample content */}
            <div className="space-y-2">
              <h5 
                className="font-semibold text-xs"
                style={{ color: previewPalette.primary }}
              >
                About Me
              </h5>
              <p 
                className="text-xs leading-relaxed"
                style={{ color: previewPalette.textSecondary }}
              >
                This is how your profile text will look with the selected palette.
              </p>

              {/* Sample skill badges */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <Badge 
                  variant="secondary"
                  className="text-xs"
                  style={{ 
                    backgroundColor: `${previewPalette.primary}15`,
                    color: previewPalette.primary,
                    borderColor: `${previewPalette.primary}30`,
                  }}
                >
                  Skill 1
                </Badge>
                <Badge 
                  variant="secondary"
                  className="text-xs"
                  style={{ 
                    backgroundColor: `${previewPalette.primary}15`,
                    color: previewPalette.primary,
                    borderColor: `${previewPalette.primary}30`,
                  }}
                >
                  Skill 2
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Contrast Check */}
        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">Contrast Check</p>
          <Card className="p-4 space-y-3">
            {/* Headings contrast */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Headings on Cards</p>
                <p className="text-xs text-muted-foreground">
                  {contrastRatios.primaryOnSurface.toFixed(2)}:1 ratio
                </p>
              </div>
              <Badge 
                variant={getContrastLevel(contrastRatios.primaryOnSurface) === 'Fail' ? 'destructive' : 'default'}
                className="text-xs"
              >
                {getContrastLevel(contrastRatios.primaryOnSurface) === 'Fail' ? '❌' : '✅'} {getContrastLevel(contrastRatios.primaryOnSurface)}
              </Badge>
            </div>

            <Separator />

            {/* Body text contrast */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Body Text</p>
                <p className="text-xs text-muted-foreground">
                  {contrastRatios.textOnBackground.toFixed(2)}:1 ratio
                </p>
              </div>
              <Badge 
                variant={getContrastLevel(contrastRatios.textOnBackground) === 'Fail' ? 'destructive' : 'default'}
                className="text-xs"
              >
                {getContrastLevel(contrastRatios.textOnBackground) === 'Fail' ? '❌' : '✅'} {getContrastLevel(contrastRatios.textOnBackground)}
              </Badge>
            </div>

            <Separator />

            {/* Text on primary contrast */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Header Text</p>
                <p className="text-xs text-muted-foreground">
                  {contrastRatios.textOnPrimary.toFixed(2)}:1 ratio
                </p>
              </div>
              <Badge 
                variant={getContrastLevel(contrastRatios.textOnPrimary) === 'Fail' ? 'destructive' : 'default'}
                className="text-xs"
              >
                {getContrastLevel(contrastRatios.textOnPrimary) === 'Fail' ? '❌' : '✅'} {getContrastLevel(contrastRatios.textOnPrimary)}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex gap-3">
            {hasChanges && (
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex-1"
                size="lg"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button 
              onClick={handleApply} 
              className="flex-1"
              size="lg"
              disabled={!hasChanges}
            >
              <Check className="h-4 w-4 mr-2" />
              {hasChanges ? "Apply Changes" : "No Changes"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
