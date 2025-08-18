import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GuidanceResponse {
  message: string;
  suggestions?: {
    title?: string;
    about?: string;
    skills?: string[];
    experiences?: Array<{title: string; description: string; startYear?: number; endYear?: number | null}>;
    education?: Array<{title: string; description: string; startYear?: number; endYear?: number | null}>;
  };
  reasoning?: string;
  nextSteps?: string[];
  isComplete?: boolean;
}

interface UseInteractiveProfileGuideOptions {
  userId: string;
  onApplySuggestion?: (type: string, content: any) => Promise<void>;
}

export function useInteractiveProfileGuide({ userId, onApplySuggestion }: UseInteractiveProfileGuideOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateGuidance = useCallback(async (
    conversationHistory: ConversationMessage[],
    requestType: 'initial' | 'refine' | 'alternatives' | 'apply' = 'refine',
    userMessage?: string,
    section?: string,
    currentContent?: string
  ): Promise<GuidanceResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('generate-interactive-profile-guidance', {
        body: {
          userId,
          conversationHistory,
          userMessage,
          requestType,
          section,
          currentContent
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate guidance');
      }

      return response.data?.guidance || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error generating guidance:', err);
      
      // Return fallback guidance
      return {
        message: "I'm having trouble connecting right now. Let me help you with some general profile tips while I get back online.",
        suggestions: {},
        reasoning: "Fallback response due to technical issue",
        nextSteps: ["Try again in a moment"],
        isComplete: false
      };
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const requestAlternatives = useCallback(async (
    conversationHistory: ConversationMessage[],
    section: string,
    currentSuggestion: any,
    userFeedback: string
  ): Promise<GuidanceResponse | null> => {
    return generateGuidance(
      conversationHistory,
      'alternatives',
      `I'd like alternatives for the ${section}. Current suggestion: ${JSON.stringify(currentSuggestion)}. My feedback: ${userFeedback}`,
      section,
      JSON.stringify(currentSuggestion)
    );
  }, [generateGuidance]);

  const applySuggestionWithFeedback = useCallback(async (
    type: string,
    content: any,
    conversationHistory: ConversationMessage[]
  ) => {
    try {
      if (onApplySuggestion) {
        await onApplySuggestion(type, content);
      }
      
      // Generate follow-up guidance
      return generateGuidance(
        conversationHistory,
        'apply',
        `I applied the ${type} suggestion. What should I focus on next?`,
        type
      );
    } catch (err) {
      console.error('Error applying suggestion:', err);
      throw err;
    }
  }, [onApplySuggestion, generateGuidance]);

  return {
    generateGuidance,
    requestAlternatives,
    applySuggestionWithFeedback,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}