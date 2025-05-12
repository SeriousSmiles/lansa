
import { useState } from "react";
import { Star, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface ProfessionalGoalProps {
  goal: string;
  onUpdate?: (field: string, value: string) => Promise<void>;
}

export function ProfessionalGoal({ 
  goal, 
  onUpdate 
}: ProfessionalGoalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState(goal);

  const handleSave = async () => {
    if (onUpdate) {
      try {
        await onUpdate("question3", editedGoal);
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating goal:", error);
      }
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Star className="h-5 w-5 text-[#FF6B4A] mr-2" />
            Professional Goal
          </h2>
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
        
        {isEditing ? (
          <div className="space-y-4">
            <Input 
              value={editedGoal} 
              onChange={(e) => setEditedGoal(e.target.value)}
              placeholder="Your professional goal..."
            />
            <div className="flex space-x-2">
              <Button onClick={handleSave} size="sm">Save</Button>
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
          <p className="text-lg">{goal}</p>
        )}
      </CardContent>
    </Card>
  );
}
