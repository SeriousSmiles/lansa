
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight } from "lucide-react";
import { AIInsight } from "@/services/aiInsights";

interface InsightCardProps {
  insight: AIInsight;
  onAction: (insight: AIInsight) => void;
  onMarkComplete: (insight: AIInsight, event: React.MouseEvent) => void;
}

export function InsightCard({ insight, onAction, onMarkComplete }: InsightCardProps) {
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-green-100 text-green-800 border-green-200";
      case 2: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 3: return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return "Quick Win";
      case 2: return "Worth Doing";
      case 3: return "Important";
      default: return "Suggestion";
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-[#FF6B4A] group"
      onClick={() => onAction(insight)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {insight.title}
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6B4A]" />
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={getPriorityColor(insight.priority)}
            >
              {getPriorityLabel(insight.priority)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onMarkComplete(insight, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 leading-relaxed mb-3">{insight.message}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Click to go to {insight.navigation_target?.replace('/', '') || 'action'}</span>
          <span>or mark as complete →</span>
        </div>
      </CardContent>
    </Card>
  );
}
