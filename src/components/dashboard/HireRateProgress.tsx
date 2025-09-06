import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Brain, ChevronDown, ChevronUp } from "lucide-react";
import { useHireRateScore } from "@/hooks/useHireRateScore";
import { useProfileData } from "@/hooks/useProfileData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

export function HireRateProgress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = useProfileData(user?.id);
  const { score, level, nextAction, coachingMessage, aiRecommendation, isAnalyzing } = useHireRateScore(profile);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const getActionBlocks = () => {
    const blocks = [];
    
    // Priority actions based on AI recommendations and profile state
    if (!profile.userTitle || profile.userTitle.length < 10) {
      blocks.push({
        title: "Create compelling professional title",
        reason: "Employers scan titles first - yours should instantly communicate your value",
        context: "Takes 2 minutes, boosts visibility by 40%",
        action: () => navigate('/profile#title')
      });
    }
    
    if (!profile.aboutText || profile.aboutText.length < 100) {
      blocks.push({
        title: "Write your story in About section",
        reason: "Connect your experiences to your career goals with authentic narrative",
        context: "5-minute guided process with AI assistance",
        action: () => navigate('/profile#about')
      });
    }
    
    if (!profile.userSkills || profile.userSkills.length < 3) {
      blocks.push({
        title: "Add relevant skills",
        reason: "Skills matching is how recruiters find you in searches",
        context: "Add 5-8 skills that match your target roles",
        action: () => navigate('/profile#skills')
      });
    }
    
    return blocks.slice(0, 3); // Max 3 blocks
  };

  const actionBlocks = getActionBlocks();

  const toggleExpansion = () => {
    if (!actionsRef.current) return;
    
    if (!isExpanded) {
      // Expand animation
      setIsExpanded(true);
      gsap.fromTo(actionsRef.current, 
        { height: 0, opacity: 0 },
        { 
          height: "auto", 
          opacity: 1, 
          duration: 0.4, 
          ease: "power2.out",
          onComplete: () => {
            if (actionsRef.current) {
              gsap.set(actionsRef.current, { height: "auto" });
            }
          }
        }
      );
      
      // Stagger animate action blocks
      const blocks = actionsRef.current.querySelectorAll('.action-block');
      gsap.fromTo(blocks,
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.3, 
          stagger: 0.1, 
          delay: 0.2,
          ease: "power2.out"
        }
      );
    } else {
      // Collapse animation
      gsap.to(actionsRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setIsExpanded(false)
      });
    }
  };

  useEffect(() => {
    if (actionsRef.current && !isExpanded) {
      gsap.set(actionsRef.current, { height: 0, opacity: 0 });
    }
  }, []);

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

      {/* Show Actions Button */}
      <div className="mt-3">
        <Button
          ref={buttonRef}
          variant="ghost"
          size="sm"
          onClick={toggleExpansion}
          disabled={isAnalyzing}
          className="w-full h-6 text-xs font-medium text-primary hover:text-primary-foreground hover:bg-primary/10 transition-all duration-200 p-1 disabled:opacity-50"
        >
          <span className="truncate">
            {isAnalyzing ? "Analyzing..." : isExpanded ? "Hide Actions" : "Show Actions"}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-2.5 w-2.5 ml-1 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-2.5 w-2.5 ml-1 flex-shrink-0" />
          )}
        </Button>
      </div>

      {/* Expandable Actions */}
      <div 
        ref={actionsRef}
        className="overflow-hidden"
      >
        <div className="mt-3 space-y-2">
          {actionBlocks.map((block, index) => (
            <div
              key={index}
              className="action-block p-3 rounded-lg bg-muted/30 border border-border/30 cursor-pointer hover:bg-muted/50 transition-colors duration-200"
              onClick={block.action}
            >
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-foreground leading-tight">
                  {block.title}
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {block.reason}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground/80 italic">
                    {block.context}
                  </span>
                  <ArrowRight className="h-2 w-2 text-primary flex-shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}