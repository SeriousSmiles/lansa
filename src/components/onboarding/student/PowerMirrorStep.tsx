import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading";
import { generatePowerMirror, StudentDemographics } from "@/services/question/studentOnboardingService";
import powerMirrorImage from "@/assets/onboarding/power-mirror.jpg";

interface PowerMirrorStepProps {
  skillReframe: string;
  goalStatement: string;
  demographics: StudentDemographics;
  onComplete: (mirror: any) => void;
  stepNumber: number;
  totalSteps: number;
  isSubmitting: boolean;
}

export function PowerMirrorStep({ 
  skillReframe,
  goalStatement,
  demographics,
  onComplete, 
  stepNumber, 
  totalSteps,
  isSubmitting 
}: PowerMirrorStepProps) {
  const [mirror, setMirror] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const generateMirror = async () => {
      setIsGenerating(true);
      try {
        const mirrorData = await generatePowerMirror(skillReframe, goalStatement, demographics);
        setMirror(mirrorData);
      } catch (error) {
        console.error('Error generating mirror:', error);
        setMirror({
          mirror_message: "You're thinking like someone who wants to create value - that's the foundation of career success!",
          key_strengths: ["Value-focused thinking", "Initiative", "Growth mindset"],
          employer_perspective: "This person understands that work is about creating impact, not just completing tasks.",
          next_level_hint: "Keep building on this foundation - you're on the right track!"
        });
      } finally {
        setIsGenerating(false);
      }
    };

    generateMirror();
  }, [skillReframe, goalStatement, demographics]);

  const handleContinue = () => {
    if (mirror && !isSubmitting) {
      onComplete(mirror);
    }
  };

  if (isGenerating) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-8 bg-card border-border">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Step {stepNumber} of {totalSteps} • Power Mirror
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Show You How Employers Think
            </h2>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner />
            <p className="text-muted-foreground">
              Analyzing how your responses appear to hiring managers...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header with Image */}
      <div className="relative mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <img 
              src={powerMirrorImage} 
              alt="Professional transformation mirror"
              className="w-full h-64 object-cover rounded-xl shadow-lg"
            />
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <div className="text-sm text-primary font-medium mb-2">
              Step {stepNumber} of {totalSteps} • Power Mirror
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Employers See You
            </h2>
            <p className="text-lg text-muted-foreground">
              Based on what you wrote, here's how a hiring manager might interpret your answers.
            </p>
          </div>
        </div>
      </div>

      <Card className="shadow-lg border-border">
        <CardContent className="p-8">
          <div className="space-y-6">

        {mirror && (
          <div className="space-y-6">
            {/* Main Mirror Message */}
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
              <p className="text-lg text-foreground font-medium leading-relaxed">
                "{mirror.mirror_message}"
              </p>
            </div>

            {/* Key Strengths */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                Your Key Strengths:
              </h3>
              <div className="flex flex-wrap gap-2">
                {mirror.key_strengths?.map((strength: string, index: number) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Employer Perspective */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                What Employers See:
              </h3>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-foreground italic">
                  "{mirror.employer_perspective}"
                </p>
              </div>
            </div>

            {/* Next Level Hint */}
            {mirror.next_level_hint && (
              <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">💡 Pro Tip:</h4>
                <p className="text-sm text-muted-foreground">
                  {mirror.next_level_hint}
                </p>
              </div>
            )}
          </div>
        )}

            <div className="pt-8">
              <Button 
                onClick={handleContinue}
                disabled={!mirror || isSubmitting}
                className="w-full py-4 text-base md:text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                size="lg"
              >
                {isSubmitting ? "Completing Setup..." : "Build Your Profile Now 🚀"}
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                🎉 You're ready to show the world your value!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}