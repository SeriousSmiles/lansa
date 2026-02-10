
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIModal } from "@/components/ai/AIModal";
import { fetchAISuggestion } from "@/lib/aiHelpers";
import { toast as sonnerToast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BiggestChallengeSectionProps {
  blocker: string;
  onUpdate?: (challenge: string) => Promise<void>;
  highlightColor?: string;
  userId?: string;
}

export function BiggestChallengeSection({ 
  blocker, 
  onUpdate,
  highlightColor = "#FF6B4A",
  userId
}: BiggestChallengeSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBlocker, setEditedBlocker] = useState(blocker);
  const [showAI, setShowAI] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [lastAIContent, setLastAIContent] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (aiUsed && blocker !== lastAIContent) {
      setAiUsed(false);
      setAiResult(null);
    }
  }, [blocker, aiUsed, lastAIContent]);

  const isAIDisabled = aiUsed && blocker === lastAIContent;
  
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

  const handleAIEnhance = async () => {
    if (!userId || !blocker) {
      sonnerToast.error("Add your challenge first");
      return;
    }

    setIsLoadingAI(true);
    setShowAI(true);
    setAiResult(null);

    try {
      const result = await fetchAISuggestion({
        user_id: userId,
        section: 'Biggest Challenge',
        content: blocker,
      });
      setAiResult(result);
      sonnerToast.success("AI suggestion generated!");
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      sonnerToast.error("Failed to generate AI suggestion");
      setShowAI(false);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleApplySuggestion = async (suggestion: string) => {
    if (onUpdate) {
      try {
        await onUpdate(suggestion);
        setAiUsed(true);
        setLastAIContent(suggestion);
        sonnerToast.success("Challenge updated with AI suggestion!");
      } catch (error) {
        console.error("Error updating challenge:", error);
        sonnerToast.error("Failed to update challenge");
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
        <div className="flex gap-2">
          {userId && blocker && !isEditing && (
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
                    <p>Edit your content to use AI enhancement again</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
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

      <AIModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        section="Biggest Challenge"
        data={blocker || ""}
        aiResult={aiResult}
        isLoading={isLoadingAI}
        onEnhance={handleApplySuggestion}
        disabled={isAIDisabled}
      />
    </>
  );
}
