
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

interface ThemeColorPickerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedColor: string;
  onColorSelect: (color: string) => Promise<void>;
  title: string;
  description: string;
}

export function ThemeColorPicker({ 
  isOpen, 
  onOpenChange,
  selectedColor, 
  onColorSelect,
  title, 
  description 
}: ThemeColorPickerProps) {
  const colorOptions = [
    "#FF6B4A", // Default orange
    "#9b87f5", // Primary Purple
    "#7E69AB", // Secondary Purple
    "#6E59A5", // Tertiary Purple
    "#1A1F2C", // Dark Purple
    "#D6BCFA", // Light Purple
    "#F2FCE2", // Soft Green
    "#FEF7CD", // Soft Yellow
    "#FEC6A1", // Soft Orange
    "#E5DEFF", // Soft Purple
    "#FFDEE2", // Soft Pink
    "#FDE1D3", // Soft Peach
    "#D3E4FD", // Soft Blue
    "#F1F0FB", // Soft Gray
    "#8B5CF6", // Vivid Purple
    "#D946EF", // Magenta Pink
    "#F97316", // Bright Orange
    "#0EA5E9", // Ocean Blue
    "#403E43", // Charcoal Gray
    "#FFFFFF", // Pure White
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-3 mt-4">
          {colorOptions.map((color) => (
            <button
              key={color}
              className={`h-12 w-12 rounded-full border-2 ${
                selectedColor === color ? "border-black" : "border-gray-200"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
              aria-label={`Select ${color} color`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
