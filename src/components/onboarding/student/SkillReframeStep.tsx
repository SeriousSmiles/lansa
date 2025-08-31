import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading";
import { analyzeSkillReframe } from "@/services/question/studentOnboardingService";
import { OnboardingLayout } from "../layout/OnboardingLayout";
import { OnboardingCard } from "../layout/OnboardingCard";
import lansaSkillTransformImage from "@/assets/onboarding/lansa-skill-transform.jpg";

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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
    <OnboardingLayout 
      currentStep={stepNumber} 
      totalSteps={totalSteps}
      title="Getting Started"
    >
      <OnboardingCard
        image={lansaSkillTransformImage}
        imageAlt="Transform skills into value"
        title="Show Your Value"
        subtitle="Transform what you know into value statements that employers notice."
        stepBadge={`Step ${stepNumber} of ${totalSteps} • Power Moment #1`}
      >
        <div className="space-y-6">

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start space-y-3 md:space-y-0 md:space-x-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-600 dark:text-orange-400 text-sm">💡</span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Lots of students say things like "I know Excel" or "I did a marketing course." That's not bad — but it doesn't show value.
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    Let's try something different:
                  </p>
                  <p className="text-base md:text-lg font-semibold text-foreground bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border-l-4 border-primary text-left">
                    "What's something you learned in school that could actually solve a problem for a company today?"
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
                {showExamples ? "Hide examples" : "💡 Want help? See examples"}
              </Button>

              {showExamples && (
                <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-foreground mb-3">Here's how to transform generic skills:</h4>
                  {examples.map((example, index) => (
                    <div key={index} className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border">
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <span className="text-red-500 font-medium text-sm">❌</span>
                          <span className="text-muted-foreground text-sm">"{example.before}"</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-green-500 font-medium text-sm">✅</span>
                          <span className="text-foreground font-medium text-sm">"{example.after}"</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="skill" className="text-lg font-semibold text-foreground">
                I could help a company by...
              </Label>
              <Textarea
                id="skill"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="Think about specific problems you could solve or value you could create... Be specific about the outcome!"
                className="min-h-[140px] text-base p-4 bg-background border-2 border-border focus:border-primary transition-colors resize-none"
                maxLength={500}
              />
              <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                <div className="text-xs text-muted-foreground">
                  💡 Tip: Focus on problems you can solve, not just skills you have
                </div>
                <div className="text-xs text-muted-foreground">
                  {skill.length}/500 characters
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
                  <span>Analyzing your skill...</span>
                </div>
              ) : isSubmitting ? (
                "Saving..."
              ) : (
                "Transform My Skill ✨"
              )}
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              🚀 This one's important — take your time and be specific.
            </p>
          </div>
        </div>
      </OnboardingCard>
    </OnboardingLayout>
  );
}