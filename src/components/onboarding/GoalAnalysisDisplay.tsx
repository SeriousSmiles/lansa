import { Badge } from "@/components/ui/badge";
import { CollapsibleAnalysisCard } from "./CollapsibleAnalysisCard";

interface GoalAnalysisDisplayProps {
  analysis: {
    recruiter_perspective: string;
    score: number;
    score_breakdown: {
      clarity: number;
      relevance: number;
      realism: number;
      tone?: number;
      professional_impression?: number;
    };
    coaching_nudge: string;
    interpretation: string;
    initiative_type: string;
    clarity_level: string;
  };
}

export function GoalAnalysisDisplay({ analysis }: GoalAnalysisDisplayProps) {
  const getScoreLabel = (score: number) => {
    if (score >= 7) return "Strong Impression";
    if (score >= 5) return "Getting There";
    return "Needs Refinement";
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (score >= 5) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
  };

  const toneScore = analysis.score_breakdown.tone || analysis.score_breakdown.professional_impression || 1;
  const maxScore = 8; // Updated to match new scoring system

  return (
    <div className="space-y-4">
      {/* Overall Score Display with Encouragement */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-6 rounded-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <h3 className="text-lg font-bold text-foreground">Your Recruiter Score</h3>
            <p className="text-sm text-muted-foreground">Excellent planning! Here's how recruiters see your 90-day goal:</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <div className={`text-2xl font-bold px-3 py-1 rounded ${getScoreColor(analysis.score)}`}>
              {analysis.score}/{maxScore}
            </div>
            <span className={`text-sm font-medium ${getScoreColor(analysis.score)}`}>
              {getScoreLabel(analysis.score)}
            </span>
          </div>
        </div>
        
        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-lansa-muted-foreground">Clarity</div>
            <div className="font-semibold">{analysis.score_breakdown.clarity}/3</div>
          </div>
          <div className="space-y-1">
            <div className="text-lansa-muted-foreground">Relevance</div>
            <div className="font-semibold">{analysis.score_breakdown.relevance}/3</div>
          </div>
          <div className="space-y-1">
            <div className="text-lansa-muted-foreground">Realism</div>
            <div className="font-semibold">{analysis.score_breakdown.realism}/1</div>
          </div>
          <div className="space-y-1">
            <div className="text-lansa-muted-foreground">Tone</div>
            <div className="font-semibold">{toneScore}/1</div>
          </div>
        </div>
      </div>

      {/* Collapsible Cards */}
      <div className="space-y-3">
        <CollapsibleAnalysisCard 
          title="What We Found in Your Goal" 
          icon="🎯"
          isDefaultOpen={true}
        >
          <div className="space-y-3">
            <p className="text-sm text-foreground">
              <strong>Great thinking!</strong> {analysis.recruiter_perspective}
            </p>
            <div className="bg-lansa-muted/10 p-4 rounded-lg space-y-2">
              <p className="text-sm text-foreground">
                {analysis.interpretation}
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-primary/5">
                  {analysis.initiative_type}
                </Badge>
                <Badge variant="secondary" className="bg-secondary/10">
                  {analysis.clarity_level}
                </Badge>
              </div>
            </div>
          </div>
        </CollapsibleAnalysisCard>

        <CollapsibleAnalysisCard 
          title="Actionable Improvements" 
          icon="📈"
          isDefaultOpen={false}
        >
          <div className="space-y-3">
            <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
              <h4 className="text-sm font-medium text-foreground mb-2">💡 Your Coach's Advice:</h4>
              <p className="text-sm text-foreground leading-relaxed">
                {analysis.coaching_nudge}
              </p>
            </div>
            <div className="text-xs text-lansa-muted-foreground">
              Remember: Having any 90-day plan puts you ahead of most candidates! Keep refining it.
            </div>
          </div>
        </CollapsibleAnalysisCard>
      </div>
    </div>
  );
}