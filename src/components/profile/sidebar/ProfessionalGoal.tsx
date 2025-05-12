import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getContrastTextColor } from "@/utils/colorUtils";

interface ProfessionalGoalProps {
  goal: string;
  onUpdate?: (field: string, value: string) => Promise<void>;
  highlightColor?: string; // Added highlightColor property
}

export function ProfessionalGoal({ 
  goal,
  onUpdate,
  highlightColor = "#FF6B4A" // Default to original orange
}: ProfessionalGoalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState(goal);
  const { toast } = useToast();

  const handleSave = async () => {
    if (onUpdate) {
      try {
        await onUpdate("question3", editedGoal);
        toast({
          title: "Changes saved",
          description: "Your professional goal has been updated.",
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

  // Calculate text contrast color for better readability
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
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>Professional Goal</h3>
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
              value={editedGoal} 
              onChange={(e) => setEditedGoal(e.target.value)}
              className="min-h-[100px]"
              placeholder="Describe your professional goal..."
            />
            <div className="flex space-x-2">
              <Button 
                onClick={handleSave} 
                size="sm"
                style={{ 
                  backgroundColor: highlightColor,
                  color: getContrastTextColor(highlightColor)
                }}
              >
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setEditedGoal(goal);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p>{goal}</p>
        )}
      </CardContent>
    </Card>
  );
}
