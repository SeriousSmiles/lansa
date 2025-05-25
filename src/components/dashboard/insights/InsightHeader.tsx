
import { Button } from "@/components/ui/button";
import { Brain, Clock, TrendingUp } from "lucide-react";

interface InsightHeaderProps {
  onRefresh: () => void;
  isGenerating: boolean;
}

export function InsightHeader({ onRefresh, isGenerating }: InsightHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Brain className="h-7 w-7 text-[#FF6B4A]" />
          AI Coach
        </h2>
        <p className="text-gray-600 mt-1">
          Personalized insights to help you make the most of Lansa
        </p>
      </div>
      
      <Button 
        onClick={onRefresh}
        disabled={isGenerating}
        className="bg-[#FF6B4A] hover:bg-[#E55A3A]"
      >
        {isGenerating ? (
          <>
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            Refreshing...
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh Insights
          </>
        )}
      </Button>
    </div>
  );
}
