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
  Sun, 
  Moon, 
  Palette, 
  ChevronDown, 
  ChevronRight,
  Check
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LIGHT_PALETTES, DARK_PALETTES, getContrastRatio, getContrastLevel, type ProfilePalette as PaletteType } from "@/utils/colorUtils";

interface DesignerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: 'light' | 'dark';
  currentPaletteId: string;
  onPaletteChange: (paletteId: string) => Promise<void>;
  onModeToggle: () => Promise<void>;
}

export function DesignerSidebar({
  isOpen,
  onClose,
  currentMode,
  currentPaletteId,
  onPaletteChange,
  onModeToggle,
}: DesignerSidebarProps) {
  const [selectedPalette, setSelectedPalette] = useState<PaletteType | null>(null);
  const [isFineTuneOpen, setIsFineTuneOpen] = useState(false);
  const [contrastRatio, setContrastRatio] = useState<number>(0);

  const palettes = currentMode === 'light' ? LIGHT_PALETTES : DARK_PALETTES;
  const activePalette = palettes.find(p => p.id === currentPaletteId) || palettes[0];

  useEffect(() => {
    setSelectedPalette(activePalette);
    // Calculate contrast ratio for preview
    if (activePalette) {
      const ratio = getContrastRatio(activePalette.primary, activePalette.surface);
      setContrastRatio(ratio);
    }
  }, [activePalette, currentPaletteId]);

  const handlePaletteSelect = async (paletteId: string) => {
    await onPaletteChange(paletteId);
  };

  const handleModeChange = async () => {
    await onModeToggle();
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

        {/* Mode Selector */}
        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">Theme Mode</p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={currentMode === 'light' ? 'primary' : 'outline'}
              onClick={handleModeChange}
              disabled={currentMode === 'light'}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Sun className="h-6 w-6" />
              <span className="text-sm font-medium">Light</span>
            </Button>
            <Button
              variant={currentMode === 'dark' ? 'primary' : 'outline'}
              onClick={handleModeChange}
              disabled={currentMode === 'dark'}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Moon className="h-6 w-6" />
              <span className="text-sm font-medium">Dark</span>
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Quick Palettes */}
        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">Quick Palettes</p>
          <div className="grid grid-cols-1 gap-3">
            {palettes.map((palette) => (
              <Card
                key={palette.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  currentPaletteId === palette.id
                    ? 'ring-2 ring-primary shadow-md'
                    : 'hover:ring-1 hover:ring-border'
                }`}
                onClick={() => handlePaletteSelect(palette.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{palette.name}</span>
                    {currentPaletteId === palette.id && (
                      <Check className="h-4 w-4 text-primary" />
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

        <Separator className="my-6" />

        {/* Live Preview */}
        {selectedPalette && (
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">Live Preview</p>
            <Card 
              className="p-4 overflow-hidden"
              style={{ 
                backgroundColor: selectedPalette.surface,
                color: selectedPalette.textPrimary,
                borderColor: selectedPalette.borderDefault,
              }}
            >
              {/* Mini profile header */}
              <div 
                className="p-3 rounded-lg mb-3 -mx-4 -mt-4"
                style={{ backgroundColor: selectedPalette.primary }}
              >
                <h4 
                  className="font-semibold text-sm"
                  style={{ color: selectedPalette.textOnPrimary }}
                >
                  Your Name
                </h4>
                <p 
                  className="text-xs opacity-90"
                  style={{ color: selectedPalette.textOnPrimary }}
                >
                  Your Title
                </p>
              </div>

              {/* Sample content */}
              <div className="space-y-2">
                <h5 
                  className="font-semibold text-xs"
                  style={{ color: selectedPalette.primary }}
                >
                  About Me
                </h5>
                <p 
                  className="text-xs leading-relaxed"
                  style={{ color: selectedPalette.textSecondary }}
                >
                  This is how your profile text will look with the selected palette.
                </p>

                {/* Sample skill badges */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <Badge 
                    variant="secondary"
                    className="text-xs"
                    style={{ 
                      backgroundColor: `${selectedPalette.primary}15`,
                      color: selectedPalette.primary,
                      borderColor: `${selectedPalette.primary}30`,
                    }}
                  >
                    Skill 1
                  </Badge>
                  <Badge 
                    variant="secondary"
                    className="text-xs"
                    style={{ 
                      backgroundColor: `${selectedPalette.primary}15`,
                      color: selectedPalette.primary,
                      borderColor: `${selectedPalette.primary}30`,
                    }}
                  >
                    Skill 2
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Contrast Check */}
        {contrastRatio > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">Contrast Check</p>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Readability Score</p>
                  <p className="text-xs text-muted-foreground">
                    {contrastRatio.toFixed(2)}:1 ratio
                  </p>
                </div>
                <Badge 
                  variant={getContrastLevel(contrastRatio) === 'Fail' ? 'destructive' : 'default'}
                  className="text-sm"
                >
                  {getContrastLevel(contrastRatio) === 'Fail' ? '❌' : '✅'} {getContrastLevel(contrastRatio)}
                </Badge>
              </div>
            </Card>
          </div>
        )}

        {/* Fine Tune (Collapsible) */}
        <Collapsible open={isFineTuneOpen} onOpenChange={setIsFineTuneOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between text-sm font-medium text-muted-foreground mb-3"
            >
              <span>Fine-Tune Colors</span>
              {isFineTuneOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-2">
                Advanced color customization coming soon. For now, choose from our pre-designed palettes above.
              </p>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Footer Actions */}
        <div className="mt-6 pt-6 border-t">
          <Button 
            onClick={onClose} 
            className="w-full"
            size="lg"
          >
            Apply Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
