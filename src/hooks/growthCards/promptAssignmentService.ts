import { supabase } from "@/integrations/supabase/client";
import { GrowthPrompt, UserGrowthStats } from "./types";
import { getNextAvailablePrompt, getCompletedPromptIds, getCurrentPrompt } from "./promptService";
import { getNextStage } from "./stageUtils";
import { updateUserStats } from "./userStatsService";

export const getCurrentOrAssignPrompt = async (
  stats: UserGrowthStats,
  userId: string,
  mountedRef: React.MutableRefObject<boolean>
): Promise<GrowthPrompt | null> => {
  // If user has a current prompt assigned, fetch it
  if (stats.current_prompt_id) {
    const prompt = await getCurrentPrompt(stats.current_prompt_id);
    if (prompt && mountedRef.current) {
      return prompt;
    }
  }

  // Otherwise, assign a new prompt based on current stage and completed prompts
  return await assignNewPrompt(stats, userId, mountedRef);
};

export const assignNewPrompt = async (
  stats: UserGrowthStats,
  userId: string,
  mountedRef: React.MutableRefObject<boolean>
): Promise<GrowthPrompt | null> => {
  try {
    // Get all completed prompts for this user
    const completedPromptIds = await getCompletedPromptIds(userId);

    // Get next available prompt in current stage
    let nextPrompt = await getNextAvailablePrompt(stats.current_stage, completedPromptIds);

    // If no prompts available in current stage, move to next stage
    if (!nextPrompt) {
      const nextStage = getNextStage(stats.current_stage);
      if (nextStage) {
        // Update user stats to next stage
        const updatedStats = await updateUserStats(userId, { current_stage: nextStage });
        
        // Get first prompt from next stage
        nextPrompt = await getNextAvailablePrompt(nextStage, completedPromptIds);
      }
    }

    if (nextPrompt && mountedRef.current) {
      // Update user stats with current prompt
      await supabase
        .from('user_growth_stats')
        .update({
          current_prompt_id: nextPrompt.id,
          current_prompt_assigned_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return nextPrompt;
    }

    return null;
  } catch (error) {
    console.error('Error assigning new prompt:', error);
    return null;
  }
};
