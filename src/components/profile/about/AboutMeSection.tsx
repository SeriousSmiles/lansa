
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIModal } from "@/components/ai/AIModal";
import { fetchAISuggestion } from "@/lib/aiHelpers";
import { toast as sonnerToast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AboutMeSectionProps {
  role: string;
  goal: string;
  aboutText?: string;
  onUpdateAbout?: (text: string) => Promise<void>;
  highlightColor?: string;
  userId?: string;
}

export function AboutMeSection({ 
  role, 
  goal, 
  aboutText,
  onUpdateAbout,
  highlightColor = "#FF6B4A",
  userId
}: AboutMeSectionProps) {
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [editedAboutText, setEditedAboutText] = useState(aboutText || "");
  const [showAI, setShowAI] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [lastAIContent, setLastAIContent] = useState<string>("");
  const { toast } = useToast();
  
  const defaultAboutText = `Based on your onboarding answers, you identified as a ${role.toLowerCase()} 
  who wants to ${goal.toLowerCase()}. You're at the beginning of your 
  clarity journey, and we're here to help you achieve your goals.`;

  const displayAboutText = aboutText || defaultAboutText;

  // Reset aiUsed when content changes from what AI was applied to
  useEffect(() => {
    if (aiUsed && displayAboutText !== lastAIContent) {
      setAiUsed(false);
      setAiResult(null);
    }
  }, [displayAboutText, aiUsed, lastAIContent]);

  const isAIDisabled = aiUsed && displayAboutText === lastAIContent;
  
  const handleSaveAbout = async () => {
    if (onUpdateAbout) {
      try {
        await onUpdateAbout(editedAboutText);
        toast({
          title: "Changes saved",
          description: "Your about text has been updated.",
        });
        setIsEditingAbout(false);
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
    if (!userId || !displayAboutText) {
      sonnerToast.error("Add some content first");
      return;
    }

    setIsLoadingAI(true);
    setShowAI(true);
    setAiResult(null);

    try {
      const result = await fetchAISuggestion({
        user_id: userId,
        section: 'About Me',
        content: displayAboutText,
      });
      setAiResult(result);
      sonnerToast.success("AI suggestion generated!");
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      sonnerToast.error(
        "AI enhancement temporarily unavailable. Please try again later.",
        { description: "If this persists, contact support." }
      );
      setShowAI(false);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleApplySuggestion = async (suggestion: string) => {
    if (onUpdateAbout) {
      try {
        await onUpdateAbout(suggestion);
        setAiUsed(true);
        setLastAIContent(suggestion);
        sonnerToast.success("About section updated with AI suggestion!");
      } catch (error) {
        console.error("Error updating about section:", error);
        sonnerToast.error("Failed to update about section");
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">About Me</h2>
        <div className="flex gap-2">
          {userId && displayAboutText && !isEditingAbout && (
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
          {onUpdateAbout && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsEditingAbout(!isEditingAbout)}
              style={{ color: highlightColor }}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
        </div>
      </div>
      
      {isEditingAbout ? (
        <div className="space-y-4 mb-4">
          <Textarea 
            value={editedAboutText}
            onChange={(e) => setEditedAboutText(e.target.value)}
            className="min-h-[100px]"
            placeholder="Tell us about yourself..."
          />
          <div className="flex space-x-2">
            <Button 
              onClick={handleSaveAbout} 
              size="sm" 
              style={{ backgroundColor: highlightColor, color: getContrastTextColor(highlightColor) }}
            >
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setEditedAboutText(aboutText || defaultAboutText);
                setIsEditingAbout(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">{displayAboutText}</p>
      )}

      <AIModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        section="About Me"
        data={displayAboutText}
        aiResult={aiResult}
        isLoading={isLoadingAI}
        onEnhance={handleApplySuggestion}
        disabled={isAIDisabled}
      />
    </>
  );
}
