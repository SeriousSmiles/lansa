
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

// Hook for animating elements on mount
export const useElementAnimation = (
  shouldAnimate = true,
  animation = {
    opacity: [0, 1],
    y: [20, 0],
    duration: 0.6,
    delay: 0,
    ease: "power2.out"
  }
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!shouldAnimate || !elementRef.current) return;
    
    // Initialize with starting values
    gsap.set(elementRef.current, {
      opacity: animation.opacity[0],
      y: animation.y[0],
    });
    
    // Animate to end values
    gsap.to(elementRef.current, {
      opacity: animation.opacity[1],
      y: animation.y[1],
      duration: animation.duration,
      delay: animation.delay,
      ease: animation.ease
    });
    
    return () => {
      if (elementRef.current) {
        gsap.killTweensOf(elementRef.current);
      }
    };
  }, [shouldAnimate, animation]);
  
  return elementRef;
};

// Function for staggered animations of multiple elements
export const animateElementsSequence = (
  elements: NodeListOf<Element> | Element[], 
  options = { 
    opacity: [0, 1], 
    y: [20, 0], 
    stagger: 0.1,
    duration: 0.5,
    delay: 0,
    ease: "power2.out"
  }
) => {
  if (!elements || elements.length === 0) return;
  
  return gsap.fromTo(elements, 
    {
      opacity: options.opacity[0],
      y: options.y[0]
    },
    {
      opacity: options.opacity[1],
      y: options.y[1],
      stagger: options.stagger,
      duration: options.duration,
      delay: options.delay,
      ease: options.ease
    }
  );
};

// Function for page transition animations
export const pageTransitionAnimation = (container: HTMLElement | null) => {
  if (!container) return;
  
  // Initial state
  gsap.set(container, { opacity: 0 });
  
  // Animate in
  return gsap.to(container, {
    opacity: 1,
    duration: 0.4,
    ease: "power1.out"
  });
};
