
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Target, TrendingUp } from "lucide-react";
import { GrowthPrompt } from "@/hooks/useGrowthCards";

interface GrowthCardProps {
  prompt: GrowthPrompt;
  onComplete: (promptId: string) => void;
  stageDisplayName: string;
  isCompleting?: boolean;
}

export function GrowthCard({ prompt, onComplete, stageDisplayName, isCompleting = false }: GrowthCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {stageDisplayName}
          </Badge>
        </div>
        <TrendingUp className="h-5 w-5 text-purple-500" />
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-gray-900">
        {prompt.title}
      </h3>
      
      <p className="text-gray-600 mb-6 leading-relaxed">
        {prompt.description}
      </p>
      
      <Button 
        onClick={() => onComplete(prompt.id)}
        disabled={isCompleting}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        {isCompleting ? "Completing..." : prompt.action_label}
      </Button>
    </Card>
  );
}
