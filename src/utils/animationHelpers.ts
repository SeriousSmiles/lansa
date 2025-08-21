
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Hook for animating elements on mount with mobile optimizations
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
    
    // Animate to end values with mobile-optimized settings
    gsap.to(elementRef.current, {
      opacity: animation.opacity[1],
      y: animation.y[1],
      duration: animation.duration,
      delay: animation.delay,
      ease: animation.ease,
      force3D: true, // Hardware acceleration for mobile
      transformOrigin: "center center"
    });
    
    return () => {
      if (elementRef.current) {
        gsap.killTweensOf(elementRef.current);
      }
    };
  }, [shouldAnimate, animation]);
  
  return elementRef;
};

// Enhanced mobile-first animation hook
export const useMobileAnimation = (
  animationType: 'slideUp' | 'fadeIn' | 'scaleIn' | 'stagger' = 'fadeIn',
  options = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    const animations = {
      slideUp: {
        from: { y: 80, opacity: 0 },
        to: { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
      },
      fadeIn: {
        from: { opacity: 0, scale: 0.95 },
        to: { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
      },
      scaleIn: {
        from: { scale: 0, rotation: -180 },
        to: { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)" }
      },
      stagger: {
        from: { y: 40, opacity: 0 },
        to: { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      }
    };
    
    const config = animations[animationType];
    gsap.fromTo(elementRef.current, config.from, { ...config.to, ...options });
    
    return () => {
      if (elementRef.current) {
        gsap.killTweensOf(elementRef.current);
      }
    };
  }, [animationType, options]);
  
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
