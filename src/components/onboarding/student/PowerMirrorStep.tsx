import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading";
import { generatePowerMirror, StudentDemographics } from "@/services/question/studentOnboardingService";
import { OnboardingLayout } from "../layout/OnboardingLayout";
import { OnboardingCard } from "../layout/OnboardingCard";
import { PowerMirrorErrorBoundary, usePowerMirrorErrorHandler } from "../PowerMirrorErrorBoundary";
import lansaPowerMirrorImage from "@/assets/onboarding/lansa-power-mirror.jpg";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { handleError } = usePowerMirrorErrorHandler();

  useEffect(() => {
    let isCancelled = false;
    let timeoutId: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const generateMirror = async () => {
      setIsGenerating(true);
      setError(null);
      setProgress(10);

      // Simulate progress while loading
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 800);

      // Set timeout for 40 seconds
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Request timed out. The AI is taking longer than expected.'));
        }, 40000);
      });

      try {
        const mirrorPromise = generatePowerMirror(skillReframe, goalStatement, demographics);
        const mirrorData = await Promise.race([mirrorPromise, timeoutPromise]) as any;
        
        if (!isCancelled) {
          console.log('Power Mirror Data Received:', mirrorData);
          setProgress(100);
          setMirror(mirrorData);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Power Mirror Generation Error:', err);
          setError(err.message || "Failed to generate your power mirror");
          toast.error(err.message || "Failed to generate your power mirror. Please try again.");
          
          // Still set fallback data so user can continue
          const errorResult = handleError(err, 'generateMirror');
          setMirror(errorResult.fallbackData);
        }
      } finally {
        if (!isCancelled) {
          setIsGenerating(false);
          clearInterval(progressInterval);
          clearTimeout(timeoutId);
        }
      }
    };

    generateMirror();

    return () => {
      isCancelled = true;
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
    };
  }, [skillReframe, goalStatement, demographics]);

  const handleRetry = () => {
    setMirror(null);
    setError(null);
    setIsGenerating(true);
    setProgress(0);
    window.location.reload();
  };

  const handleContinue = () => {
    if (mirror && !isSubmitting) {
      onComplete(mirror);
    }
  };

  if (isGenerating) {
    return (
      <OnboardingLayout 
        currentStep={stepNumber} 
        totalSteps={totalSteps}
        title="Getting Started"
      >
        <Card className="w-full max-w-2xl mx-auto bg-card border-border">
          <div className="p-6 lg:p-8 text-center space-y-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Step {stepNumber} of {totalSteps} • Power Mirror
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Analyzing Your Responses
              </h2>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                  {Math.round(progress)}%
                </div>
              </div>
              <div className="text-center space-y-2 max-w-md">
                <p className="text-lg font-medium text-foreground">
                  Creating your personalized feedback...
                </p>
                <p className="text-sm text-muted-foreground">
                  {progress < 30 && "Analyzing your skill statement..."}
                  {progress >= 30 && progress < 60 && "Reviewing your 90-day goal..."}
                  {progress >= 60 && progress < 90 && "Evaluating recruiter perspective..."}
                  {progress >= 90 && "Finalizing your power mirror..."}
                </p>
                <div className="w-full bg-muted rounded-full h-2 mt-4">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </OnboardingLayout>
    );
  }

  return (
    <PowerMirrorErrorBoundary>
      <OnboardingLayout 
        currentStep={stepNumber} 
        totalSteps={totalSteps}
        title="Getting Started"
      >
        <OnboardingCard
        image={lansaPowerMirrorImage}
        imageAlt="Professional transformation mirror"
        title="How Employers See You"
        subtitle="Based on what you wrote, here's how a hiring manager might interpret your answers."
        stepBadge={`Step ${stepNumber} of ${totalSteps} • Power Mirror`}
      >
        <div className="space-y-6">

          {!mirror && !isGenerating && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                No mirror data available. Please try refreshing the page.
              </p>
            </div>
          )}

          {mirror && (
            <div className="space-y-6">
              {/* Overall Score Display */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-6 rounded-lg space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                  <h3 className="text-lg font-bold text-foreground">Your Recruiter Score</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`text-2xl font-bold px-3 py-1 rounded ${
                      mirror.score >= 8 ? 'text-green-600 bg-green-100 dark:bg-green-900/30' :
                      mirror.score >= 6 ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' :
                      'text-red-600 bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {mirror.score}/10
                    </div>
                  </div>
                </div>
                
                {/* Score Breakdown */}
                {mirror.score_breakdown && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Clarity</div>
                      <div className="font-semibold">{mirror.score_breakdown.clarity ?? 0}/3</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Relevance</div>
                      <div className="font-semibold">{mirror.score_breakdown.relevance ?? 0}/3</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Realism</div>
                      <div className="font-semibold">{mirror.score_breakdown.realism ?? 0}/2</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Tone</div>
                      <div className="font-semibold">{mirror.score_breakdown.professional_impression ?? 0}/2</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recruiter Perspective */}
              <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                <h3 className="text-base font-semibold text-foreground mb-3">
                  🎯 How Recruiters See You:
                </h3>
                <p className="text-base md:text-lg text-foreground font-medium leading-relaxed">
                  {mirror.recruiter_perspective || mirror.mirror_message}
                </p>
              </div>

              {/* Contradictions Warning */}
              {mirror.contradictions && Array.isArray(mirror.contradictions) && mirror.contradictions.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-2">⚠️ Potential Inconsistencies:</h4>
                  <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
                    {mirror.contradictions.map((contradiction: string, index: number) => (
                      <li key={index}>• {contradiction}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Strengths */}
              {mirror.key_strengths && Array.isArray(mirror.key_strengths) && mirror.key_strengths.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">
                    Your Key Strengths:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mirror.key_strengths.map((strength: string, index: number) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Employer Perspective */}
              {mirror.employer_perspective && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">
                    What Employers See:
                  </h3>
                  <div className="bg-muted/10 p-4 rounded-lg">
                    <p className="text-sm text-foreground italic">
                      "{mirror.employer_perspective}"
                    </p>
                  </div>
                </div>
              )}

              {/* Coaching Nudge */}
              {mirror.coaching_nudge && (
                <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-foreground mb-2">💡 Coaching Nudge:</h4>
                  <p className="text-sm text-muted-foreground">
                    {mirror.coaching_nudge}
                  </p>
                </div>
              )}

              {/* Next Level Hint */}
              {mirror.next_level_hint && (
                <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-foreground mb-2">🚀 Pro Tip:</h4>
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
              className="w-full py-3 lg:py-4 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
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
        </OnboardingCard>
      </OnboardingLayout>
    </PowerMirrorErrorBoundary>
  );
}