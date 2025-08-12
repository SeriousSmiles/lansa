
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface CompletionCardProps {
  onGoToDashboard: () => void;
  isTransitioning: boolean;
  identity?: string;
  desiredOutcome?: string;
  aiInsight?: string;
  aiCard?: any;
  isLoadingInsight?: boolean;
}

export const CompletionCard: React.FC<CompletionCardProps> = ({
  onGoToDashboard,
  isTransitioning,
  identity = "Professional",
  desiredOutcome = "Professional clarity",
  aiInsight,
  aiCard,
  isLoadingInsight = false,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  
  // Typing animation effect
  useEffect(() => {
    if (!aiInsight || isLoadingInsight) return;
    
    setIsTyping(true);
    let index = 0;
    const fullText = aiInsight;
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
  }, [aiInsight, isLoadingInsight]);

  // Additional error handling
  useEffect(() => {
    const checkTimeout = setTimeout(() => {
      if (isLoadingInsight && !aiInsight) {
        setLoadingError(true);
        console.error("AI insight is taking too long to load or failed to load");
      }
    }, 10000); // Set a 10s timeout
    
    return () => clearTimeout(checkTimeout);
  }, [isLoadingInsight, aiInsight]);

  return (
    <Card className="bg-white rounded-2xl overflow-hidden shadow-lg border-0 w-full">
      <div className="h-3 bg-gradient-to-r from-[#FF6B4A] to-[#FF8F6B]"></div>
      
      <CardContent className="p-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2E2E2E] mb-4">
              Your Profile is Complete!
            </h2>
            <p className="text-lg text-[#2E2E2E]">
              You've successfully completed your onboarding. Now you're ready to explore your personalized dashboard and start building your professional clarity.
            </p>
          </div>
          
          {aiCard ? (
            <div className="bg-[#F9F5FF] p-6 rounded-lg border-l-4 border-[#FF6B4A] space-y-4">
              <div>
                <p className="text-sm text-[#5A5A5A]">Identity</p>
                <h3 className="text-xl font-semibold text-[#2E2E2E] mt-1">{identity}</h3>
              </div>
              {aiCard.identity_summary && (
                <p className="text-lg text-[#2E2E2E]">{aiCard.identity_summary}</p>
              )}
              {aiCard.aspiration && (
                <div className="px-4 py-3 bg-white/70 rounded-md border">
                  <p className="text-[#2E2E2E] font-medium">“{aiCard.aspiration}”</p>
                </div>
              )}
              {Array.isArray(aiCard.challenges) && aiCard.challenges.length > 0 && (
                <div>
                  <p className="text-sm text-[#5A5A5A] mb-2">What’s currently in the way</p>
                  <ul className="list-disc list-inside space-y-1 text-[#2E2E2E]">
                    {aiCard.challenges.slice(0, 4).map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(aiCard.focus_pillars) && aiCard.focus_pillars.length > 0 && (
                <div>
                  <p className="text-sm text-[#5A5A5A] mb-2">Over the next 30 days we’ll focus on</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {aiCard.focus_pillars.slice(0, 3).map((p: any, i: number) => (
                      <div key={i} className="bg-white rounded-md p-4 border">
                        <p className="font-semibold text-[#2E2E2E]">{p.title}</p>
                        <p className="text-sm text-[#5A5A5A]">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#F9F5FF] p-6 rounded-lg border-l-4 border-[#FF6B4A]">
              {isLoadingInsight ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : loadingError ? (
                <p className="text-xl text-[#2E2E2E] font-medium">
                  Creating your personalized insights... This will be ready on your dashboard.
                </p>
              ) : (
                <p className="text-xl text-[#2E2E2E] font-medium relative">
                  "{displayedText}"
                  {isTyping && (
                    <span className="inline-block w-0.5 h-5 bg-[#2E2E2E] ml-0.5 animate-ping"></span>
                  )}
                </p>
              )}
            </div>
          )}
          
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
          
          <div className="flex justify-center mt-6">
            <Button
              onClick={onGoToDashboard}
              className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90 text-white text-lg py-6 px-8 h-auto rounded-lg w-full md:w-auto"
              disabled={isTransitioning}
            >
              {isTransitioning ? 'Setting up...' : 'Build My Success Dashboard'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
