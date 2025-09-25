import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Eye, 
  Brain, 
  CheckCircle, 
  Sparkles,
  Target,
  Zap
} from "lucide-react";

interface CVLoadingProgressProps {
  fileName: string;
  onComplete?: () => void;
}

const loadingSteps = [
  {
    icon: FileText,
    title: "Reading your CV",
    description: "Extracting text and understanding layout...",
    duration: 2000
  },
  {
    icon: Eye,
    title: "Analyzing content",
    description: "Identifying skills, experience, and education...",
    duration: 3000
  },
  {
    icon: Brain,
    title: "AI insights generation",
    description: "Comparing with your goals and industry standards...",
    duration: 2500
  },
  {
    icon: Target,
    title: "Finding opportunities",
    description: "Spotting gaps and improvement areas...",
    duration: 2000
  },
  {
    icon: Zap,
    title: "Creating recommendations",
    description: "Crafting personalized suggestions just for you...",
    duration: 1500
  }
];

export function CVLoadingProgress({ fileName, onComplete }: CVLoadingProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;

    const runStep = (stepIndex: number) => {
      if (stepIndex >= loadingSteps.length) {
        setProgress(100);
        setIsComplete(true);
        if (onComplete) {
          setTimeout(onComplete, 1000);
        }
        return;
      }

      setCurrentStep(stepIndex);
      const step = loadingSteps[stepIndex];
      const startProgress = (stepIndex / loadingSteps.length) * 100;
      const endProgress = ((stepIndex + 1) / loadingSteps.length) * 100;
      
      let currentProgress = startProgress;
      setProgress(currentProgress);

      progressInterval = setInterval(() => {
        currentProgress += (endProgress - startProgress) / (step.duration / 100);
        if (currentProgress >= endProgress) {
          currentProgress = endProgress;
          clearInterval(progressInterval);
        }
        setProgress(Math.min(currentProgress, 100));
      }, 100);

      stepTimeout = setTimeout(() => {
        clearInterval(progressInterval);
        runStep(stepIndex + 1);
      }, step.duration);
    };

    runStep(0);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [onComplete]);

  const CurrentIcon = isComplete ? CheckCircle : loadingSteps[currentStep]?.icon || Sparkles;

  return (
    <div className="space-y-6 py-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
          <CurrentIcon className={`w-8 h-8 text-white ${!isComplete ? 'animate-pulse' : ''}`} />
        </div>
        <h3 className="text-xl font-semibold">
          {isComplete ? "Analysis Complete!" : "Analyzing Your CV"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Processing <span className="font-medium">{fileName}</span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(progress)}% complete</span>
          <span>Less than a minute remaining</span>
        </div>
      </div>

      {/* Current Step */}
      {!isComplete && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <CurrentIcon className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">
                {loadingSteps[currentStep]?.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {loadingSteps[currentStep]?.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completion State */}
      {isComplete && (
        <div className="bg-green-50 rounded-lg p-4 space-y-3 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm text-green-900">
                Your profile is ready!
              </h4>
              <p className="text-xs text-green-700">
                We've analyzed your CV and found great content to build your profile
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Encouraging Messages */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          <span>
            {isComplete 
              ? "Analysis complete - let's build something amazing!"
              : currentStep < 2 
                ? "Hang tight, this takes less than a minute..."
                : "Almost done - creating personalized insights..."
            }
          </span>
          <Sparkles className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}