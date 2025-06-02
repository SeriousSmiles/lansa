
import { useRef, useEffect } from "react";
import { RecommendedActionCard } from "./RecommendedActionCard";
import { getPersonalizedActionPoints } from "@/utils/actionPoints";
import { animateElementsSequence } from "@/utils/animationHelpers";

interface RecommendedActionsProps {
  role: string;
  highlightActions: boolean;
}

export function RecommendedActions({ role, highlightActions }: RecommendedActionsProps) {
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
  
  // Get personalized action points based on role
  const actionPoints = getPersonalizedActionPoints(role);

  const handleActionClick = (actionTitle: string) => {
    console.log(`Action clicked: ${actionTitle}`);
    // Add action handling logic here
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold animate-fade-in">Recommended Actions</h2>
        {highlightActions && (
          <div className="bg-[#FF6B4A]/20 text-[#FF6B4A] px-3 py-1 rounded-full text-sm font-medium animate-pulse self-start sm:self-center">
            Start here
          </div>
        )}
      </div>
      
      <div 
        ref={recommendedActionsRef}
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 ${
          highlightActions ? 'ring-2 ring-[#FF6B4A] ring-offset-4 rounded-lg p-3 sm:p-4 animate-[scale-in_0.5s_ease-out]' : ''
        }`}
      >
        {actionPoints.map((action, index) => (
          <RecommendedActionCard
            key={index}
            title={action.title}
            description={action.description}
            buttonText={action.buttonText}
            icon={action.icon}
            onClick={() => handleActionClick(action.title)}
            isHighlighted={highlightActions}
          />
        ))}
      </div>
    </div>
  );
}
