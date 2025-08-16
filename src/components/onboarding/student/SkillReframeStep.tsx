import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading";
import { analyzeSkillReframe } from "@/services/question/studentOnboardingService";

interface SkillReframeStepProps {
  onComplete: (originalSkill: string, analysis: any) => void;
  stepNumber: number;
  totalSteps: number;
  isSubmitting: boolean;
}

export function SkillReframeStep({ 
  onComplete, 
  stepNumber, 
  totalSteps,
  isSubmitting 
}: SkillReframeStepProps) {
  const [skill, setSkill] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const examples = [
    {
      before: "I know Excel",
      after: "I can track marketing expenses so no one has to double-check my work."
    },
    {
      before: "I studied psychology",
      after: "I know how to design surveys that people actually answer — so we can get real feedback."
    },
    {
      before: "I did a group project",
      after: "I can coordinate team deliverables and keep projects on schedule using proven collaboration tools."
    }
  ];

  const canProceed = skill.trim().length > 10;

  const handleSubmit = async () => {
    if (!canProceed || isSubmitting || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSkillReframe(skill);
      onComplete(skill, analysis);
    } catch (error) {
      console.error('Error analyzing skill:', error);
      // Proceed with fallback
      onComplete(skill, {
        reframed_skill: "I can apply what I've learned to solve real business challenges",
        business_value_type: "quality-improving",
        ai_category: "general",
        encouragement: "You're thinking about how your skills create value!"
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
            Step {stepNumber} of {totalSteps} • Power Moment #1
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Show Your Value
          </h2>
        </div>

        <div className="bg-muted/30 p-6 rounded-lg space-y-4">
          <p className="text-sm text-muted-foreground">
            Lots of students say things like "I know Excel" or "I did a marketing course." That's not bad — but it doesn't show value.
          </p>
          <p className="text-sm font-medium text-foreground">
            Let's try something else:
          </p>
          <p className="text-base text-foreground">
            "What's something you learned in school that could actually solve a problem for a company today?"
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
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">"{example.before}"</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-foreground font-medium">"{example.after}"</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="skill" className="text-base font-medium">
            I could help a company by...
          </Label>
          <Textarea
            id="skill"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Think about specific problems you could solve or value you could create..."
            className="min-h-[120px] text-base"
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground text-right">
            {skill.length}/500 characters
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
                <span>Analyzing your skill...</span>
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