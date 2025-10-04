import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface StrengthBarProps {
  strength: number; // 0.0 to 1.0
  weakestDimension?: 'clarity' | 'specificity' | 'relevance';
}

export function StrengthBar({ strength, weakestDimension }: StrengthBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
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
        color: "text-red-600"
      };
    } else if (strength < 0.7) {
      return {
        text: "Getting there — make it specific and measurable.",
        color: "text-yellow-600"
      };
    } else {
      return {
        text: "Strong — this reads like value.",
        color: "text-green-600"
      };
    }
  };

  const thresholdInfo = getThresholdInfo();

  const getIcon = () => {
    if (strength >= 0.7) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (strength >= 0.4) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-4 p-5 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="font-semibold text-foreground">Manager Response</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{Math.round(strength * 100)}%</div>
          <div className="text-xs text-muted-foreground">strength</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="w-full bg-muted rounded-full h-2 relative overflow-hidden">
          <div 
            ref={progressRef}
            className={`h-2 rounded-full transition-all duration-500 ${
              strength >= 0.7 ? 'bg-green-500 shadow-green-500/30 shadow-md' : 
              strength >= 0.4 ? 'bg-yellow-500 shadow-yellow-500/30 shadow-md' : 'bg-red-500 shadow-red-500/30 shadow-md'
            }`}
            style={{ width: '0%' }}
          />
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className={`font-medium ${thresholdInfo.color}`}>
            {thresholdInfo.text}
          </span>
          {weakestDimension && strength < 0.7 && (
            <span className="text-foreground bg-primary/10 border border-primary/20 px-2 py-1 rounded font-medium">
              Focus on: {weakestDimension}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}