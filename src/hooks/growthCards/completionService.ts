
import { supabase } from "@/integrations/supabase/client";
import { UserGrowthStats } from "./types";

export const markPromptCompleted = async (
  userId: string,
  promptId: string,
  currentPromptAssignedAt: string | null
): Promise<void> => {
  const now = new Date().toISOString();

  const { error: progressError } = await supabase
    .from('user_growth_progress')
    .upsert({
      user_id: userId,
      prompt_id: promptId,
      is_completed: true,
      completed_at: now,
      week_assigned: currentPromptAssignedAt || now
    });

  if (progressError) throw progressError;
};

export const calculateNewStreak = (
  lastCompletionDate: string | null,
  currentStreak: number
): number => {
  if (!lastCompletionDate) return 1;

  const lastDate = new Date(lastCompletionDate);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  // If completed within last 7 days, continue streak, otherwise reset
  return daysDiff <= 7 ? currentStreak + 1 : 1;
};
