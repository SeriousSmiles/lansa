import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

interface WhyItMattersProps {
  explanation: string;
  suggestion?: string;
  clarifyingQuestion?: string;
}

export function WhyItMatters({ explanation, suggestion, clarifyingQuestion }: WhyItMattersProps) {
  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Why this matters to managers
            </h4>
            <p className="text-sm text-blue-800">
              {explanation}
            </p>
          </div>
          
          {suggestion && (
            <div>
              <h5 className="text-sm font-medium text-blue-900 mb-1">
                Quick fix:
              </h5>
              <p className="text-sm text-blue-700">
                {suggestion}
              </p>
            </div>
          )}
          
          {clarifyingQuestion && (
            <div>
              <h5 className="text-sm font-medium text-blue-900 mb-1">
                Try this:
              </h5>
              <p className="text-sm text-blue-700 italic">
                "{clarifyingQuestion}"
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}