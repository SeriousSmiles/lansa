
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { AIInsight, getUserInsights, markInsightAsRead, generateInsights, saveInsightsToDatabase, checkAndRemoveCompletedInsights } from "@/services/aiInsights";
import { trackUserAction } from "@/services/actionTracking";
import { toast } from "sonner";

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
      // First check and remove completed insights
      await checkAndRemoveCompletedInsights(user.id);
      
      // Then load current insights
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
      // Check and remove completed insights first
      await checkAndRemoveCompletedInsights(user.id);
      
      // Generate new insights
      const newInsights = await generateInsights(user.id);
      await saveInsightsToDatabase(user.id, newInsights);
      
      // Reload insights
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
    // Navigate to the required page/section
    if (insight.navigation_target) {
      // If it's a dashboard tab, handle tab switching
      if (insight.navigation_target.includes('#')) {
        const [path, tab] = insight.navigation_target.split('#');
        navigate(path);
        // You could emit an event here to switch tabs if needed
      } else {
        navigate(insight.navigation_target);
      }
      
      // Track the navigation action
      trackUserAction('insight_interacted', { 
        action: 'navigate_to_complete', 
        insight_type: insight.insight_type,
        target: insight.navigation_target
      });
      
      toast.success(`Redirecting you to complete this action...`);
    }
  };

  const handleMarkAsComplete = async (insight: AIInsight, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the card click
    
    await markInsightAsRead(insight.id);
    setInsights(prev => prev.filter(i => i.id !== insight.id));
    trackUserAction('insight_interacted', { 
      action: 'mark_complete', 
      insight_type: insight.insight_type 
    });
    toast.success('Insight marked as complete!');
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-green-100 text-green-800 border-green-200";
      case 2: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 3: return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return "Quick Win";
      case 2: return "Worth Doing";
      case 3: return "Important";
      default: return "Suggestion";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Brain className="h-8 w-8 mx-auto mb-4 text-[#FF6B4A] animate-pulse" />
          <p className="text-gray-600">Loading your personalized insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Brain className="h-7 w-7 text-[#FF6B4A]" />
            AI Coach
          </h2>
          <p className="text-gray-600 mt-1">
            Personalized insights to help you make the most of Lansa
          </p>
        </div>
        
        <Button 
          onClick={generateNewInsights}
          disabled={isGenerating}
          className="bg-[#FF6B4A] hover:bg-[#E55A3A]"
        >
          {isGenerating ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh Insights
            </>
          )}
        </Button>
      </div>

      {/* Insights */}
      {insights.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold mb-2">You're All Caught Up!</h3>
            <p className="text-gray-600 mb-4">
              Great job! You're making excellent progress with your professional presence.
            </p>
            <p className="text-sm text-gray-500">
              New insights will appear here as you continue using Lansa.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {insights.map((insight) => (
            <Card 
              key={insight.id} 
              className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-[#FF6B4A] group"
              onClick={() => handleInsightAction(insight)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {insight.title}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6B4A]" />
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getPriorityColor(insight.priority)}
                    >
                      {getPriorityLabel(insight.priority)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleMarkAsComplete(insight, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-3">{insight.message}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Click to go to {insight.navigation_target?.replace('/', '') || 'action'}</span>
                  <span>or mark as complete →</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
