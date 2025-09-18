import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileGuideButtonProps {
  userImage?: string;
  userName?: string;
  completionPercentage: number;
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function ProfileGuideButton({
  userImage,
  userName,
  completionPercentage,
  isOpen,
  onClick,
  className
}: ProfileGuideButtonProps) {
  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    // Pulse when profile is incomplete
    if (completionPercentage < 100) {
      setShouldPulse(true);
      const interval = setInterval(() => {
        setShouldPulse(prev => !prev);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setShouldPulse(false);
    }
  }, [completionPercentage]);

  const isComplete = completionPercentage >= 100;

  return (
    <div className={cn("fixed bottom-24 right-6 z-40", className)}>
      <Button
        size="lg"
        onClick={onClick}
        className={cn(
          "h-16 w-16 rounded-full p-0 shadow-xl transition-all duration-300",
          "bg-gradient-to-r from-primary to-secondary hover:shadow-2xl",
          shouldPulse && "animate-pulse",
          isOpen && "scale-110"
        )}
      >
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          
          {/* Progress indicator */}
          <div className="absolute -bottom-1 -right-1">
            {isComplete ? (
              <Badge className="h-6 w-6 rounded-full p-0 bg-green-500">
                <CheckCircle className="h-3 w-3 text-white" />
              </Badge>
            ) : (
              <Badge 
                variant="secondary" 
                className="h-6 w-6 rounded-full p-0 text-xs font-bold bg-orange-500 text-white"
              >
                {Math.round(completionPercentage)}
              </Badge>
            )}
          </div>
          
          {/* Pulse ring for incomplete profiles */}
          {!isComplete && (
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
          )}
        </div>
      </Button>
    </div>
  );
}