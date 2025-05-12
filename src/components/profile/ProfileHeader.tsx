
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfileHeaderProps {
  userName: string;
  role: string;
  user: any;
  coverColor: string;
  onCoverColorChange: (color: string) => Promise<void>;
}

export function ProfileHeader({ 
  userName, 
  role, 
  user, 
  coverColor, 
  onCoverColorChange 
}: ProfileHeaderProps) {
  const navigate = useNavigate();
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(coverColor || "#FF6B4A");
  
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
  
  const handleColorSelect = async (color: string) => {
    setSelectedColor(color);
    await onCoverColorChange(color);
    setIsColorPickerOpen(false);
  };
  
  return (
    <header className="flex min-h-[72px] w-full px-4 md:px-16 items-center shadow-sm bg-white">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate("/dashboard")}
        className="mr-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
        alt="Lansa Logo"
        className="aspect-[2.7] object-contain w-[92px]"
      />
      <div className="ml-auto flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsColorPickerOpen(true)}
          className="flex items-center gap-1"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-4 w-4"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <span>Change Cover</span>
        </Button>
      </div>
      
      <Dialog open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Cover Color</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-3 mt-4">
            {colorOptions.map((color) => (
              <button
                key={color}
                className={`h-12 w-12 rounded-full border-2 ${
                  selectedColor === color ? "border-black" : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                aria-label={`Select ${color} color`}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
