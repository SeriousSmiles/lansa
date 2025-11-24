import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ReviewDrawerProps {
  answers: Array<{
    cert_questions: {
      scenario: string;
      category: string;
      choices: any[];
      question_type: string;
    };
    selected_option_id: string | null;
    written_answer_text: string | null;
    points_awarded: number;
    reflection: string;
  }>;
  onClose: () => void;
}

export function ReviewDrawer({ answers, onClose }: ReviewDrawerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (answers.length === 0) return null;
  
  const current = answers[currentIndex];

  const getPointColor = (points: number) => {
    if (points >= 8) return 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-900';
    if (points >= 5) return 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-900';
    return 'bg-rose-100 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-900';
  };

  return (
    <div className="fixed inset-0 bg-background/95 z-50 overflow-y-auto">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Question {currentIndex + 1} of {answers.length}
            </h2>
            <Button onClick={onClose} variant="ghost" size="sm">
              Close ✕
            </Button>
          </div>

          <Card className="p-8">
            {/* Category Badge */}
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
              {current.cert_questions.category.replace(/_/g, ' ').toUpperCase()}
            </span>

            {/* Scenario */}
            <h3 className="text-xl font-bold mb-6">{current.cert_questions.scenario}</h3>

            {/* Your Answer */}
            <div className="bg-primary/5 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-primary mb-2">Your Answer:</p>
              {current.written_answer_text ? (
                <p className="text-base">{current.written_answer_text}</p>
              ) : (
                <p className="text-base">
                  {current.cert_questions.choices?.find((c: any) => c.id === current.selected_option_id)?.text || 'Not available'}
                </p>
              )}
            </div>

            {/* Points & Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-primary">
                {current.points_awarded}/10 points
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getPointColor(current.points_awarded)}`}>
                {current.points_awarded >= 8 ? 'Excellent ✅' : 
                 current.points_awarded >= 5 ? 'Good 👍' : 'Needs Work 🎯'}
              </span>
            </div>

            {/* Reflection */}
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">🪞 Reflection:</p>
              <p className="leading-relaxed">{current.reflection}</p>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                variant="outline"
                className="flex-1"
              >
                ← Previous
              </Button>
              <Button
                onClick={() => setCurrentIndex(prev => Math.min(answers.length - 1, prev + 1))}
                disabled={currentIndex === answers.length - 1}
                variant="outline"
                className="flex-1"
              >
                Next →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
