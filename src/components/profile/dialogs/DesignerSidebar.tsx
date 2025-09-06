import { useState, useEffect } from "react";
import { X, Palette, Eye } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DesignerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  currentHighlight: string;
  onThemeChange: (color: string) => Promise<void>;
  onHighlightChange: (color: string) => Promise<void>;
}

// Color contrast calculation utilities
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const getLuminance = (r: number, g: number, b: number) => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const getContrastRatio = (color1: string, color2: string) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

const getContrastLevel = (ratio: number) => {
  if (ratio >= 7) return { level: "AAA", color: "bg-green-500", description: "Excellent contrast" };
  if (ratio >= 4.5) return { level: "AA", color: "bg-blue-500", description: "Good contrast" };
  if (ratio >= 3) return { level: "AA Large", color: "bg-yellow-500", description: "OK for large text" };
  return { level: "Fail", color: "bg-red-500", description: "Poor contrast" };
};

export function DesignerSidebar({
  isOpen,
  onClose,
  currentTheme,
  currentHighlight,
  onThemeChange,
  onHighlightChange
}: DesignerSidebarProps) {
  const [themeInput, setThemeInput] = useState(currentTheme);
  const [highlightInput, setHighlightInput] = useState(currentHighlight);
  const [contrastRatio, setContrastRatio] = useState(0);

  const themeColorOptions = [
    "#FF6B4A", "#9b87f5", "#7E69AB", "#6E59A5", "#1A1F2C", "#D6BCFA",
    "#F2FCE2", "#FEF7CD", "#FEC6A1", "#E5DEFF", "#FFDEE2", "#FDE1D3",
    "#D3E4FD", "#F1F0FB", "#8B5CF6", "#D946EF", "#F97316", "#0EA5E9",
    "#403E43", "#FFFFFF"
  ];

  const highlightColorOptions = [
    "#FF6B4A", "#8B5CF6", "#D946EF", "#F97316", "#0EA5E9", "#1A1F71",
    "#10B981", "#EF4444", "#F59E0B", "#6366F1", "#EC4899", "#14B8A6",
    "#000000", "#333333", "#1A1F2C"
  ];

  // Calculate contrast ratio when colors change
  useEffect(() => {
    const ratio = getContrastRatio(themeInput, highlightInput);
    setContrastRatio(ratio);
  }, [themeInput, highlightInput]);

  useEffect(() => {
    setThemeInput(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    setHighlightInput(currentHighlight);
  }, [currentHighlight]);

  const handleThemeColorSelect = async (color: string) => {
    setThemeInput(color);
    await onThemeChange(color);
  };

  const handleHighlightColorSelect = async (color: string) => {
    setHighlightInput(color);
    await onHighlightChange(color);
  };

  const handleThemeInputChange = async (value: string) => {
    setThemeInput(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      await onThemeChange(value);
    }
  };

  const handleHighlightInputChange = async (value: string) => {
    setHighlightInput(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      await onHighlightChange(value);
    }
  };

  const contrastInfo = getContrastLevel(contrastRatio);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Profile Designer
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Theme Color Section */}
          <div>
            <Label className="text-base font-semibold">Theme Color</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Choose your profile's primary theme color
            </p>
            
            <div className="grid grid-cols-5 gap-3 mb-4">
              {themeColorOptions.map((color) => (
                <button
                  key={color}
                  className={`h-12 w-12 rounded-lg border-2 transition-all hover:scale-105 ${
                    themeInput === color ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleThemeColorSelect(color)}
                  aria-label={`Select ${color} as theme color`}
                />
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme-hex">Custom Hex Color</Label>
              <Input
                id="theme-hex"
                value={themeInput}
                onChange={(e) => handleThemeInputChange(e.target.value)}
                placeholder="#FF6B4A"
                className="font-mono"
              />
            </div>
          </div>

          <Separator />

          {/* Highlight Color Section */}
          <div>
            <Label className="text-base font-semibold">Highlight Color</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a color for highlighted elements and accents
            </p>
            
            <div className="grid grid-cols-5 gap-3 mb-4">
              {highlightColorOptions.map((color) => (
                <button
                  key={color}
                  className={`h-12 w-12 rounded-lg border-2 transition-all hover:scale-105 ${
                    highlightInput === color ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleHighlightColorSelect(color)}
                  aria-label={`Select ${color} as highlight color`}
                />
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="highlight-hex">Custom Hex Color</Label>
              <Input
                id="highlight-hex"
                value={highlightInput}
                onChange={(e) => handleHighlightInputChange(e.target.value)}
                placeholder="#FF6B4A"
                className="font-mono"
              />
            </div>
          </div>

          <Separator />

          {/* Color Contrast Analyzer */}
          <div>
            <Label className="text-base font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Contrast Analyzer
            </Label>
            <p className="text-sm text-muted-foreground mb-4">
              Accessibility analysis for your color combination
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: themeInput }}
                  />
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: highlightInput }}
                  />
                  <div>
                    <p className="font-medium">Contrast Ratio</p>
                    <p className="text-sm text-muted-foreground">
                      {contrastRatio.toFixed(2)}:1
                    </p>
                  </div>
                </div>
                <Badge className={contrastInfo.color}>
                  {contrastInfo.level}
                </Badge>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>{contrastInfo.description}</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  WCAG Guidelines: AA (4.5:1) for normal text, AAA (7:1) for enhanced accessibility
                </p>
              </div>

              {/* Color Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div 
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: themeInput }}
                >
                  <h3 
                    className="font-semibold mb-2"
                    style={{ color: highlightInput }}
                  >
                    Sample Profile Header
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: highlightInput }}
                  >
                    This is how your highlight color looks on your theme background.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}