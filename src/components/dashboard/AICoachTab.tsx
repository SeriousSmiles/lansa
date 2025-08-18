
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AIInsight, getUserInsights, markInsightAsRead, generateInsights, saveInsightsToDatabase, checkAndRemoveCompletedInsights } from "@/services/aiInsights";
import { trackUserAction } from "@/services/actionTracking";
import { toast } from "sonner";
import { InsightHeader } from "./insights/InsightHeader";
import { InsightCard } from "./insights/InsightCard";
import { EmptyInsightsState } from "./insights/EmptyInsightsState";
import { LoadingInsightsState } from "./insights/LoadingInsightsState";

export function AICoachTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadInsights();
      trackUserAction('insight_opened', { tab: 'ai_coach' });
    }
  }, [user?.id]);

  const loadInsights = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      await checkAndRemoveCompletedInsights(user.id);
      const userInsights = await getUserInsights(user.id);
      console.log('Loaded insights:', userInsights);
      setInsights(userInsights);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewInsights = async () => {
    if (!user?.id) return;
    
    setIsGenerating(true);
    try {
      await checkAndRemoveCompletedInsights(user.id);
      const newInsights = await generateInsights(user.id);
      await saveInsightsToDatabase(newInsights);
      await loadInsights();
      
      if (newInsights.length > 0) {
        toast.success(`Generated ${newInsights.length} new insight${newInsights.length > 1 ? 's' : ''} for you!`);
      } else {
        toast.info("You're doing great! No new insights needed right now.");
      }
      
      trackUserAction('insight_interacted', { action: 'generate_insights', count: newInsights.length });
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate new insights');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsightAction = async (insight: AIInsight) => {
    // Ensure we have a valid navigation target
    const navigationTarget = insight.navigation_target || "/dashboard";
    
    console.log('Navigating to:', navigationTarget);
    
    try {
      if (navigationTarget.includes('#')) {
        const [path, tab] = navigationTarget.split('#');
        navigate(path, { state: { activeTab: tab } });
      } else {
        navigate(navigationTarget);
      }
      
      trackUserAction('insight_interacted', { 
        action: 'navigate_to_complete', 
        insight_type: insight.insight_type,
        target: navigationTarget
      });
      
      toast.success(`Redirecting you to complete this action...`);
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Failed to navigate to the requested page');
    }
  };

  const handleMarkAsComplete = async (insight: AIInsight, event: React.MouseEvent) => {
    event.stopPropagation();
    
    await markInsightAsRead(insight.id);
    setInsights(prev => prev.filter(i => i.id !== insight.id));
    trackUserAction('insight_interacted', { 
      action: 'mark_complete', 
      insight_type: insight.insight_type 
    });
    toast.success('Insight marked as complete!');
  };

  if (isLoading) {
    return <LoadingInsightsState />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <InsightHeader 
        onRefresh={generateNewInsights}
        isGenerating={isGenerating}
      />

      {insights.length === 0 ? (
        <EmptyInsightsState />
      ) : (
        <div className="grid gap-4">
          {insights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onAction={handleInsightAction}
              onMarkComplete={handleMarkAsComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
