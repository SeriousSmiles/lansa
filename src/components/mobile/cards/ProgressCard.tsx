import React from 'react';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface ProgressCardProps {
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  nextStep?: {
    label: string;
    action: () => void;
  };
  completedSteps?: string[];
  variant?: 'default' | 'success';
}

export function ProgressCard({ 
  title, 
  description, 
  progress, 
  maxProgress, 
  nextStep,
  completedSteps = [],
  variant = 'default'
}: ProgressCardProps) {
  const progressPercentage = (progress / maxProgress) * 100;
  const isComplete = progress >= maxProgress;

  return (
    <BaseCard 
      variant={isComplete ? "highlighted" : "default"}
      className="relative"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-urbanist font-semibold text-base text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        {isComplete && (
          <CheckCircle className="h-6 w-6 text-success flex-shrink-0 ml-2" />
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {progress} of {maxProgress} completed
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2"
        />
      </div>

      {/* Completed Steps Preview */}
      {completedSteps.length > 0 && (
        <div className="mb-4">
          <div className="space-y-2">
            {completedSteps.slice(0, 3).map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{step}</span>
              </div>
            ))}
            {completedSteps.length > 3 && (
              <div className="text-xs text-muted-foreground ml-6">
                +{completedSteps.length - 3} more completed
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Step CTA */}
      {nextStep && !isComplete && (
        <Button 
          onClick={nextStep.action}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="sm"
        >
          <span>{nextStep.label}</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}

      {/* Success State */}
      {isComplete && (
        <div className="text-center">
          <span className="text-sm font-medium text-success">
            🎉 Great job! Profile completed
          </span>
        </div>
      )}
    </BaseCard>
  );
}