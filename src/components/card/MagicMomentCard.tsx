
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface MagicMomentCardProps {
  title: string;
  reflection: string;
  insight: string;
  isLoadingInsight?: boolean;
  onGetStarted: () => void;
  onGoToDashboard: () => void;
  isTransitioning: boolean;
}

export const MagicMomentCard: React.FC<MagicMomentCardProps> = ({
  title,
  reflection,
  insight,
  isLoadingInsight = false,
  onGetStarted,
  onGoToDashboard,
  isTransitioning,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Typing animation effect
  useEffect(() => {
    if (!insight || isLoadingInsight) return;
    
    setIsTyping(true);
    let index = 0;
    const fullText = insight;
    setDisplayedText("");
    
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 20); // Adjust speed as needed
    
    return () => clearInterval(typingInterval);
  }, [insight, isLoadingInsight]);

  return (
    <Card className="bg-white rounded-2xl overflow-hidden shadow-lg border-0 w-full">
      <div className="h-3 bg-gradient-to-r from-[#FF6B4A] to-[#FF8F6B]"></div>
      
      <CardContent className="p-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2E2E2E] mb-4">
              {title}
            </h2>
            <p className="text-lg text-[#2E2E2E]">{reflection}</p>
          </div>
          
          <div className="bg-[#F9F5FF] p-6 rounded-lg border-l-4 border-[#FF6B4A]">
            {isLoadingInsight ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <p className="text-xl text-[#2E2E2E] font-medium italic relative">
                "{displayedText}"
                {isTyping && (
                  <span className="inline-block w-0.5 h-5 bg-[#2E2E2E] ml-0.5 animate-ping"></span>
                )}
              </p>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#2E2E2E]">
              Next steps to increase your professional clarity:
            </h3>
            
            <ul className="list-disc list-inside space-y-2 text-[#2E2E2E]">
              <li>Complete your profile to highlight your unique strengths</li>
              <li>Explore content tailored to your professional identity</li>
              <li>Begin building your visibility strategy</li>
              <li>Connect with others who share your professional goals</li>
            </ul>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
            <Button
              onClick={onGetStarted}
              className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90 text-white text-lg py-6 px-8 h-auto rounded-lg"
              disabled={isTransitioning}
            >
              {isTransitioning ? 'Setting up...' : 'Get Started with Actions'}
            </Button>
            
            <Button
              onClick={onGoToDashboard}
              variant="outline"
              className="text-lg py-6 px-8 h-auto rounded-lg"
              disabled={isTransitioning}
            >
              {isTransitioning ? 'Setting up...' : 'Go to Dashboard'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
