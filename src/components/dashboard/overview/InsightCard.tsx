
import { useState, useEffect } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";

interface InsightCardProps {
  insight: string;
  isLoading?: boolean;
}

export function InsightCard({ insight, isLoading = false }: InsightCardProps) {
  const [displayedInsight, setDisplayedInsight] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Animate insight text with typing effect
  useEffect(() => {
    if (!insight || isLoading) return;
    
    setIsTyping(true);
    let index = 0;
    const fullText = insight;
    setDisplayedInsight("");
    
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedInsight((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 20); // Adjust typing speed
    
    return () => clearInterval(typingInterval);
  }, [insight, isLoading]);

  return (
    <AnimatedCard delay={0.2} className="h-auto hover-lift">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg md:text-xl">Your Insight</CardTitle>
        <CardDescription>Personalized for your journey</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-3 w-5/6 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-3 w-4/6 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ) : (
          <p className="text-base md:text-lg italic relative">
            "{displayedInsight}"
            {isTyping && (
              <span className="inline-block w-0.5 h-5 bg-[#2E2E2E] ml-0.5 animate-ping"></span>
            )}
          </p>
        )}
      </CardContent>
    </AnimatedCard>
  );
}
