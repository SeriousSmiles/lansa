import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Eye, 
  Brain, 
  CheckCircle, 
  Sparkles,
  Target,
  Zap,
  X,
  Clock,
  Cpu,
  Search
} from 'lucide-react';

interface CVProcessingStagesProps {
  fileName: string;
  stage: 'processing' | 'analyzing';
  startTime?: number | null;
  onCancel?: () => void;
}

const processingSteps = [
  {
    id: 'upload',
    icon: FileText,
    title: 'File Upload',
    description: 'Securely uploading your CV...',
    duration: 1500,
    stage: 'processing'
  },
  {
    id: 'extraction',
    icon: Eye,
    title: 'Text Extraction',
    description: 'Reading and extracting text content...',
    duration: 3000,
    stage: 'processing'
  },
  {
    id: 'parsing',
    icon: Search,
    title: 'Content Parsing',
    description: 'Identifying sections and structures...',
    duration: 2500,
    stage: 'analyzing'
  },
  {
    id: 'ai-analysis',
    icon: Brain,
    title: 'AI Analysis',
    description: 'Understanding skills, experience, and education...',
    duration: 4000,
    stage: 'analyzing'
  },
  {
    id: 'insights',
    icon: Target,
    title: 'Generating Insights',
    description: 'Creating personalized recommendations...',
    duration: 2000,
    stage: 'analyzing'
  },
  {
    id: 'completion',
    icon: Zap,
    title: 'Finalizing',
    description: 'Preparing your results...',
    duration: 1000,
    stage: 'analyzing'
  }
];

export function CVProcessingStages({ 
  fileName, 
  stage, 
  startTime,
  onCancel 
}: CVProcessingStagesProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Filter steps based on current stage
  const relevantSteps = processingSteps.filter(step => {
    if (stage === 'processing') {
      return step.stage === 'processing';
    }
    return true; // Show all steps for analyzing stage
  });

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;
    let timeInterval: NodeJS.Timeout;

    // Update elapsed time
    if (startTime) {
      timeInterval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }

    const runStep = (stepIndex: number) => {
      if (stepIndex >= relevantSteps.length) {
        setProgress(100);
        setIsComplete(true);
        return;
      }

      setCurrentStep(stepIndex);
      const step = relevantSteps[stepIndex];
      const startProgress = (stepIndex / relevantSteps.length) * 100;
      const endProgress = ((stepIndex + 1) / relevantSteps.length) * 100;
      
      let currentProgress = startProgress;
      setProgress(currentProgress);

      // Smooth progress animation
      progressInterval = setInterval(() => {
        currentProgress += (endProgress - startProgress) / (step.duration / 50);
        if (currentProgress >= endProgress) {
          currentProgress = endProgress;
          clearInterval(progressInterval);
        }
        setProgress(Math.min(currentProgress, 100));
      }, 50);

      stepTimeout = setTimeout(() => {
        clearInterval(progressInterval);
        runStep(stepIndex + 1);
      }, step.duration);
    };

    runStep(0);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
      clearInterval(timeInterval);
    };
  }, [stage, relevantSteps, startTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  const getCurrentStepInfo = () => {
    return relevantSteps[currentStep] || relevantSteps[relevantSteps.length - 1];
  };

  const currentStepInfo = getCurrentStepInfo();
  const CurrentIcon = isComplete ? CheckCircle : currentStepInfo?.icon || Sparkles;

  return (
    <div className="space-y-6 py-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
          <CurrentIcon className={`w-10 h-10 text-white ${!isComplete ? 'animate-pulse' : ''}`} />
        </div>
        <div>
          <h3 className="text-2xl font-semibold">
            {isComplete ? "Processing Complete!" : "Processing Your CV"}
          </h3>
          <p className="text-muted-foreground">
            <span className="font-medium">{fileName}</span>
            {startTime && (
              <span className="ml-2 text-sm">
                • {formatTime(elapsedTime)} elapsed
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{Math.round(progress)}% complete</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {isComplete ? 'Done!' : 'Processing...'}
          </span>
        </div>
      </div>

      {/* Current Step Detail */}
      {!isComplete && currentStepInfo && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CurrentIcon className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-primary">
                  {currentStepInfo.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {currentStepInfo.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Steps Timeline */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Processing Steps</h4>
        <div className="space-y-1">
          {relevantSteps.map((step, index) => {
            const isActive = index === currentStep && !isComplete;
            const isCompleted = index < currentStep || isComplete;
            const isPending = index > currentStep && !isComplete;
            
            return (
              <div 
                key={step.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  isActive ? 'bg-primary/10 border border-primary/20' :
                  isCompleted ? 'bg-green-50 border border-green-200' :
                  'bg-muted/30'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-primary text-white' :
                  isCompleted ? 'bg-green-500 text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : isActive ? (
                    <step.icon className="w-3 h-3 animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-primary' :
                    isCompleted ? 'text-green-700' :
                    'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  {isActive && (
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Messages */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Cpu className="w-4 h-4" />
          <span>
            {isComplete 
              ? "Analysis complete - preparing your results!"
              : currentStep < 2 
                ? "Reading your CV content..."
                : "AI is analyzing your experience and skills..."
            }
          </span>
        </div>
        
        {!isComplete && (
          <p className="text-xs text-muted-foreground">
            This usually takes 30-60 seconds depending on CV complexity
          </p>
        )}
      </div>

      {/* Cancel Option */}
      {onCancel && !isComplete && (
        <div className="flex justify-center pt-4 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Upload
          </Button>
        </div>
      )}
    </div>
  );
}