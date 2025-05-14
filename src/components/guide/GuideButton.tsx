
import { useState, forwardRef, ForwardedRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { gsap } from 'gsap';

interface GuideButtonProps {
  onClick: () => void;
  className?: string;
}

export const GuideButton = forwardRef<HTMLButtonElement, GuideButtonProps>(
  ({ onClick, className }, ref) => {
    const [isHovering, setIsHovering] = useState(false);
    
    useEffect(() => {
      const button = ref as unknown as HTMLButtonElement;
      if (!button) return;
      
      // Initial animation
      gsap.fromTo(button, 
        { scale: 0, opacity: 0, rotation: 180 }, 
        { scale: 1, opacity: 1, rotation: 0, duration: 1, ease: "elastic.out(1, 0.5)", delay: 1 }
      );
      
      // Add pulse animation that runs every 30 seconds
      const pulseTimeline = gsap.timeline({repeat: -1, repeatDelay: 30});
      pulseTimeline.to(button, {
        scale: 1.15,
        duration: 0.5,
        ease: "power1.inOut"
      }).to(button, {
        scale: 1,
        duration: 0.5,
        ease: "power1.inOut"
      });
      
      return () => {
        pulseTimeline.kill();
      };
    }, [ref]);
    
    return (
      <Button 
        onClick={onClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={cn(
          "fixed bottom-6 right-6 rounded-full p-0 w-14 h-14 shadow-lg z-50 transition-all duration-300",
          isHovering ? "bg-[#FF6B4A] scale-110" : "bg-[#FF8F6B]",
          className
        )}
        ref={ref}
      >
        <HelpCircle className={cn(
          "w-6 h-6 text-white transition-transform duration-300",
          isHovering && "animate-bounce"
        )} />
      </Button>
    );
  }
);

GuideButton.displayName = "GuideButton";
