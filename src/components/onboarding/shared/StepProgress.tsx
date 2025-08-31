interface StepProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepProgress({ steps, currentStep, className = "" }: StepProgressProps) {
  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      {steps.map((_, index) => (
        <button
          key={index}
          className={`h-2 w-2 rounded-full transition-all duration-300 ${
            index === currentStep
              ? 'bg-primary scale-125'
              : index < currentStep
              ? 'bg-primary/60'
              : 'bg-muted'
          }`}
          onClick={() => {
            // Step navigation could be implemented here if needed
          }}
        />
      ))}
    </div>
  );
}