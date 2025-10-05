import { supabase } from "@/integrations/supabase/client";

export interface AIEnhancementRequest {
  user_id: string;
  section: string;
  content: string;
}

export interface AIEnhancementResponse {
  suggested_rewrite: string;
  reasoning: string;
  score: {
    clarity: number;
    confidence: number;
    specificity: number;
    professional_impression: number;
  };
}

export async function fetchAISuggestion({
  user_id,
  section,
  content,
}: AIEnhancementRequest): Promise<AIEnhancementResponse> {
  const { data, error } = await supabase.functions.invoke('analyze-profile-section', {
    body: { user_id, section, content },
  });

  if (error) {
    console.error('Error fetching AI suggestion:', error);
    throw new Error('Failed to generate AI suggestion');
  }

  return data as AIEnhancementResponse;
}
