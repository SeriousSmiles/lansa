import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  category: 'mindset' | 'workplace_intelligence' | 'performance_habits' | 'applied_thinking';
  score: number;
  summary: string;
  nextStep: string;
}

export function CategoryCard({ category, score, summary, nextStep }: CategoryCardProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900';
    if (score >= 70) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900';
  };

  const labels: Record<string, string> = {
    mindset: 'Mindset (Accountability)',
    workplace_intelligence: 'Workplace Intelligence',
    performance_habits: 'Performance Habits',
    applied_thinking: 'Applied Thinking',
  };

  return (
    <Card className={`p-6 border-2 ${getColor(score)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{labels[category]}</h3>
        <span className="text-3xl font-bold">{score}%</span>
      </div>
      
      <p className="text-sm leading-relaxed mb-4">{summary}</p>
      
      <div className="bg-background/50 rounded-lg p-3">
        <p className="text-xs font-medium mb-1">💡 Next Step:</p>
        <p className="text-sm font-medium">{nextStep}</p>
      </div>
    </Card>
  );
}
