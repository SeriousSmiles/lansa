import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Lightbulb, AlertCircle } from 'lucide-react';
import { SmartSuggestionChip } from './SmartSuggestionChip';

interface AITypingFeedbackProps {
  isAnalyzing: boolean;
  analysis: {
    suggested_rewrite?: string;
    reasoning?: string;
    score?: {
      clarity?: number;
      confidence?: number;
      specificity?: number;
      professional_impression?: number;
    };
  } | null;
  onApplySuggestion?: (text: string) => void;
  inputLength: number;
}

export function AITypingFeedback({ 
  isAnalyzing, 
  analysis, 
  onApplySuggestion,
  inputLength 
}: AITypingFeedbackProps) {
  // Don't show anything if input is too short
  if (inputLength < 10) return null;

  // Show loading state
  if (isAnalyzing) {
    return (
      <Card className="border-primary/20 bg-primary/5 animate-pulse">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>AI is analyzing your input...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show analysis results
  if (analysis) {
    const avgScore = analysis.score 
      ? Math.round(
          (analysis.score.clarity! + 
           analysis.score.confidence! + 
           analysis.score.specificity! + 
           analysis.score.professional_impression!) / 4
        )
      : 0;

    const isGoodScore = avgScore >= 70;

    return (
      <Card className={`border-l-4 ${isGoodScore ? 'border-l-green-500 bg-green-50/50' : 'border-l-amber-500 bg-amber-50/50'}`}>
        <CardContent className="pt-4 pb-3 space-y-3">
          <div className="flex items-start gap-2">
            {isGoodScore ? (
              <Lightbulb className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 space-y-2">
              <div className="text-sm font-medium text-foreground">
                {isGoodScore ? 'Great input!' : 'AI Suggestion'}
              </div>
              {!isGoodScore && analysis.reasoning && (
                <p className="text-xs text-muted-foreground">
                  {analysis.reasoning}
                </p>
              )}
            </div>
            <div className={`text-xs font-semibold px-2 py-1 rounded ${
              isGoodScore ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {avgScore}%
            </div>
          </div>

          {!isGoodScore && analysis.suggested_rewrite && onApplySuggestion && (
            <div className="flex flex-wrap gap-2">
              <SmartSuggestionChip
                suggestion="Apply AI improvement"
                onClick={() => onApplySuggestion(analysis.suggested_rewrite!)}
                variant="default"
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
