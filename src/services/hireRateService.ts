import { supabase } from "@/integrations/supabase/client";

export interface ScoreImprovement {
  previousScore: number;
  newScore: number;
  improvement: number;
  milestone?: string;
}

// Track score improvements for celebration feedback
export async function trackScoreImprovement(
  userId: string, 
  newScore: number
): Promise<ScoreImprovement | null> {
  try {
    // Get the current stored score
    const { data: currentData } = await supabase
      .from('user_profiles')
      .select('hire_rate_score')
      .eq('user_id', userId)
      .single();

    const previousScore = currentData?.hire_rate_score || 0;
    const improvement = newScore - previousScore;

    // Only track if there's meaningful improvement
    if (improvement >= 5) {
      let milestone: string | undefined;
      
      // Check for milestone achievements
      if (previousScore < 50 && newScore >= 50) {
        milestone = "Growing Strong! You're building momentum.";
      } else if (previousScore < 70 && newScore >= 70) {
        milestone = "Almost There! Recruiters are starting to notice.";
      } else if (previousScore < 90 && newScore >= 90) {
        milestone = "Hire-Ready! You're ready to impress any recruiter.";
      }

      return {
        previousScore,
        newScore,
        improvement,
        milestone
      };
    }

    return null;
  } catch (error) {
    console.error('Error tracking score improvement:', error);
    return null;
  }
}

// Get personalized coaching message based on current score and progress
export function getCoachingMessage(score: number, recentImprovement?: number): string {
  if (recentImprovement && recentImprovement >= 10) {
    return "🚀 Amazing progress! You're really building something special.";
  }
  
  if (score >= 90) {
    return "✨ Outstanding! You're ready to connect with top opportunities.";
  }
  
  if (score >= 70) {
    return "🎯 You're on the right track. A few more touches and you'll be unstoppable.";
  }
  
  if (score >= 50) {
    return "💪 Keep building. Every step forward is creating new possibilities.";
  }
  
  return "🌱 You're just getting started, and that's perfectly fine. Great things take time.";
}