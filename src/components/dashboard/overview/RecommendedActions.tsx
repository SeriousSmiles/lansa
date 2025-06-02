
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
        stagger: 0.15,
        duration: 0.6,
        delay: 0.4,
        ease: "power2.out"
      });
    }
  }, []);
  
  // Get personalized action points based on role - limit to 4 for 2 columns
  const actionPoints = getPersonalizedActionPoints(role).slice(0, 4);

  const handleActionClick = (actionTitle: string) => {
    console.log(`Action clicked: ${actionTitle}`);
    // Add action handling logic here
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 animate-fade-in">Recommended Actions</h2>
          <p className="text-sm text-gray-600 mt-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Start with these key steps to accelerate your progress
          </p>
        </div>
        {highlightActions && (
          <div className="bg-gradient-to-r from-[#FF6B4A] to-[#FF8A65] text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse shadow-lg self-start sm:self-center">
            ✨ Start here
          </div>
        )}
      </div>
      
      <div 
        ref={recommendedActionsRef}
        className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${
          highlightActions ? 'ring-2 ring-[#FF6B4A] ring-offset-4 rounded-xl p-4 bg-gradient-to-br from-orange-50/50 to-red-50/30 animate-[scale-in_0.6s_ease-out]' : ''
        }`}
      >
        {actionPoints.map((action, index) => (
          <div key={index} className="animated-card">
            <RecommendedActionCard
              title={action.title}
              description={action.description}
              buttonText={action.buttonText}
              icon={action.icon}
              onClick={() => handleActionClick(action.title)}
              isHighlighted={highlightActions}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
