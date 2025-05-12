
import { ArrowLeft, Share, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

interface ProfileHeaderProps {
  userName: string;
  role: string;
  user: any;
  userId?: string;
  coverColor: string;
  highlightColor?: string;
  onCoverColorChange: (color: string) => Promise<void>;
  onHighlightColorChange?: (color: string) => Promise<void>;
  readOnly?: boolean; // Add readOnly prop
}

export function ProfileHeader({ 
  userName, 
  role, 
  user, 
  userId,
  coverColor, 
  highlightColor = "#FF6B4A",
  onCoverColorChange,
  onHighlightColorChange,
  readOnly = false // Default to false for backward compatibility
}: ProfileHeaderProps) {
  const navigate = useNavigate();
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(coverColor || "#FF6B4A");
  const [selectedHighlightColor, setSelectedHighlightColor] = useState(highlightColor || "#FF6B4A");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  
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
  
  const handleColorSelect = async (color: string) => {
    setSelectedColor(color);
    await onCoverColorChange(color);
    setIsColorPickerOpen(false);
  };
  
  const handleHighlightColorSelect = async (color: string) => {
    setSelectedHighlightColor(color);
    if (onHighlightColorChange) {
      await onHighlightColorChange(color);
    }
    setIsHighlightPickerOpen(false);
  };
  
  const handleShare = () => {
    if (!userId) return;
    
    // Generate a shareable URL
    const shareableUrl = `${window.location.origin}/profile/share/${userId}`;
    setShareUrl(shareableUrl);
    setIsShareDialogOpen(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Toast notification is handled in ShareButton component
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  
  // Calculate text contrast color (black or white) based on background
  const getContrastTextColor = (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance - standard formula for brightness
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors and white for dark colors
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };
  
  const textColor = getContrastTextColor(coverColor);
  
  return (
    <header 
      className="flex min-h-[72px] w-full px-4 md:px-16 items-center shadow-sm"
      style={{
        backgroundColor: `${coverColor}15`, // Very light version of theme color
        borderBottom: `1px solid ${coverColor}30`
      }}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate("/dashboard")}
        className="mr-2"
        style={{
          color: textColor
        }}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
        alt="Lansa Logo"
        className="aspect-[2.7] object-contain w-[92px]"
      />
      {!readOnly && (
        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsColorPickerOpen(true)}
            className="flex items-center gap-1"
            style={{
              borderColor: `${coverColor}50`,
              color: textColor
            }}
          >
            <Palette className="h-4 w-4" />
            <span>Change Theme</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsHighlightPickerOpen(true)}
            className="flex items-center gap-1"
            style={{
              borderColor: `${coverColor}50`,
              color: textColor
            }}
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
              <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.5" />
              <path d="M16 19h6" />
              <path d="M19 16v6" />
            </svg>
            <span>Change Highlights</span>
          </Button>
          
          <Button
            onClick={handleShare}
            className="flex items-center gap-1"
            variant="outline"
            size="sm"
            style={{
              borderColor: `${coverColor}50`,
              color: textColor
            }}
          >
            <Share size={16} />
            <span>Share Profile</span>
          </Button>
        </div>
      )}
      
      <Dialog open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Theme Color</DialogTitle>
            <DialogDescription>
              Choose a color for your profile theme
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
                onClick={() => handleColorSelect(color)}
                aria-label={`Select ${color} color`}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isHighlightPickerOpen} onOpenChange={setIsHighlightPickerOpen}>
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
                  selectedHighlightColor === color ? "border-black" : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleHighlightColorSelect(color)}
                aria-label={`Select ${color} color for highlights`}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share your profile</DialogTitle>
            <DialogDescription>
              Anyone with this link can view your profile without needing to sign in.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input 
                value={shareUrl} 
                readOnly 
                className="flex-grow p-2 border rounded"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button onClick={copyToClipboard}>Copy</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
