
import { Progress } from "@/components/ui/progress";

interface LoadingProgressProps {
  progress: number;
}

export const LoadingProgress = ({ progress }: LoadingProgressProps) => {
  return (
    <div className="w-full space-y-2">
      <Progress 
        value={progress} 
        className="h-2 bg-lansa-muted/30"
        indicatorClassName="bg-primary"
      />
      <p className="text-sm text-lansa-muted-foreground text-right">{Math.round(progress)}%</p>
    </div>
  );
};
