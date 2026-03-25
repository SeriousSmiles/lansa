import { Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AIActivationPromptProps {
  onUseGeneral: () => void;
}

export function AIActivationPrompt({ onUseGeneral }: AIActivationPromptProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Get personalised AI suggestions</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Complete your 5-min Career Goal Plan so your AI coach knows your background, skills, and goals — making every suggestion uniquely relevant to you.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap pl-11">
        <Button
          size="sm"
          className="gap-1.5 text-xs h-8"
          onClick={() => navigate('/dashboard', { state: { openAIPlan: true } })}
        >
          <Brain className="w-3 h-3" />
          Activate AI Coach
          <ArrowRight className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-8 text-muted-foreground hover:text-foreground"
          onClick={onUseGeneral}
        >
          Use general AI instead
        </Button>
      </div>
    </div>
  );
}
