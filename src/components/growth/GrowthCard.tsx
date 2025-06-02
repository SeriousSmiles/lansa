
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
    <Card className="p-6 bg-gradient-to-r from-orange-50 to-blue-50 border-l-4 border-l-[#FF6B4A]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-[#FF6B4A]" />
          <Badge variant="secondary" className="bg-[#FF6B4A]/10 text-[#FF6B4A] border-[#FF6B4A]/20">
            {stageDisplayName}
          </Badge>
        </div>
        <TrendingUp className="h-5 w-5 text-[#1A1F71]" />
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-[#1A1F71]">
        {prompt.title}
      </h3>
      
      <p className="text-gray-600 mb-6 leading-relaxed">
        {prompt.description}
      </p>
      
      <Button 
        onClick={() => onComplete(prompt.id)}
        disabled={isCompleting}
        className="w-full bg-gradient-to-r from-[#FF6B4A] to-[#1A1F71] hover:from-[#FF6B4A]/90 hover:to-[#1A1F71]/90 text-white border-0 shadow-lg"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        {isCompleting ? "Completing..." : prompt.action_label}
      </Button>
    </Card>
  );
}
