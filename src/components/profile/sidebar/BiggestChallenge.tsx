
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getContrastTextColor } from "@/utils/colorUtils";

interface BiggestChallengeProps {
  challenge: string;
  onUpdate?: (challenge: string) => Promise<void>;
  highlightColor?: string;
}

export function BiggestChallenge({ 
  challenge,
  onUpdate,
  highlightColor = "#FF6B4A"
}: BiggestChallengeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedChallenge, setEditedChallenge] = useState(challenge);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (onUpdate) {
      setIsSaving(true);
      try {
        await onUpdate(editedChallenge);
        setIsEditing(false);
      } catch (error) {
        toast({
          title: "Error saving changes",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    setEditedChallenge(challenge);
    setIsEditing(false);
  };

  // Use the getContrastTextColor utility from colorUtils.ts
  const textColor = highlightColor ? getContrastTextColor(highlightColor) : "#000000";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>Biggest Challenge</h3>
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
              value={editedChallenge} 
              onChange={(e) => setEditedChallenge(e.target.value)}
              className="min-h-[100px]"
              placeholder="Describe your biggest professional challenge..."
            />
            <div className="flex space-x-2">
              <Button 
                onClick={handleSave} 
                size="sm"
                disabled={isSaving}
                style={{ 
                  backgroundColor: highlightColor,
                  color: textColor
                }}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <blockquote 
            className="border-l-4 pl-4 italic"
            style={{ borderColor: highlightColor }}
          >
            "{challenge || "Click edit to add your biggest challenge"}"
          </blockquote>
        )}
      </CardContent>
    </Card>
  );
}
