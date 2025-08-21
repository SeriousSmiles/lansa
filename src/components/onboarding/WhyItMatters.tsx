import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, MessageCircle } from "lucide-react";

interface WhyItMattersProps {
  explanation: string;
  suggestion?: string;
  clarifyingQuestion?: string;
}

export function WhyItMatters({ explanation, suggestion, clarifyingQuestion }: WhyItMattersProps) {
  return (
    <Card className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Manager Insight
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Why this matters
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {explanation}
              </p>
            </div>
          </div>
          
          {suggestion && (
            <div className="flex items-start gap-3">
              <MessageCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-1">
                  Quick improvement
                </h5>
                <p className="text-sm text-orange-800 dark:text-orange-200 bg-white/50 dark:bg-gray-800/50 p-2 rounded border-l-2 border-orange-300">
                  {suggestion}
                </p>
              </div>
            </div>
          )}
          
          {clarifyingQuestion && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-3 rounded-lg border border-primary/20">
              <h5 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                💡 Try asking yourself:
              </h5>
              <p className="text-sm text-muted-foreground italic font-medium">
                "{clarifyingQuestion}"
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}