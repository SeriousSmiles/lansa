import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressBar({ currentStep, totalSteps, className }: ProgressBarProps) {
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
                  !isCompleted && !isCurrent && "bg-muted"
                )}
              />
              {i < totalSteps - 1 && (
                <div 
                  className={cn(
                    "h-0.5 w-8 mx-1 transition-colors duration-300",
                    isCompleted ? "bg-primary" : "bg-muted"
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