
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getMagicMoment } from "@/utils/magicMomentUtils";

interface MagicMomentCardProps {
  identity?: string;
  desiredOutcome?: string;
  onComplete: () => void;
  stepNumber: number;
  totalSteps: number;
}

export function MagicMomentCard({
  identity,
  desiredOutcome,
  onComplete,
  stepNumber,
  totalSteps
}: MagicMomentCardProps) {
  const magicMoment = getMagicMoment(identity, desiredOutcome);

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index}
              className={`w-3 h-3 rounded-full ${
                index < stepNumber - 1
                  ? "bg-[#FF6B4A]" 
                  : index === stepNumber - 1
                    ? "border-2 border-[#FF6B4A]" 
                    : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Magic Moment Card */}
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2E2E2E] mb-4">
          Your Personalized Insight
        </h1>
        <p className="text-[#5A5A5A] text-lg max-w-2xl">
          Based on your profile, we've created this personalized reflection for you.
        </p>
      </div>
      
      <Card className="bg-white rounded-2xl overflow-hidden shadow-lg border-0 max-w-3xl mx-auto">
        <div className="h-3 bg-gradient-to-r from-[#FF6B4A] to-[#FF8F6B]"></div>
        
        <CardContent className="p-8">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2E2E2E]">
              {magicMoment.title}
            </h2>
            
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-lg font-semibold text-[#FF6B4A] mb-1">Reflection</h3>
                <p className="text-[#2E2E2E]">{magicMoment.reflection}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-[#FF6B4A] mb-1">Key Insight</h3>
                <p className="text-[#2E2E2E] font-medium italic">"{magicMoment.insight}"</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-8 pt-0 flex justify-center">
          <Button 
            onClick={onComplete} 
            className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90 text-white text-lg py-6 px-8 h-auto rounded-lg"
          >
            {magicMoment.cta}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
