
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GrowthCard } from "./GrowthCard";
import { GrowthStats } from "./GrowthStats";
import { useGrowthCards } from "@/hooks/useGrowthCards";
import { LoadingSpinner } from "@/components/loading/LoadingSpinner";
import { Sparkles, BarChart3, ArrowLeft } from "lucide-react";
import { gsap } from "gsap";

interface GrowthCardWidgetProps {
  userId: string | undefined;
}

export function GrowthCardWidget({ userId }: GrowthCardWidgetProps) {
  const [showStats, setShowStats] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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

  const handleViewToggle = (showStatsView: boolean) => {
    setIsTransitioning(true);
    
    // Fade out current content
    gsap.to('.growth-content', {
      opacity: 0,
      y: -10,
      duration: 0.2,
      ease: "power2.out",
      onComplete: () => {
        setShowStats(showStatsView);
        // Fade in new content
        gsap.fromTo('.growth-content', 
          { opacity: 0, y: 10 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.3, 
            ease: "power2.out",
            onComplete: () => setIsTransitioning(false)
          }
        );
      }
    });
  };

  if (showStats) {
    return (
      <div className="space-y-4">
        <div className="growth-content">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Growth Progress</h2>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewToggle(false)}
              disabled={isTransitioning}
              className="transition-all duration-200 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Challenge
            </Button>
          </div>
          
          <GrowthStats 
            stats={userStats} 
            stageDisplayName={getStageDisplayName(userStats.current_stage)} 
          />
        </div>
      </div>
    );
  }

  if (!currentPrompt) {
    return (
      <div className="growth-content">
        <Card className="p-6 text-center bg-gradient-to-br from-green-50/50 via-blue-50/30 to-cyan-50/40 border border-green-200/50">
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
            onClick={() => handleViewToggle(true)}
            disabled={isTransitioning}
            className="mt-2 transition-all duration-200"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Progress
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="growth-content">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Weekly Growth Challenge</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewToggle(true)}
            disabled={isTransitioning}
            className="transition-all duration-200 hover:bg-gray-50"
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
    </div>
  );
}
