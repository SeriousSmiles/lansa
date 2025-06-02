
import { supabase } from "@/integrations/supabase/client";
import { GrowthPrompt, UserGrowthStats } from "./types";

export const getCurrentPrompt = async (promptId: string): Promise<GrowthPrompt | null> => {
  const { data: prompt, error } = await supabase
    .from('growth_prompts')
    .select('*')
    .eq('id', promptId)
    .single();

  if (error) return null;
  return prompt;
};

export const getNextAvailablePrompt = async (
  stage: string, 
  completedPromptIds: string[]
): Promise<GrowthPrompt | null> => {
  let query = supabase
    .from('growth_prompts')
    .select('*')
    .eq('stage', stage)
    .eq('is_active', true)
    .order('order_index')
    .limit(1);

  // Only add the not.in filter if there are completed prompts
  if (completedPromptIds.length > 0) {
    query = query.not('id', 'in', `(${completedPromptIds.join(',')})`);
  }

  const { data: availablePrompts, error } = await query;
  if (error) throw error;

  return availablePrompts?.[0] || null;
};

export const getCompletedPromptIds = async (userId: string): Promise<string[]> => {
  const { data: completedProgress } = await supabase
    .from('user_growth_progress')
    .select('prompt_id')
    .eq('user_id', userId)
    .eq('is_completed', true);

  return completedProgress?.map(p => p.prompt_id) || [];
};
