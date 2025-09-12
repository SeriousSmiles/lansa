import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { FileText, Search, Sparkles, CheckCircle } from "lucide-react";

interface CVParsingProgressProps {
  fileName: string;
}

const progressSteps = [
  { text: "Scanning your story...", icon: FileText, duration: 1000 },
  { text: "Spotting highlights recruiters love...", icon: Search, duration: 1000 },
  { text: "Building your profile foundation...", icon: Sparkles, duration: 1000 },
  { text: "Almost ready!", icon: CheckCircle, duration: 500 }
];

export function CVParsingProgress({ fileName }: CVParsingProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = progressSteps.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 100;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      // Update current step based on elapsed time
      let cumulativeDuration = 0;
      for (let i = 0; i < progressSteps.length; i++) {
        cumulativeDuration += progressSteps[i].duration;
        if (elapsed <= cumulativeDuration) {
          setCurrentStep(i);
          break;
        }
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = progressSteps[currentStep]?.icon || FileText;

  return (
    <div className="space-y-6">
      {/* File Info */}
      <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/50">
        <FileText className="h-6 w-6 text-primary" />
        <div>
          <p className="font-medium text-foreground">{fileName}</p>
          <p className="text-sm text-muted-foreground">Processing...</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground text-center">
          {Math.round(progress)}% complete
        </p>
      </div>

      {/* Current Step */}
      <div className="flex items-center justify-center gap-3 py-6">
        <div className="rounded-full bg-primary/10 p-3">
          <CurrentIcon className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <p className="text-lg font-medium text-foreground animate-fade-in">
          {progressSteps[currentStep]?.text || "Processing..."}
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {progressSteps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div 
              key={index}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                isCompleted ? 'bg-primary/5' : isCurrent ? 'bg-primary/10' : 'opacity-50'
              }`}
            >
              <div className={`rounded-full p-2 ${
                isCompleted ? 'bg-primary text-white' : 
                isCurrent ? 'bg-primary/20 text-primary' : 
                'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-sm ${
                isCompleted || isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
                {step.text}
              </span>
              {isCompleted && (
                <CheckCircle className="h-4 w-4 text-primary ml-auto" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}