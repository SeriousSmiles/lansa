# AI Enhancement System

This directory contains components for AI-powered profile enhancement.

## Components

### AIModal
A reusable modal component that displays AI suggestions with scoring visualization.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `section: string` - Name of the section being enhanced (e.g., "About", "Skills")
- `data: string` - Current content of the section
- `aiResult: AIEnhancementResponse | null` - AI suggestion result
- `isLoading?: boolean` - Loading state for AI generation
- `onEnhance: (suggestion: string) => void` - Callback when user applies suggestion

## Usage Example

```tsx
import { useState } from "react";
import { AIModal } from "@/components/ai/AIModal";
import { fetchAISuggestion } from "@/lib/aiHelpers";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MyProfileSection({ content, userId, onUpdate }) {
  const [showAI, setShowAI] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleEnhance = async () => {
    setIsLoadingAI(true);
    setShowAI(true);
    
    try {
      const result = await fetchAISuggestion({
        user_id: userId,
        section: 'My Section',
        content: content,
      });
      setAiResult(result);
      toast.success("AI suggestion generated!");
    } catch (error) {
      toast.error("Failed to generate AI suggestion");
      setShowAI(false);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleApply = async (suggestion: string) => {
    await onUpdate(suggestion);
    toast.success("Section updated!");
  };

  return (
    <div>
      <Button onClick={handleEnhance}>
        <Sparkles className="w-4 h-4 mr-2" />
        AI Enhance
      </Button>

      <AIModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        section="My Section"
        data={content}
        aiResult={aiResult}
        isLoading={isLoadingAI}
        onEnhance={handleApply}
      />
    </div>
  );
}
```

## Backend

The system uses the `analyze-profile-section` edge function which:
1. Fetches user's onboarding data and profile for context
2. Calls OpenAI GPT-4o-mini for enhancement suggestions
3. Returns structured feedback with scoring
4. Logs all interactions to `ai_feedback_log` table

## API Key

Uses **OPENAI_API_KEY** (pre-configured and working).

## Database

Logs are stored in `ai_feedback_log` table with RLS policies ensuring users can only see their own logs.
