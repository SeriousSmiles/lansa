
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

interface HighlightColorPickerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedColor: string;
  onColorSelect: (color: string) => Promise<void>;
}

export function HighlightColorPicker({ 
  isOpen, 
  onOpenChange,
  selectedColor, 
  onColorSelect 
}: HighlightColorPickerProps) {
  const highlightColorOptions = [
    "#FF6B4A", // Default orange
    "#8B5CF6", // Vivid Purple
    "#D946EF", // Magenta Pink
    "#F97316", // Bright Orange
    "#0EA5E9", // Ocean Blue
    "#1A1F71", // Dark Blue
    "#10B981", // Green
    "#EF4444", // Red
    "#F59E0B", // Yellow
    "#6366F1", // Indigo
    "#EC4899", // Pink
    "#14B8A6", // Teal
    "#000000", // Black
    "#333333", // Dark Gray
    "#1A1F2C", // Dark Purple
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Highlight Color</DialogTitle>
          <DialogDescription>
            Choose a color for highlighted elements on your profile
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-3 mt-4">
          {highlightColorOptions.map((color) => (
            <button
              key={color}
              className={`h-12 w-12 rounded-full border-2 ${
                selectedColor === color ? "border-black" : "border-gray-200"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
              aria-label={`Select ${color} color for highlights`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
