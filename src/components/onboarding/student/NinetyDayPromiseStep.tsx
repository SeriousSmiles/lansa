import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading";
import { analyzeNinetyDayGoal } from "@/services/question/studentOnboardingService";
import { OnboardingLayout } from "../layout/OnboardingLayout";
import { OnboardingCard } from "../layout/OnboardingCard";
import lansaGoalImage from "@/assets/onboarding/lansa-90day-goal.jpg";

interface NinetyDayPromiseStepProps {
  onComplete: (goalStatement: string, analysis: any) => void;
  stepNumber: number;
  totalSteps: number;
  isSubmitting: boolean;
}

export function NinetyDayPromiseStep({ 
  onComplete, 
  stepNumber, 
  totalSteps,
  isSubmitting 
}: NinetyDayPromiseStepProps) {
  const [goal, setGoal] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const examples = [
    "Help reduce customer complaints by improving how we reply to messages.",
    "Launch a small TikTok campaign and get 1,000 views from local users.",
    "Create a simple system to track which marketing campaigns work best.",
    "Build relationships with 5 key clients and understand their biggest challenges."
  ];

  const canProceed = goal.trim().length > 15;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = async () => {
    if (!canProceed || isSubmitting || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeNinetyDayGoal(goal);
      onComplete(goal, analysis);
    } catch (error) {
      console.error('Error analyzing goal:', error);
      // Proceed with fallback
      onComplete(goal, {
        recruiter_perspective: "To a recruiter, thinking about your 90-day goal shows forward-planning mindset that employers value.",
        score: 6,
        score_breakdown: {
          clarity: 2,
          relevance: 2,
          realism: 2,
          professional_impression: 1
        },
        coaching_nudge: "Add specific steps or measurable outcomes to make your goal more compelling.",
        interpretation: "You're thinking about specific outcomes and taking initiative - that's exactly what employers want to see!",
        initiative_type: "operational",
        clarity_level: "clear"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <OnboardingLayout 
      currentStep={stepNumber} 
      totalSteps={totalSteps}
      title="Getting Started"
    >
      <OnboardingCard
        image={lansaGoalImage}
        imageAlt="90-day goals and achievement"
        title="Your 90-Day Promise"
        subtitle="Show employers you think about outcomes, not just tasks."
        stepBadge={`Step ${stepNumber} of ${totalSteps} • Power Moment #2`}
      >
        <div className="space-y-6">

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-xl border border-green-200 dark:border-green-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start space-y-3 md:space-y-0 md:space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 dark:text-green-400 text-sm">🎯</span>
                </div>
                <div className="space-y-3">
                  <p className="text-base md:text-lg font-semibold text-foreground bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border-l-4 border-primary text-left">
                    "If a company hired you today, what's one result you'd try to deliver in your first 3 months?"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This shows you think about outcomes, not just tasks. Employers love this forward-thinking mindset.
                  </p>
                </div>
              </div>
            </div>

            {/* Examples */}
            <div className="space-y-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExamples(!showExamples)}
                className="border-primary/20 text-primary hover:bg-primary/5"
              >
                {showExamples ? "Hide examples" : "🚀 Want inspiration? See examples"}
              </Button>

              {showExamples && (
                <div className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-foreground mb-3">Great 90-day promises focus on specific outcomes:</h4>
                  <div className="grid gap-3">
                    {examples.map((example, index) => (
                      <div key={index} className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border border-white/50">
                        <div className="flex flex-col md:flex-row md:items-start space-y-2 md:space-y-0 md:space-x-2">
                          <span className="text-purple-500 font-medium text-sm flex-shrink-0 mt-0.5">✨</span>
                          <span className="text-foreground text-sm font-medium">{example}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="goal" className="text-lg font-semibold text-foreground">
                If I were hired today, in 90 days I would try to...
              </Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Think about a specific result or improvement you could create... What measurable impact could you make?"
                className="min-h-[140px] text-base p-4 bg-background border-2 border-border focus:border-primary transition-colors resize-none"
                maxLength={500}
              />
              <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                <div className="text-xs text-muted-foreground">
                  💡 Tip: Think specific outcomes, not just activities
                </div>
                <div className="text-xs text-muted-foreground">
                  {goal.length}/500 characters
                </div>
              </div>
            </div>

          <div className="pt-8">
            <Button 
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting || isAnalyzing}
              className="w-full py-3 lg:py-4 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              size="lg"
            >
              {isAnalyzing ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner />
                  <span>Analyzing your goal...</span>
                </div>
              ) : isSubmitting ? (
                "Saving..."
              ) : (
                "Create My Promise"
              )}
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              🚀 This shows initiative — employers love forward-thinking candidates.
            </p>
          </div>
        </div>
      </OnboardingCard>
    </OnboardingLayout>
  );
}