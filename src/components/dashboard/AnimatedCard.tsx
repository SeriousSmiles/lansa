
import { forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  children: React.ReactNode;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, delay = 0, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "opacity-0 animate-fade-in transition-shadow duration-200 hover:shadow-md",
          className
        )}
        style={{
          animationDelay: `${delay}s`,
          animationFillMode: "forwards"
        }}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";
