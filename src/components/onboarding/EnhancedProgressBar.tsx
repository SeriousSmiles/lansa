import React from 'react';
import { Check } from 'lucide-react';

interface ProgressStep {
  label: string;
  completed: boolean;
  current: boolean;
}

interface EnhancedProgressBarProps {
  steps: ProgressStep[];
  currentStepNumber: number;
  totalSteps: number;
}

export function EnhancedProgressBar({ 
  steps, 
  currentStepNumber, 
  totalSteps 
}: EnhancedProgressBarProps) {
  const progressPercentage = (currentStepNumber / totalSteps) * 100;

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b pb-4 pt-2">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Progress bar with fill */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-3">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center gap-1 flex-1"
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                transition-all duration-300
                ${step.completed 
                  ? 'bg-primary text-primary-foreground' 
                  : step.current 
                    ? 'bg-primary/20 text-primary ring-2 ring-primary' 
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {step.completed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`
                text-[10px] font-medium text-center hidden sm:block
                ${step.current ? 'text-primary' : 'text-muted-foreground'}
              `}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Mobile step counter */}
        <div className="sm:hidden text-center mt-2">
          <span className="text-xs font-medium text-primary">
            Step {currentStepNumber} of {totalSteps}
          </span>
        </div>
      </div>
    </div>
  );
}
