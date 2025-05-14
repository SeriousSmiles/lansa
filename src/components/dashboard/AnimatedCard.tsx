
import { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { gsap } from 'gsap';
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({ children, delay = 0, className }: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!cardRef.current) return;
    
    gsap.set(cardRef.current, {
      y: 20,
      opacity: 0
    });
    
    gsap.to(cardRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.5,
      delay: delay,
      ease: "power2.out"
    });
    
    // Add hover animation
    cardRef.current.addEventListener('mouseenter', () => {
      gsap.to(cardRef.current, {
        y: -5,
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        duration: 0.3
      });
    });
    
    cardRef.current.addEventListener('mouseleave', () => {
      gsap.to(cardRef.current, {
        y: 0,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        duration: 0.3
      });
    });
    
    return () => {
      if (cardRef.current) {
        cardRef.current.removeEventListener('mouseenter', () => {});
        cardRef.current.removeEventListener('mouseleave', () => {});
      }
    };
  }, [delay]);
  
  return (
    <Card ref={cardRef} className={cn("transition-all", className)}>
      {children}
    </Card>
  );
}
