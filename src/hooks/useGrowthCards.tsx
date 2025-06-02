
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GrowthPrompt {
  id: string;
  title: string;
  description: string;
  stage: string;
  order_index: number;
  is_active: boolean;
  action_type: string;
  action_label: string;
  created_at: string;
  updated_at: string;
}

export interface UserGrowthProgress {
  id: string;
  user_id: string;
  prompt_id: string;
  completed_at: string | null;
  is_completed: boolean;
  week_assigned: string;
  created_at: string;
  updated_at: string;
}

export interface UserGrowthStats {
  id: string;
  user_id: string;
  total_completed: number;
  current_streak: number;
  longest_streak: number;
  current_stage: string;
  last_completion_date: string | null;
  current_prompt_id: string | null;
  current_prompt_assigned_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useGrowthCards(userId: string | undefined) {
  const [currentPrompt, setCurrentPrompt] = useState<GrowthPrompt | null>(null);
  const [userStats, setUserStats] = useState<UserGrowthStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchGrowthData();
    }
  }, [userId]);

  const fetchGrowthData = async () => {
    if (!userId) return;

    try {
      // First, get or create user stats
      let { data: stats, error: statsError } = await supabase
        .from('user_growth_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      // If no stats exist, create them
      if (!stats) {
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
            stats = existingStats;
          } else {
            throw createStatsError;
          }
        } else {
          stats = newStats;
        }
      }

      setUserStats(stats);

      // Get current prompt or assign a new one
      await getCurrentOrAssignPrompt(stats);
      
    } catch (error) {
      console.error('Error fetching growth data:', error);
      toast({
        title: "Error loading growth cards",
        description: "Could not load your growth challenge data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentOrAssignPrompt = async (stats: UserGrowthStats) => {
    // If user has a current prompt assigned, fetch it
    if (stats.current_prompt_id) {
      const { data: prompt, error } = await supabase
        .from('growth_prompts')
        .select('*')
        .eq('id', stats.current_prompt_id)
        .single();

      if (!error && prompt) {
        setCurrentPrompt(prompt);
        return;
      }
    }

    // Otherwise, assign a new prompt based on current stage and completed prompts
    await assignNewPrompt(stats);
  };

  const assignNewPrompt = async (stats: UserGrowthStats) => {
    try {
      // Get all completed prompts for this user
      const { data: completedProgress } = await supabase
        .from('user_growth_progress')
        .select('prompt_id')
        .eq('user_id', userId)
        .eq('is_completed', true);

      const completedPromptIds = completedProgress?.map(p => p.prompt_id) || [];

      // Get next available prompt in current stage
      let query = supabase
        .from('growth_prompts')
        .select('*')
        .eq('stage', stats.current_stage)
        .eq('is_active', true)
        .order('order_index')
        .limit(1);

      // Only add the not.in filter if there are completed prompts
      if (completedPromptIds.length > 0) {
        query = query.not('id', 'in', `(${completedPromptIds.join(',')})`);
      }

      const { data: availablePrompts, error } = await query;

      if (error) throw error;

      let nextPrompt = availablePrompts?.[0];

      // If no prompts available in current stage, move to next stage
      if (!nextPrompt) {
        const nextStage = getNextStage(stats.current_stage);
        if (nextStage) {
          // Update user stats to next stage
          const { data: updatedStats, error: updateError } = await supabase
            .from('user_growth_stats')
            .update({ current_stage: nextStage })
            .eq('user_id', userId)
            .select()
            .single();

          if (updateError) throw updateError;
          setUserStats(updatedStats);

          // Get first prompt from next stage
          let nextStageQuery = supabase
            .from('growth_prompts')
            .select('*')
            .eq('stage', nextStage)
            .eq('is_active', true)
            .order('order_index')
            .limit(1);

          // Only add the not.in filter if there are completed prompts
          if (completedPromptIds.length > 0) {
            nextStageQuery = nextStageQuery.not('id', 'in', `(${completedPromptIds.join(',')})`);
          }

          const { data: nextStagePrompts, error: nextStageError } = await nextStageQuery;

          if (nextStageError) throw nextStageError;
          nextPrompt = nextStagePrompts?.[0];
        }
      }

      if (nextPrompt) {
        // Update user stats with current prompt
        await supabase
          .from('user_growth_stats')
          .update({
            current_prompt_id: nextPrompt.id,
            current_prompt_assigned_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        setCurrentPrompt(nextPrompt);
      }

    } catch (error) {
      console.error('Error assigning new prompt:', error);
    }
  };

  const getNextStage = (currentStage: string): string | null => {
    const stages = ['identity_setup', 'clarity_positioning', 'external_visibility', 'personal_growth_loop'];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  };

  const completePrompt = async (promptId: string) => {
    if (!userId || !userStats) return;

    try {
      const now = new Date().toISOString();

      // Mark prompt as completed
      const { error: progressError } = await supabase
        .from('user_growth_progress')
        .upsert({
          user_id: userId,
          prompt_id: promptId,
          is_completed: true,
          completed_at: now,
          week_assigned: userStats.current_prompt_assigned_at || now
        });

      if (progressError) throw progressError;

      // Update user stats
      const newTotalCompleted = userStats.total_completed + 1;
      const newStreak = calculateNewStreak(userStats.last_completion_date);
      const newLongestStreak = Math.max(userStats.longest_streak, newStreak);

      const { data: updatedStats, error: statsError } = await supabase
        .from('user_growth_stats')
        .update({
          total_completed: newTotalCompleted,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_completion_date: now,
          current_prompt_id: null,
          current_prompt_assigned_at: null
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (statsError) throw statsError;

      setUserStats(updatedStats);
      setCurrentPrompt(null);

      // Assign next prompt
      await assignNewPrompt(updatedStats);

      toast({
        title: "Challenge completed! 🎉",
        description: "Great job! Your next challenge is ready.",
      });

    } catch (error) {
      console.error('Error completing prompt:', error);
      toast({
        title: "Error completing challenge",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const calculateNewStreak = (lastCompletionDate: string | null): number => {
    if (!lastCompletionDate) return 1;

    const lastDate = new Date(lastCompletionDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    // If completed within last 7 days, continue streak, otherwise reset
    return daysDiff <= 7 ? userStats!.current_streak + 1 : 1;
  };

  const getStageDisplayName = (stage: string): string => {
    const stageNames: Record<string, string> = {
      'identity_setup': 'Identity Setup',
      'clarity_positioning': 'Clarity & Positioning',
      'external_visibility': 'External Visibility',
      'personal_growth_loop': 'Personal Growth Loop'
    };
    return stageNames[stage] || stage;
  };

  return {
    currentPrompt,
    userStats,
    isLoading,
    completePrompt,
    refreshGrowthData: fetchGrowthData,
    getStageDisplayName
  };
}
