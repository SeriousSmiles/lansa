
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BiggestChallengeSectionProps {
  blocker: string;
  onUpdate?: (challenge: string) => Promise<void>;
  highlightColor?: string;
}

export function BiggestChallengeSection({ 
  blocker, 
  onUpdate,
  highlightColor = "#FF6B4A",
}: BiggestChallengeSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBlocker, setEditedBlocker] = useState(blocker);
  const { toast } = useToast();
  
  const handleSave = async () => {
    if (onUpdate) {
      try {
        await onUpdate(editedBlocker);
        toast({
          title: "Changes saved",
          description: "Your challenge description has been updated.",
        });
        setIsEditing(false);
      } catch (error) {
        toast({
          title: "Error saving changes",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };
  
  const getContrastTextColor = (hexColor: string): string => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">My Biggest Challenge</h3>
        {onUpdate && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setIsEditing(!isEditing)}
            style={{ color: highlightColor }}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <Textarea 
            value={editedBlocker} 
            onChange={(e) => setEditedBlocker(e.target.value)}
            className="min-h-[100px]"
            placeholder="Describe your biggest professional challenge..."
          />
          <div className="flex space-x-2">
            <Button 
              onClick={handleSave} 
              size="sm"
              style={{ backgroundColor: highlightColor, color: getContrastTextColor(highlightColor) }}
            >
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setEditedBlocker(blocker);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <blockquote 
          className="border-l-4 pl-4 italic text-sm text-muted-foreground"
          style={{ borderColor: highlightColor }}
        >
          "{blocker || "Click edit to add your biggest challenge"}"
        </blockquote>
      )}
    </>
  );
}
