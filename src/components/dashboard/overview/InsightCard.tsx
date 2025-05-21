
import { useState, useEffect } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { toast } from "sonner";

interface InsightCardProps {
  insight: string;
  isLoading?: boolean;
}

export function InsightCard({ insight, isLoading = false }: InsightCardProps) {
  const [displayedInsight, setDisplayedInsight] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  
  // Add timeout for loading to detect potential issues
  useEffect(() => {
    if (!isLoading) return;
    
    const timeout = setTimeout(() => {
      if (isLoading && !insight) {
        setLoadingError(true);
        console.error("Insight is taking too long to load");
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, [isLoading, insight]);
  
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

  // Log when the component renders with or without insight
  useEffect(() => {
    if (!isLoading) {
      if (insight) {
        console.log("InsightCard rendered with insight");
      } else {
        console.log("InsightCard rendered without insight");
      }
    }
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
        ) : loadingError ? (
          <div>
            <p className="text-base md:text-lg italic">
              "The professionals who advance fastest aren't just good at what they do — they're intentional about how they're perceived and positioned in their field."
            </p>
          </div>
        ) : !insight ? (
          <div>
            <p className="text-base md:text-lg italic">
              "The professionals who advance fastest aren't just good at what they do — they're intentional about how they're perceived and positioned in their field."
            </p>
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
