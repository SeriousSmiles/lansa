
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { AIEnhanceButton } from "../shared/AIEnhanceButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SkillsListProps {
  skills: string[];
  onAddSkill?: (skill: string) => Promise<void>;
  onRemoveSkill?: (skill: string) => Promise<void>;
  highlightColor?: string;
  userId?: string;
}

export function SkillsList({ 
  skills, 
  onAddSkill, 
  onRemoveSkill,
  highlightColor = "#FF6B4A",
  userId
}: SkillsListProps) {
  const [newSkill, setNewSkill] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const handleAIEnhance = async () => {
    if (!userId) {
      toast.error("User not found");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-skills-recommendations', {
        body: { 
          userId,
          currentSkills: skills 
        }
      });

      if (error) throw error;

      if (data?.suggestions) {
        setAiSuggestions(data.suggestions);
        setShowSuggestions(true);
        toast.success("AI skill suggestions generated!");
      }
    } catch (error) {
      console.error("Error generating skill suggestions:", error);
      toast.error("Failed to generate skill suggestions");
    }
  };

  const handleAcceptSuggestion = async (suggestion: string) => {
    if (onAddSkill) {
      try {
        await onAddSkill(suggestion);
        setAiSuggestions(prev => prev.filter(s => s !== suggestion));
        toast.success(`Added "${suggestion}" to your skills`);
      } catch (error) {
        console.error("Error adding suggested skill:", error);
        toast.error("Failed to add skill");
      }
    }
  };

  const handleRejectSuggestions = () => {
    setShowSuggestions(false);
    setAiSuggestions([]);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>Skills</h3>
          <div className="flex gap-2">
            {userId && !showSuggestions && (
              <AIEnhanceButton 
                onEnhance={handleAIEnhance}
                highlightColor={highlightColor}
                variant="small"
              />
            )}
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

        {showSuggestions && aiSuggestions.length > 0 && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: `${highlightColor}10`, borderColor: `${highlightColor}30` }}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium" style={{ color: highlightColor }}>
                AI Skill Suggestions
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRejectSuggestions}
                className="h-6 px-2 text-xs"
              >
                ✕ Dismiss
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAcceptSuggestion(suggestion)}
                  className="h-7 px-2 text-xs transition-all hover:shadow-sm"
                  style={{ 
                    borderColor: `${highlightColor}40`,
                    color: highlightColor,
                    backgroundColor: "white"
                  }}
                >
                  + {suggestion}
                </Button>
              ))}
            </div>
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
