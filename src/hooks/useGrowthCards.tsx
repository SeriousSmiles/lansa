
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { GrowthPrompt, UserGrowthStats } from "./growthCards/types";
import { getUserStats, createUserStats, updateUserStats } from "./growthCards/userStatsService";
import { getCurrentOrAssignPrompt, assignNewPrompt } from "./growthCards/promptAssignmentService";
import { markPromptCompleted, calculateNewStreak } from "./growthCards/completionService";
import { getStageDisplayName } from "./growthCards/stageUtils";

// Re-export types for backward compatibility
export type { GrowthPrompt, UserGrowthStats };

export function useGrowthCards(userId: string | undefined) {
  const [currentPrompt, setCurrentPrompt] = useState<GrowthPrompt | null>(null);
  const [userStats, setUserStats] = useState<UserGrowthStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    async function fetchGrowthData() {
      // Prevent duplicate initialization
      if (!userId || hasInitialized || initializingRef.current) return;

      initializingRef.current = true;
      setIsLoading(true);
      
      try {
        console.log('Growth Cards: Starting initialization for user:', userId);
        
        // First, get or create user stats
        let stats = await getUserStats(userId);

        // Check if component is still mounted
        if (!mountedRef.current) return;

        // If no stats exist, create them
        if (!stats) {
          stats = await createUserStats(userId);
        }

        if (!mountedRef.current) return;
        
        setUserStats(stats);
        console.log('Growth Cards: User stats loaded');

        // Get current prompt or assign a new one
        const prompt = await getCurrentOrAssignPrompt(stats, userId, mountedRef);
        
        if (mountedRef.current && prompt) {
          setCurrentPrompt(prompt);
          console.log('Growth Cards: Current prompt loaded');
        }
        
        if (mountedRef.current) {
          setHasInitialized(true);
        }
        
      } catch (error) {
        console.error('Error fetching growth data:', error);
        if (mountedRef.current) {
          toast({
            title: "Error loading growth cards",
            description: "Could not load your growth challenge data.",
            variant: "destructive",
          });
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        initializingRef.current = false;
      }
    }

    fetchGrowthData();
  }, [userId, hasInitialized, toast]);

  const completePrompt = async (promptId: string) => {
    if (!userId || !userStats) return;

    try {
      const now = new Date().toISOString();

      // Mark prompt as completed
      await markPromptCompleted(userId, promptId, userStats.current_prompt_assigned_at);

      // Update user stats
      const newTotalCompleted = userStats.total_completed + 1;
      const newStreak = calculateNewStreak(userStats.last_completion_date, userStats.current_streak);
      const newLongestStreak = Math.max(userStats.longest_streak, newStreak);

      const updatedStats = await updateUserStats(userId, {
        total_completed: newTotalCompleted,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_completion_date: now,
        current_prompt_id: null,
        current_prompt_assigned_at: null
      });

      if (mountedRef.current) {
        setUserStats(updatedStats);
        setCurrentPrompt(null);
      }

      // Assign next prompt
      const nextPrompt = await assignNewPrompt(updatedStats, userId, mountedRef);
      
      if (mountedRef.current && nextPrompt) {
        setCurrentPrompt(nextPrompt);
      }

      if (mountedRef.current) {
        toast({
          title: "Challenge completed! 🎉",
          description: "Great job! Your next challenge is ready.",
        });
      }

    } catch (error) {
      console.error('Error completing prompt:', error);
      if (mountedRef.current) {
        toast({
          title: "Error completing challenge",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  const refreshGrowthData = async () => {
    if (!userId || initializingRef.current) return;
    
    setHasInitialized(false);
  };

  return {
    currentPrompt,
    userStats,
    isLoading,
    completePrompt,
    refreshGrowthData,
    getStageDisplayName
  };
}
