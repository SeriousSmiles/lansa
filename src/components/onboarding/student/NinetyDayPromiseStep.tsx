import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading";
import { analyzeNinetyDayGoal } from "@/services/question/studentOnboardingService";

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
        interpretation: "You're thinking about specific outcomes and taking initiative - that's exactly what employers want to see!",
        initiative_type: "operational",
        clarity_level: "clear",
        strengths: "Shows forward-thinking and desire to contribute meaningfully",
        employer_perspective: "This person thinks about results and wants to make an impact from day one."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-8 bg-card border-border">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Step {stepNumber} of {totalSteps} • Power Moment #2
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Your 90-Day Promise
          </h2>
        </div>

        <div className="bg-muted/30 p-6 rounded-lg space-y-4">
          <p className="text-base text-foreground">
            "If a company hired you today, what's one result you'd try to deliver in your first 3 months?"
          </p>
          <p className="text-sm text-muted-foreground">
            This shows you think about outcomes, not just tasks. Employers love this mindset.
          </p>
        </div>

        {/* Examples */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExamples(!showExamples)}
            className="text-primary hover:text-primary/80"
          >
            {showExamples ? "Hide examples" : "Want help? See examples"}
          </Button>

          {showExamples && (
            <div className="space-y-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
              {examples.map((example, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="text-foreground">{example}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="goal" className="text-base font-medium">
            If I were hired today, in 90 days I would try to...
          </Label>
          <Textarea
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Think about a specific result or improvement you could create..."
            className="min-h-[120px] text-base"
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground text-right">
            {goal.length}/500 characters
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSubmit}
            disabled={!canProceed || isSubmitting || isAnalyzing}
            className="w-full"
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
              "Continue"
            )}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This one's important — take your time.
          </p>
        </div>
      </div>
    </Card>
  );
}