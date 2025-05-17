
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { useRef, useEffect } from "react";
import { animateElementsSequence } from "@/utils/animationHelpers";

interface OverviewTabProps {
  userName: string;
  role: string;
  goal: string;
  insight: string;
  highlightActions: boolean;
}

export function OverviewTab({ userName, role, goal, insight, highlightActions }: OverviewTabProps) {
  const recommendedActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate recommended actions cards with staggered delay
    if (recommendedActionsRef.current) {
      const cards = recommendedActionsRef.current.querySelectorAll('.animated-card');
      animateElementsSequence(cards, {
        opacity: [0, 1],
        y: [20, 0],
        stagger: 0.1,
        duration: 0.5,
        delay: 0.3,
        ease: "power2.out"
      });
    }
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <AnimatedCard delay={0.1} className="h-auto hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg md:text-xl">Your Profile</CardTitle>
            <CardDescription>Based on your onboarding answers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-base md:text-lg">{role}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Goal</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-base md:text-lg">{goal}</p>
                </div>
              </div>
              <div className="pt-1">
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="btn-animate">View Full Profile</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
        
        <AnimatedCard delay={0.2} className="h-auto hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg md:text-xl">Your Insight</CardTitle>
            <CardDescription>Personalized for your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base md:text-lg italic">"{insight}"</p>
          </CardContent>
        </AnimatedCard>
      </div>
      
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold animate-fade-in">Recommended Actions</h2>
        {highlightActions && (
          <div className="bg-[#FF6B4A]/20 text-[#FF6B4A] px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            Start here
          </div>
        )}
      </div>
      
      <div 
        ref={recommendedActionsRef}
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${
          highlightActions ? 'ring-2 ring-[#FF6B4A] ring-offset-4 rounded-lg p-4 animate-[scale-in_0.5s_ease-out]' : ''
        }`}
      >
        <RecommendedActionCard
          title="Define Your Message"
          description="Clarify how you talk about yourself and your work to resonate with your audience."
          buttonText="Start Exercise"
          delay={0.3}
        />
        
        <RecommendedActionCard
          title="Build Your Presence"
          description="Create a standout online profile that showcases your unique value."
          buttonText="Start Building"
          delay={0.4}
        />
        
        <RecommendedActionCard
          title="Track Progress"
          description="See your journey toward greater clarity and professional visibility."
          buttonText="View Progress"
          delay={0.5}
        />
      </div>
    </>
  );
}

interface RecommendedActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  delay: number;
}

function RecommendedActionCard({ title, description, buttonText, delay }: RecommendedActionCardProps) {
  return (
    <AnimatedCard delay={delay} className="animated-card h-auto hover-scale">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm">{description}</p>
        <Button variant="outline" size="sm" className="w-full btn-animate">{buttonText}</Button>
      </CardContent>
    </AnimatedCard>
  );
}
