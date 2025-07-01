
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GrowthCard } from "./GrowthCard";
import { GrowthStats } from "./GrowthStats";
import { useGrowthCards } from "@/hooks/useGrowthCards";
import { LoadingSpinner } from "@/components/loading/LoadingSpinner";
import { Sparkles, BarChart3 } from "lucide-react";

interface GrowthCardWidgetProps {
  userId: string | undefined;
}

export function GrowthCardWidget({ userId }: GrowthCardWidgetProps) {
  const [showStats, setShowStats] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const { 
    currentPrompt, 
    userStats, 
    isLoading, 
    completePrompt, 
    getStageDisplayName 
  } = useGrowthCards(userId);

  if (isLoading) {
    return (
      <Card className="p-6 text-center">
        <LoadingSpinner />
        <p className="text-gray-600 mt-2">Loading your growth challenge...</p>
      </Card>
    );
  }

  if (!userStats) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">Unable to load growth challenges.</p>
      </Card>
    );
  }

  const handleComplete = async (promptId: string) => {
    setIsCompleting(true);
    try {
      await completePrompt(promptId);
    } finally {
      setIsCompleting(false);
    }
  };

  if (showStats) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold">Growth Progress</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowStats(false)}
          >
            Back to Challenge
          </Button>
        </div>
        
        <GrowthStats 
          stats={userStats} 
          stageDisplayName={getStageDisplayName(userStats.current_stage)} 
        />
      </div>
    );
  }

  if (!currentPrompt) {
    return (
      <Card className="p-6 text-center bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h3 className="text-xl font-semibold text-gray-800">All Caught Up!</h3>
        </div>
        <p className="text-gray-600 mb-4">
          You've completed all available challenges in your current stage. 
          New challenges will be available soon!
        </p>
        <Button 
          variant="outline" 
          onClick={() => setShowStats(true)}
          className="mt-2"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          View Progress
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold">Weekly Growth Challenge</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowStats(true)}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Progress
        </Button>
      </div>
      
      <GrowthCard
        prompt={currentPrompt}
        onComplete={handleComplete}
        stageDisplayName={getStageDisplayName(userStats.current_stage)}
        isCompleting={isCompleting}
      />
    </div>
  );
}
