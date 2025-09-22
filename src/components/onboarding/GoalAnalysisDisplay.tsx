import { Badge } from "@/components/ui/badge";

interface GoalAnalysisDisplayProps {
  analysis: {
    recruiter_perspective: string;
    score: number;
    score_breakdown: {
      clarity: number;
      relevance: number;
      realism: number;
      professional_impression: number;
    };
    coaching_nudge: string;
    interpretation: string;
    initiative_type: string;
    clarity_level: string;
  };
}

export function GoalAnalysisDisplay({ analysis }: GoalAnalysisDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score Display */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-6 rounded-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <h3 className="text-lg font-bold text-foreground">Your Recruiter Score</h3>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold px-3 py-1 rounded ${
              analysis.score >= 8 ? 'text-green-600 bg-green-100 dark:bg-green-900/30' :
              analysis.score >= 6 ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' :
              'text-red-600 bg-red-100 dark:bg-red-900/30'
            }`}>
              {analysis.score}/10
            </div>
          </div>
        </div>
        
        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Clarity</div>
            <div className="font-semibold">{analysis.score_breakdown.clarity}/3</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Relevance</div>
            <div className="font-semibold">{analysis.score_breakdown.relevance}/3</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Realism</div>
            <div className="font-semibold">{analysis.score_breakdown.realism}/2</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Professional</div>
            <div className="font-semibold">{analysis.score_breakdown.professional_impression}/2</div>
          </div>
        </div>
      </div>

      {/* Recruiter Perspective */}
      <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
        <h3 className="text-base font-semibold text-foreground mb-3">
          🎯 How Recruiters See You:
        </h3>
        <p className="text-base md:text-lg text-foreground font-medium leading-relaxed">
          {analysis.recruiter_perspective}
        </p>
      </div>

      {/* Goal Analysis */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">
          Goal Analysis:
        </h3>
        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
          <p className="text-sm text-foreground">
            {analysis.interpretation}
          </p>
          <div className="flex gap-2">
            <Badge variant="outline">
              {analysis.initiative_type}
            </Badge>
            <Badge variant="secondary">
              {analysis.clarity_level}
            </Badge>
          </div>
        </div>
      </div>

      {/* Coaching Nudge */}
      <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">💡 Coaching Nudge:</h4>
        <p className="text-sm text-muted-foreground">
          {analysis.coaching_nudge}
        </p>
      </div>
    </div>
  );
}