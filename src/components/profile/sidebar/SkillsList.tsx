
import { useState } from "react";
import { Star, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface SkillsListProps {
  skills: string[];
  onAddSkill?: (skill: string) => Promise<void>;
  onRemoveSkill?: (skill: string) => Promise<void>;
}

export function SkillsList({ 
  skills, 
  onAddSkill, 
  onRemoveSkill 
}: SkillsListProps) {
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = async () => {
    if (onAddSkill && newSkill.trim()) {
      try {
        await onAddSkill(newSkill.trim());
        setNewSkill("");
        setIsAddingSkill(false);
      } catch (error) {
        console.error("Error adding skill:", error);
      }
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    if (onRemoveSkill) {
      try {
        await onRemoveSkill(skill);
      } catch (error) {
        console.error("Error removing skill:", error);
      }
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Star className="h-5 w-5 text-[#FF6B4A] mr-2" />
            Skills
          </h2>
          {onAddSkill && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsAddingSkill(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add skill</span>
            </Button>
          )}
        </div>

        {isAddingSkill && (
          <div className="mb-4">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Enter a skill"
              className="mb-2"
            />
            <div className="flex space-x-2">
              <Button onClick={handleAddSkill} size="sm">Add</Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setNewSkill("");
                  setIsAddingSkill(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <div 
              key={index} 
              className="bg-[#FFF4EE] text-[#FF6B4A] px-3 py-1 rounded-full flex items-center group"
            >
              {skill}
              {onRemoveSkill && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  <Trash className="h-3 w-3" />
                  <span className="sr-only">Remove {skill}</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
