
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

interface SkillsListProps {
  skills: string[];
  onAddSkill?: (skill: string) => Promise<void>;
  onRemoveSkill?: (skill: string) => Promise<void>;
  highlightColor?: string; // Added highlightColor property
}

export function SkillsList({ 
  skills, 
  onAddSkill, 
  onRemoveSkill,
  highlightColor = "#FF6B4A" // Default to original orange
}: SkillsListProps) {
  const [newSkill, setNewSkill] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSkill = async () => {
    if (newSkill.trim() && onAddSkill) {
      try {
        await onAddSkill(newSkill.trim());
        setNewSkill("");
      } catch (error) {
        console.error("Error adding skill:", error);
      }
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>Skills</h3>
          {onAddSkill && !isAdding && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsAdding(true)}
              style={{ color: highlightColor }}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add skill</span>
            </Button>
          )}
        </div>
        
        {isAdding && (
          <div className="flex gap-2 mb-4">
            <Input 
              value={newSkill} 
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddSkill();
                } else if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewSkill("");
                }
              }}
              placeholder="Enter a skill"
              className="h-9"
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9" 
              onClick={handleAddSkill}
              style={{ 
                borderColor: `${highlightColor}50`,
                color: highlightColor
              }}
            >
              Add
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 px-2" 
              onClick={() => {
                setIsAdding(false);
                setNewSkill("");
              }}
            >
              Cancel
            </Button>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge 
              key={index} 
              variant="outline"
              className="group relative px-3 py-1"
              style={{ 
                backgroundColor: `${highlightColor}15`,
                borderColor: `${highlightColor}30`,
                color: highlightColor
              }}
            >
              {skill}
              {onRemoveSkill && (
                <button
                  onClick={() => onRemoveSkill(skill)}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
