import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface StrengthBarProps {
  strength: number; // 0.0 to 1.0
  weakestDimension?: 'clarity' | 'specificity' | 'relevance';
}

export function StrengthBar({ strength, weakestDimension }: StrengthBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fillRef.current && barRef.current) {
      gsap.to(fillRef.current, {
        width: `${strength * 100}%`,
        duration: 0.8,
        ease: "power2.out"
      });
    }
  }, [strength]);

  const getThresholdInfo = () => {
    if (strength < 0.5) {
      return {
        text: "Weak — managers can't see the outcome yet.",
        color: "bg-red-500",
        textColor: "text-red-600"
      };
    } else if (strength < 0.7) {
      return {
        text: "Getting there — make it specific and measurable.",
        color: "bg-yellow-500",
        textColor: "text-yellow-600"
      };
    } else {
      return {
        text: "Strong — this reads like value.",
        color: "bg-green-500",
        textColor: "text-green-600"
      };
    }
  };

  const thresholdInfo = getThresholdInfo();

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Strength</span>
        <span className="text-sm font-bold text-gray-900">
          {Math.round(strength * 100)}%
        </span>
      </div>
      
      <div 
        ref={barRef}
        className="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
      >
        <div
          ref={fillRef}
          className={`h-full ${thresholdInfo.color} rounded-full transition-all duration-300`}
          style={{ width: '0%' }}
        />
      </div>
      
      <div className="space-y-1">
        <p className={`text-sm font-medium ${thresholdInfo.textColor}`}>
          {thresholdInfo.text}
        </p>
        
        {weakestDimension && strength < 0.7 && (
          <p className="text-xs text-gray-500">
            Weakest area: {weakestDimension}
          </p>
        )}
      </div>
    </div>
  );
}