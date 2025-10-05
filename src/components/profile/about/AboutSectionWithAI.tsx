import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIModal } from "@/components/ai/AIModal";
import { fetchAISuggestion } from "@/lib/aiHelpers";
import { toast } from "sonner";

interface AboutSectionWithAIProps {
  aboutText?: string;
  onUpdateAbout?: (text: string) => Promise<void>;
  userId?: string;
  highlightColor?: string;
}

export function AboutSectionWithAI({
  aboutText,
  onUpdateAbout,
  userId,
  highlightColor = "#FF6B4A"
}: AboutSectionWithAIProps) {
  const [showAI, setShowAI] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleEnhance = async () => {
    if (!userId || !aboutText) {
      toast.error("Missing user data or content");
      return;
    }

    setIsLoadingAI(true);
    setShowAI(true);
    setAiResult(null);

    try {
      const result = await fetchAISuggestion({
        user_id: userId,
        section: 'About',
        content: aboutText,
      });
      setAiResult(result);
      toast.success("AI suggestion generated!");
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      toast.error("Failed to generate AI suggestion");
      setShowAI(false);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleApplySuggestion = async (suggestion: string) => {
    if (onUpdateAbout) {
      try {
        await onUpdateAbout(suggestion);
        toast.success("About section updated with AI suggestion!");
      } catch (error) {
        console.error("Error updating about section:", error);
        toast.error("Failed to update about section");
      }
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>
            About
          </h3>
          {userId && aboutText && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEnhance}
              className="gap-1.5 text-muted-foreground hover:text-primary"
              title="Enhance with AI"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI</span>
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          {aboutText || "Click edit to add information about yourself..."}
        </div>
      </Card>

      <AIModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        section="About"
        data={aboutText || ""}
        aiResult={aiResult}
        isLoading={isLoadingAI}
        onEnhance={handleApplySuggestion}
      />
    </>
  );
}
