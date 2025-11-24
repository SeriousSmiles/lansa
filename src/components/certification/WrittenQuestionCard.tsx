import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";

interface WrittenQuestionCardProps {
  scenario: string;
  guidance: string;
  maxWords: number;
  timeLimit: number;
  onSubmit: (answer: string) => void;
  submitting: boolean;
}

export function WrittenQuestionCard({
  scenario,
  guidance,
  maxWords,
  timeLimit,
  onSubmit,
  submitting
}: WrittenQuestionCardProps) {
  const [answer, setAnswer] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onSubmit(answer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [answer]);

  useEffect(() => {
    const words = answer.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [answer]);

  const isOverLimit = wordCount > maxWords;

  return (
    <div className="space-y-4">
      {/* Guidance Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Guidance:</strong> {guidance}
        </p>
      </div>

      {/* Text Area */}
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your response here..."
        className="min-h-[150px] text-base"
        disabled={submitting || timeRemaining === 0}
      />

      {/* Timer & Word Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`h-4 w-4 ${timeRemaining <= 15 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
          <span className={`text-lg font-mono font-bold ${timeRemaining <= 15 ? 'text-red-500 animate-pulse' : ''}`}>
            {timeRemaining}s
          </span>
        </div>
        <span className={`text-sm ${isOverLimit ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
          {wordCount}/{maxWords} words
        </span>
      </div>
    </div>
  );
}
