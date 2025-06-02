
import { supabase } from "@/integrations/supabase/client";
import { UserGrowthStats } from "./types";

export const getUserStats = async (userId: string): Promise<UserGrowthStats | null> => {
  let { data: stats, error: statsError } = await supabase
    .from('user_growth_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (statsError && statsError.code !== 'PGRST116') {
    throw statsError;
  }

  return stats;
};

export const createUserStats = async (userId: string): Promise<UserGrowthStats> => {
  const { data: newStats, error: createStatsError } = await supabase
    .from('user_growth_stats')
    .insert({
      user_id: userId,
      current_stage: 'identity_setup',
      total_completed: 0,
      current_streak: 0,
      longest_streak: 0
    })
    .select()
    .single();

  if (createStatsError) {
    console.error('Error creating user stats:', createStatsError);
    // If there's a duplicate key error, try to fetch existing stats
    if (createStatsError.code === '23505') {
      const { data: existingStats } = await supabase
        .from('user_growth_stats')
        .select('*')
        .eq('user_id', userId)
        .single();
      return existingStats;
    } else {
      throw createStatsError;
    }
  }

  return newStats;
};

export const updateUserStats = async (
  userId: string, 
  updates: Partial<UserGrowthStats>
): Promise<UserGrowthStats> => {
  const { data: updatedStats, error: statsError } = await supabase
    .from('user_growth_stats')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (statsError) throw statsError;
  return updatedStats;
};
