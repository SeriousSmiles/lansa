import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Brain } from "lucide-react";
import { useHireRateScore } from "@/hooks/useHireRateScore";
import { useProfileData } from "@/hooks/useProfileData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function HireRateProgress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = useProfileData(user?.id);
  const { score, level, nextAction, coachingMessage, aiRecommendation, isAnalyzing } = useHireRateScore(profile);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Hire-Ready':
        return 'bg-primary text-primary-foreground';
      case 'Almost Ready':
        return 'bg-secondary text-secondary-foreground';
      case 'Building Strong':
        return 'bg-muted-foreground/20 text-muted-foreground';
      default:
        return 'bg-muted-foreground/10 text-muted-foreground';
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-primary';
    if (score >= 65) return 'bg-secondary';
    if (score >= 35) return 'bg-muted-foreground';
    return 'bg-muted-foreground/60';
  };

  const handleActionClick = () => {
    // Smart navigation based on AI recommendations
    if (aiRecommendation?.specificSection) {
      const section = aiRecommendation.specificSection;
      switch (section) {
        case 'title':
        case 'about':
        case 'skills':
        case 'experience':
        case 'education':
          navigate(`/profile#${section}`);
          break;
        default:
          navigate('/profile');
      }
    } else {
      navigate('/profile');
    }
  };

  return (
    <Card className="p-3 border border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isAnalyzing ? (
            <Brain className="h-3 w-3 text-primary animate-pulse" />
          ) : (
            <TrendingUp className="h-3 w-3 text-primary" />
          )}
          <span className="text-sm font-medium text-foreground">Hire Rate</span>
        </div>
        <Badge 
          variant="secondary" 
          className={`text-[10px] px-1.5 py-0.5 font-medium ${getLevelColor(level)}`}
        >
          {level}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-sm font-semibold text-foreground">{score}%</span>
        </div>
        
        <div className="relative">
          <Progress 
            value={score} 
            className="h-1 bg-muted/50" 
          />
          <div 
            className={`absolute top-0 left-0 h-1 rounded-full transition-all duration-500 ${getProgressColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {isAnalyzing ? "Analyzing your profile for personalized recommendations..." : coachingMessage}
        </p>
        
        {aiRecommendation?.reasoning && (
          <p className="text-[10px] text-muted-foreground/80 italic">
            {aiRecommendation.reasoning}
          </p>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleActionClick}
          disabled={isAnalyzing}
          className="w-full h-6 text-xs font-medium text-primary hover:text-primary-foreground hover:bg-primary/90 transition-colors p-1 disabled:opacity-50"
        >
          <span className="truncate">{isAnalyzing ? "Analyzing..." : nextAction}</span>
          <ArrowRight className="h-2.5 w-2.5 ml-1 flex-shrink-0" />
        </Button>
      </div>
    </Card>
  );
}