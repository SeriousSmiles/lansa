import { supabase } from "@/integrations/supabase/client";

export interface AIHireRateRecommendation {
  nextAction: string;
  specificSection: string; // e.g., "about", "skills", "experience", "education"
  reasoning: string;
  coachingMessage: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedImpact: number; // score increase potential
}

interface ProfileAnalysisData {
  profileData?: any;
  userAnswers?: any;
  powerSkills?: any;
  ninetyDayGoal?: any;
  completionPercentage: number;
}

// Cache to avoid excessive API calls
const analysisCache = new Map<string, { data: AIHireRateRecommendation; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function analyzeHireRateWithAI(
  userId: string,
  analysisData: ProfileAnalysisData
): Promise<AIHireRateRecommendation | null> {
  try {
    // Check cache first
    const cacheKey = `${userId}-${JSON.stringify(analysisData).slice(0, 100)}`;
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Call the existing interactive profile guidance function
    const { data, error } = await supabase.functions.invoke('generate-interactive-profile-guidance', {
      body: {
        userId,
        conversationHistory: [],
        requestType: 'initial',
        userMessage: `Please analyze my profile for hire-rate optimization. Focus on the most impactful improvement I can make right now. Profile completion: ${analysisData.completionPercentage}%`
      }
    });

    if (error) {
      console.error('AI hire rate analysis error:', error);
      return null;
    }

    const guidance = data?.guidance;
    if (!guidance) return null;

    // Transform the guidance response into our hire rate recommendation format
    const recommendation: AIHireRateRecommendation = {
      nextAction: extractNextAction(guidance),
      specificSection: determineProfileSection(guidance),
      reasoning: guidance.reasoning || "Based on your profile analysis",
      coachingMessage: guidance.message || "Keep building your professional story!",
      urgency: determineUrgency(analysisData.completionPercentage),
      estimatedImpact: estimateScoreImpact(guidance, analysisData.completionPercentage)
    };

    // Cache the result
    analysisCache.set(cacheKey, { data: recommendation, timestamp: Date.now() });

    return recommendation;
  } catch (error) {
    console.error('Failed to analyze hire rate with AI:', error);
    return null;
  }
}

function extractNextAction(guidance: any): string {
  // Extract the most actionable item from AI guidance
  if (guidance.nextSteps && guidance.nextSteps.length > 0) {
    return guidance.nextSteps[0];
  }
  
  if (guidance.suggestions) {
    const suggestions = guidance.suggestions;
    if (suggestions.title) return "Refine your professional headline";
    if (suggestions.about) return "Enhance your about section";
    if (suggestions.skills?.length) return "Add key skills to your profile";
    if (suggestions.experiences?.length) return "Detail your work experience";
    if (suggestions.education?.length) return "Complete your education section";
  }
  
  return "Complete your profile setup";
}

function determineProfileSection(guidance: any): string {
  if (!guidance.suggestions) return "profile";
  
  const suggestions = guidance.suggestions;
  if (suggestions.title) return "title";
  if (suggestions.about) return "about";
  if (suggestions.skills?.length) return "skills";
  if (suggestions.experiences?.length) return "experience";
  if (suggestions.education?.length) return "education";
  
  return "profile";
}

function determineUrgency(completionPercentage: number): 'low' | 'medium' | 'high' {
  if (completionPercentage < 40) return 'high';
  if (completionPercentage < 70) return 'medium';
  return 'low';
}

function estimateScoreImpact(guidance: any, currentCompletion: number): number {
  // Estimate how much the score could improve with this action
  const baseImpact = currentCompletion < 50 ? 15 : currentCompletion < 80 ? 10 : 5;
  
  // Boost impact for comprehensive suggestions
  if (guidance.suggestions?.about && guidance.suggestions?.title) {
    return Math.min(baseImpact + 5, 20);
  }
  
  return baseImpact;
}

// Clear cache when profile data changes
export function clearHireRateAnalysisCache(userId: string) {
  const keysToDelete = Array.from(analysisCache.keys()).filter(key => key.startsWith(userId));
  keysToDelete.forEach(key => analysisCache.delete(key));
}