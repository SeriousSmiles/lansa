import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

interface SwipeableContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export function SwipeableContainer({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  threshold = 100,
  className = ""
}: SwipeableContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const draggable = Draggable.create(containerRef.current, {
      type: "x",
      bounds: { minX: -threshold * 2, maxX: threshold * 2 },
      inertia: true,
      snap: {
        x: (endValue: number) => {
          if (Math.abs(endValue) < threshold) return 0;
          return endValue > 0 ? threshold : -threshold;
        }
      },
      onDrag: function() {
        const progress = Math.abs(this.x) / threshold;
        const scale = 1 - (progress * 0.05);
        gsap.set(containerRef.current, { scale });
        
        // Add subtle rotation based on swipe direction
        const rotation = (this.x / threshold) * 2;
        gsap.set(containerRef.current, { rotation });
      },
      onThrowComplete: function() {
        setIsAnimating(true);
        
        if (this.x >= threshold && onSwipeRight) {
          // Swipe right animation
          gsap.to(containerRef.current, {
            x: "100%",
            rotation: 15,
            opacity: 0,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
              onSwipeRight();
              gsap.set(containerRef.current, { x: 0, rotation: 0, opacity: 1, scale: 1 });
              setIsAnimating(false);
            }
          });
        } else if (this.x <= -threshold && onSwipeLeft) {
          // Swipe left animation
          gsap.to(containerRef.current, {
            x: "-100%",
            rotation: -15,
            opacity: 0,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
              onSwipeLeft();
              gsap.set(containerRef.current, { x: 0, rotation: 0, opacity: 1, scale: 1 });
              setIsAnimating(false);
            }
          });
        } else {
          // Spring back to center
          gsap.to(containerRef.current, {
            x: 0,
            rotation: 0,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.7)",
            onComplete: () => setIsAnimating(false)
          });
        }
      }
    });

    return () => {
      draggable[0].kill();
    };
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return (
    <div 
      ref={containerRef}
      className={`touch-pan-x ${className} ${isAnimating ? 'pointer-events-none' : ''}`}
      style={{ 
        willChange: 'transform',
        touchAction: 'pan-x pinch-zoom'
      }}
    >
      {children}
    </div>
  );
}