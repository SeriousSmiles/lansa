import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { useHireRateScore } from "@/hooks/useHireRateScore";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";

interface HireRateCardProps {
  profile: ProfileDataReturn;
}

export function HireRateCard({ profile }: HireRateCardProps) {
  const { score, readinessLevel, nextAction } = useHireRateScore(profile);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animate score on load and changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
      if (score >= 70 && animatedScore < 70) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [score, animatedScore]);

  const getScoreColor = (currentScore: number) => {
    if (currentScore >= 90) return "text-green-600";
    if (currentScore >= 70) return "text-blue-600"; 
    if (currentScore >= 50) return "text-yellow-600";
    return "text-orange-600";
  };

  const getProgressColor = (currentScore: number) => {
    if (currentScore >= 90) return "bg-green-500";
    if (currentScore >= 70) return "bg-blue-500";
    if (currentScore >= 50) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const handleActionClick = () => {
    if (nextAction?.link) {
      window.location.href = nextAction.link;
    }
  };

  return (
    <Card className="relative overflow-hidden">
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 animate-bounce">
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="absolute top-6 right-8 animate-bounce delay-150">
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>
          <div className="absolute bottom-8 right-4 animate-bounce delay-300">
            <Sparkles className="h-5 w-5 text-green-500" />
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Hire Readiness Progress
          <Badge variant="outline" className="ml-auto">
            {readinessLevel}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Dashboard Section - Clean Progress Display */}
        <div className="text-center space-y-4">
          <div className={`text-6xl font-bold ${getScoreColor(animatedScore)}`}>
            {animatedScore}%
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={animatedScore} 
              className="h-3 transition-all duration-1000 ease-out"
            />
            <p className="text-sm text-muted-foreground">
              {animatedScore >= 90 && "You're ready to impress any recruiter"}
              {animatedScore >= 70 && animatedScore < 90 && "You're closer than you think"}
              {animatedScore >= 50 && animatedScore < 70 && "You're building something great"}
              {animatedScore < 50 && "Every step forward counts"}
            </p>
          </div>
        </div>

        {/* Coach Section - Warm Guidance */}
        {nextAction && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm">Next Step to Grow:</h4>
            <div className="space-y-2">
              <p className="text-sm font-medium">{nextAction.title}</p>
              <p className="text-xs text-muted-foreground">{nextAction.description}</p>
            </div>
            <Button 
              onClick={handleActionClick}
              size="sm" 
              className="w-full group"
            >
              {nextAction.title}
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        )}

        {/* Motivation Message */}
        {animatedScore >= 70 ? (
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary font-medium">
              🎉 Great progress! Recruiters are taking notice.
            </p>
          </div>
        ) : (
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Keep going - you're building something that matters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}