
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
      await saveInsightsToDatabase(user.id, newInsights);
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
    console.log('Navigating to:', insight.navigation_target);
    
    if (insight.navigation_target) {
      try {
        if (insight.navigation_target.includes('#')) {
          const [path, tab] = insight.navigation_target.split('#');
          navigate(path, { state: { activeTab: tab } });
        } else {
          navigate(insight.navigation_target);
        }
        
        trackUserAction('insight_interacted', { 
          action: 'navigate_to_complete', 
          insight_type: insight.insight_type,
          target: insight.navigation_target
        });
        
        toast.success(`Redirecting you to complete this action...`);
      } catch (error) {
        console.error('Navigation error:', error);
        toast.error('Failed to navigate to the requested page');
      }
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
