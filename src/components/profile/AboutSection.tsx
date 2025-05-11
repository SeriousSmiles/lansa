
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AboutSectionProps {
  role: string;
  goal: string;
  blocker: string;
  onUpdate?: (field: string, value: string) => Promise<void>;
}

export function AboutSection({ role, goal, blocker, onUpdate }: AboutSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBlocker, setEditedBlocker] = useState(blocker);
  const { toast } = useToast();
  
  const handleSave = async () => {
    if (onUpdate) {
      try {
        await onUpdate("question2", editedBlocker);
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
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">About Me</h2>
          {onUpdate && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
        </div>
        <p className="mb-4">
          Based on your onboarding answers, you identified as a {role.toLowerCase()} 
          who wants to {goal.toLowerCase()}. You're at the beginning of your 
          clarity journey, and we're here to help you achieve your goals.
        </p>
        <h3 className="text-lg font-semibold mb-2">My Biggest Challenge</h3>
        
        {isEditing ? (
          <div className="space-y-4">
            <Textarea 
              value={editedBlocker} 
              onChange={(e) => setEditedBlocker(e.target.value)}
              className="min-h-[100px]"
              placeholder="Describe your biggest professional challenge..."
            />
            <div className="flex space-x-2">
              <Button onClick={handleSave} size="sm">Save</Button>
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
          <blockquote className="border-l-4 border-[#FF6B4A] pl-4 italic">
            "{blocker}"
          </blockquote>
        )}
      </CardContent>
    </Card>
  );
}
