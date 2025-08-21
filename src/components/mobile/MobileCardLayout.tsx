import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface MobileCardLayoutProps {
  children: React.ReactNode;
  className?: string;
  animationDelay?: number;
  enableParallax?: boolean;
}

export function MobileCardLayout({ 
  children, 
  className = "",
  animationDelay = 0,
  enableParallax = false
}: MobileCardLayoutProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    // Entrance animation
    gsap.fromTo(cardRef.current, 
      { 
        y: 50, 
        opacity: 0,
        scale: 0.95
      },
      { 
        y: 0, 
        opacity: 1,
        scale: 1,
        duration: 0.6,
        delay: animationDelay,
        ease: "back.out(1.7)"
      }
    );

    // Parallax scroll effect for mobile
    if (enableParallax) {
      ScrollTrigger.create({
        trigger: cardRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const yPos = (progress - 0.5) * 50;
          gsap.set(cardRef.current, { y: yPos });
        }
      });
    }

    // Hover/touch interactions
    const handleTouchStart = () => {
      gsap.to(cardRef.current, {
        scale: 0.98,
        duration: 0.1,
        ease: "power2.out"
      });
    };

    const handleTouchEnd = () => {
      gsap.to(cardRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "back.out(1.7)"
      });
    };

    const element = cardRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [animationDelay, enableParallax]);

  return (
    <div 
      ref={cardRef}
      className={`
        bg-card rounded-2xl shadow-lg border border-border/10 p-6 
        transition-all duration-300 hover:shadow-xl
        backdrop-blur-sm bg-card/95
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, hsl(var(--card)/0.95), hsl(var(--primary)/0.02))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </div>
  );
}