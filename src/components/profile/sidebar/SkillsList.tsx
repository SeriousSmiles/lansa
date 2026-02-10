
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Sparkles } from "lucide-react";
import { AIModal } from "@/components/ai/AIModal";
import { fetchAISuggestion } from "@/lib/aiHelpers";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [showAI, setShowAI] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [lastAIContent, setLastAIContent] = useState<string>("");

  const currentSkillsString = skills.join(', ');

  useEffect(() => {
    if (aiUsed && currentSkillsString !== lastAIContent) {
      setAiUsed(false);
      setAiResult(null);
    }
  }, [currentSkillsString, aiUsed, lastAIContent]);

  const isAIDisabled = aiUsed && currentSkillsString === lastAIContent;

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
    if (!userId || skills.length === 0) {
      toast.error("Add some skills first to get AI suggestions");
      return;
    }

    setIsLoadingAI(true);
    setShowAI(true);
    setAiResult(null);

    try {
      const result = await fetchAISuggestion({
        user_id: userId,
        section: 'Skills',
        content: skills.join(', '),
      });
      setAiResult(result);
      toast.success("AI suggestion generated!");
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      toast.error(
        "AI enhancement temporarily unavailable. Please try again later.",
        { description: "If this persists, contact support." }
      );
      setShowAI(false);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleApplySuggestion = async (suggestion: string) => {
    const newSkills = suggestion.split(',').map(s => s.trim()).filter(s => s);
    
    try {
      for (const oldSkill of skills) {
        if (onRemoveSkill) {
          await onRemoveSkill(oldSkill);
        }
      }
      
      for (const skill of newSkills) {
        if (onAddSkill) {
          await onAddSkill(skill);
        }
      }
      
      setAiUsed(true);
      setLastAIContent(newSkills.join(', '));
      toast.success("Skills replaced with AI suggestions!");
    } catch (error) {
      console.error("Error updating skills:", error);
      toast.error("Failed to update skills");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>Skills</h3>
          <div className="flex gap-2">
            {userId && skills.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAIEnhance}
                        className="gap-1.5 text-muted-foreground hover:text-primary"
                        title="Enhance with AI"
                        disabled={isAIDisabled}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>AI</span>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {isAIDisabled && (
                    <TooltipContent>
                      <p>Edit your skills to use AI enhancement again</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
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

      <AIModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        section="Skills"
        data={skills.join(', ')}
        aiResult={aiResult}
        isLoading={isLoadingAI}
        onEnhance={handleApplySuggestion}
        disabled={isAIDisabled}
      />
    </Card>
  );
}
