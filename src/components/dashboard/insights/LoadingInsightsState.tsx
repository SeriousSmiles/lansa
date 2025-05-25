
import { Brain } from "lucide-react";

export function LoadingInsightsState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Brain className="h-8 w-8 mx-auto mb-4 text-[#FF6B4A] animate-pulse" />
        <p className="text-gray-600">Loading your personalized insights...</p>
      </div>
    </div>
  );
}
