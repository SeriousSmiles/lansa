import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
  variant?: 'dots' | 'fill';
}

export function ProgressBar({ currentStep, totalSteps, className, variant = 'fill' }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;
  
  if (variant === 'fill') {
    return (
      <div className={cn("w-full bg-gray-200 dark:bg-gray-700 h-1", className)}>
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex justify-center mb-8", className)}>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepIndex = i + 1;
          const isCompleted = stepIndex < currentStep;
          const isCurrent = stepIndex === currentStep;
          
          return (
            <div key={i} className="flex items-center">
              <div
                className={cn(
                  "h-3 w-3 rounded-full transition-all duration-300",
                  isCompleted && "bg-primary scale-110",
                  isCurrent && "bg-primary scale-125 shadow-lg",
                  !isCompleted && !isCurrent && "bg-gray-100 dark:bg-gray-800/30"
                )}
              />
              {i < totalSteps - 1 && (
                <div 
                  className={cn(
                    "h-0.5 w-8 mx-1 transition-colors duration-300",
                    isCompleted ? "bg-primary" : "bg-gray-100 dark:bg-gray-800/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}