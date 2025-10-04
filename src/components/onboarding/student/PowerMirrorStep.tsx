import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading";
import { generatePowerMirror, StudentDemographics } from "@/services/question/studentOnboardingService";
import { OnboardingLayout } from "../layout/OnboardingLayout";
import { OnboardingCard } from "../layout/OnboardingCard";
import { PowerMirrorErrorBoundary, usePowerMirrorErrorHandler } from "../PowerMirrorErrorBoundary";
import { CollapsibleAnalysisCard } from "../CollapsibleAnalysisCard";
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
          // Accept both { mirror: {...} } and direct {...}
          const normalized = (mirrorData && typeof mirrorData === 'object' && 'mirror' in mirrorData)
            ? (mirrorData as any).mirror
            : mirrorData;
          setMirror(normalized);
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
            <div className="space-y-4">
              {/* Overall Score - Hero Section */}
              <div className="text-center space-y-4 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                <div className="space-y-2">
                  <div className="text-6xl font-bold text-primary">
                    {mirror.score}/10
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    Overall Impression Score
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {mirror.score >= 8 ? "Strong impression - you're presenting yourself well!" :
                     mirror.score >= 6 ? "Good foundation - room to strengthen your message" :
                     "Let's refine your story together"}
                  </p>
                </div>

                {/* Score Breakdown */}
                {mirror.score_breakdown && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-primary">
                        {mirror.score_breakdown.clarity ?? 0}/3
                      </div>
                      <p className="text-xs text-muted-foreground">Clarity</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-primary">
                        {mirror.score_breakdown.relevance ?? 0}/3
                      </div>
                      <p className="text-xs text-muted-foreground">Relevance</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-primary">
                        {mirror.score_breakdown.realism ?? 0}/2
                      </div>
                      <p className="text-xs text-muted-foreground">Realism</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-primary">
                        {mirror.score_breakdown.professional_impression ?? 0}/2
                      </div>
                      <p className="text-xs text-muted-foreground">Professional Tone</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recruiter Perspective - Always Open */}
              {(mirror.recruiter_perspective || mirror.mirror_message) && (
                <CollapsibleAnalysisCard
                  title="How Recruiters See You"
                  icon="👁️"
                  isDefaultOpen={true}
                >
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mirror.recruiter_perspective || mirror.mirror_message}
                  </p>
                </CollapsibleAnalysisCard>
              )}

              {/* Key Strengths */}
              {mirror.key_strengths && Array.isArray(mirror.key_strengths) && mirror.key_strengths.length > 0 && (
                <CollapsibleAnalysisCard
                  title="What Makes You Stand Out"
                  icon="💎"
                  isDefaultOpen={false}
                >
                  <ul className="space-y-2">
                    {mirror.key_strengths.map((strength: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="text-muted-foreground flex-1">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleAnalysisCard>
              )}

              {/* Contradictions/Areas to Watch */}
              {mirror.contradictions && Array.isArray(mirror.contradictions) && mirror.contradictions.length > 0 && (
                <CollapsibleAnalysisCard
                  title="Areas to Watch"
                  icon="⚠️"
                  isDefaultOpen={false}
                >
                  <ul className="space-y-2">
                    {mirror.contradictions.map((contradiction: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-yellow-600 dark:text-yellow-500 mt-0.5">•</span>
                        <span className="text-muted-foreground flex-1">{contradiction}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleAnalysisCard>
              )}

              {/* Employer Perspective */}
              {mirror.employer_perspective && (
                <CollapsibleAnalysisCard
                  title="Employer's First Impression"
                  icon="👔"
                  isDefaultOpen={false}
                >
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mirror.employer_perspective}
                  </p>
                </CollapsibleAnalysisCard>
              )}

              {/* Coaching Section */}
              {(mirror.coaching_nudge || mirror.next_level_hint) && (
                <CollapsibleAnalysisCard
                  title="Your Coach's Advice"
                  icon="💡"
                  isDefaultOpen={false}
                >
                  <div className="space-y-3">
                    {mirror.coaching_nudge && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {mirror.coaching_nudge}
                      </p>
                    )}
                    {mirror.next_level_hint && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-sm font-medium text-primary mb-2">🚀 Next Level:</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {mirror.next_level_hint}
                        </p>
                      </div>
                    )}
                  </div>
                </CollapsibleAnalysisCard>
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