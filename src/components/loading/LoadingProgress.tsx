
import { Progress } from "@/components/ui/progress";

interface LoadingProgressProps {
  progress: number;
}

export const LoadingProgress = ({ progress }: LoadingProgressProps) => {
  return (
    <div className="w-full space-y-2">
      <Progress 
        value={progress} 
        className="h-2 bg-gray-200"
        indicatorClassName="bg-[#FF6B4A]"
      />
      <p className="text-sm text-gray-500 text-right">{Math.round(progress)}%</p>
    </div>
  );
};
