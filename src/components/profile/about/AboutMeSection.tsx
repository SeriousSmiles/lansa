
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AboutMeSectionProps {
  role: string;
  goal: string;
  aboutText?: string;
  onUpdateAbout?: (text: string) => Promise<void>;
  highlightColor?: string;
}

export function AboutMeSection({ 
  role, 
  goal, 
  aboutText,
  onUpdateAbout,
  highlightColor = "#FF6B4A"
}: AboutMeSectionProps) {
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [editedAboutText, setEditedAboutText] = useState(aboutText || "");
  const { toast } = useToast();
  
  // Generate default about text based on role and goal
  const defaultAboutText = `Based on your onboarding answers, you identified as a ${role.toLowerCase()} 
  who wants to ${goal.toLowerCase()}. You're at the beginning of your 
  clarity journey, and we're here to help you achieve your goals.`;

  const displayAboutText = aboutText || defaultAboutText;
  
  const handleSaveAbout = async () => {
    if (onUpdateAbout) {
      try {
        await onUpdateAbout(editedAboutText);
        toast({
          title: "Changes saved",
          description: "Your about text has been updated.",
        });
        setIsEditingAbout(false);
      } catch (error) {
        toast({
          title: "Error saving changes",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Get contrast text color for the highlight
  const getContrastTextColor = (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">About Me</h2>
        {onUpdateAbout && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setIsEditingAbout(!isEditingAbout)}
            style={{ color: highlightColor }}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
      </div>
      
      {isEditingAbout ? (
        <div className="space-y-4 mb-4">
          <Textarea 
            value={editedAboutText}
            onChange={(e) => setEditedAboutText(e.target.value)}
            className="min-h-[100px]"
            placeholder="Tell us about yourself..."
          />
          <div className="flex space-x-2">
            <Button 
              onClick={handleSaveAbout} 
              size="sm" 
              style={{ backgroundColor: highlightColor, color: getContrastTextColor(highlightColor) }}
            >
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setEditedAboutText(aboutText || defaultAboutText);
                setIsEditingAbout(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="mb-4">{displayAboutText}</p>
      )}
    </>
  );
}
