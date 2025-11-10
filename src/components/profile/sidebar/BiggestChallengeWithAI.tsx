import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getContrastTextColor } from "@/utils/colorUtils";
import { AIModal } from "@/components/ai/AIModal";
import { fetchAISuggestion } from "@/lib/aiHelpers";
import { toast } from "sonner";

interface BiggestChallengeWithAIProps {
  challenge: string;
  onUpdate?: (challenge: string) => Promise<void>;
  highlightColor?: string;
  userId?: string;
}

export function BiggestChallengeWithAI({ 
  challenge,
  onUpdate,
  highlightColor = "#FF6B4A",
  userId
}: BiggestChallengeWithAIProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedChallenge, setEditedChallenge] = useState(challenge);
  const [isSaving, setIsSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast: toastHook } = useToast();

  const handleSave = async () => {
    if (onUpdate) {
      setIsSaving(true);
      try {
        await onUpdate(editedChallenge);
        setIsEditing(false);
      } catch (error) {
        toastHook({
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

  const handleAIEnhance = async () => {
    if (!userId || !challenge) {
      toast.error("Add your biggest challenge first");
      return;
    }

    setIsLoadingAI(true);
    setShowAI(true);
    setAiResult(null);

    try {
      const result = await fetchAISuggestion({
        user_id: userId,
        section: 'Biggest Challenge',
        content: challenge,
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
    if (onUpdate) {
      try {
        await onUpdate(suggestion);
        toast.success("Challenge updated with AI suggestion!");
      } catch (error) {
        console.error("Error updating challenge:", error);
        toast.error("Failed to update challenge");
      }
    }
  };

  const textColor = highlightColor ? getContrastTextColor(highlightColor) : "#000000";

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>Biggest Challenge</h3>
            <div className="flex gap-2">
              {userId && challenge && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAIEnhance}
                  className="gap-1.5 text-muted-foreground hover:text-primary"
                  title="Enhance with AI"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI</span>
                </Button>
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
              className="border-l-4 pl-4 italic text-sm text-muted-foreground"
              style={{ borderColor: highlightColor }}
            >
              "{challenge || "Click edit to add your biggest challenge"}"
            </blockquote>
          )}
        </CardContent>
      </Card>

      <AIModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        section="Biggest Challenge"
        data={challenge || ""}
        aiResult={aiResult}
        isLoading={isLoadingAI}
        onEnhance={handleApplySuggestion}
      />
    </>
  );
}
