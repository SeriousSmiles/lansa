import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Mobile-optimized animations
export const mobileAnimations = {
  // Page transition animations
  pageSlideIn: (element: HTMLElement, direction: 'left' | 'right' = 'right') => {
    const xStart = direction === 'right' ? '100%' : '-100%';
    
    gsap.fromTo(element, 
      { 
        x: xStart, 
        opacity: 0 
      },
      { 
        x: '0%', 
        opacity: 1, 
        duration: 0.4, 
        ease: "power2.out" 
      }
    );
  },

  pageSlideOut: (element: HTMLElement, direction: 'left' | 'right' = 'left') => {
    const xEnd = direction === 'left' ? '-100%' : '100%';
    
    return gsap.to(element, {
      x: xEnd,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    });
  },

  // Staggered list animations
  staggerCards: (elements: NodeListOf<Element> | Element[], delay: number = 0.1) => {
    return gsap.fromTo(elements,
      {
        y: 60,
        opacity: 0,
        scale: 0.9
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: delay,
        ease: "back.out(1.7)"
      }
    );
  },

  // Pull to refresh animation
  pullToRefresh: (element: HTMLElement, progress: number) => {
    const rotation = progress * 360;
    const scale = 0.8 + (progress * 0.4);
    
    gsap.set(element, {
      rotation,
      scale,
      transformOrigin: "center center"
    });
  },

  // Modal animations
  modalSlideUp: (element: HTMLElement) => {
    gsap.fromTo(element,
      { y: '100%', opacity: 0 },
      { y: '0%', opacity: 1, duration: 0.4, ease: "power2.out" }
    );
  },

  modalSlideDown: (element: HTMLElement) => {
    return gsap.to(element, {
      y: '100%',
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    });
  },

  // Button press feedback
  buttonPress: (element: HTMLElement) => {
    const tl = gsap.timeline();
    
    tl.to(element, { scale: 0.95, duration: 0.1 })
      .to(element, { scale: 1, duration: 0.2, ease: "back.out(1.7)" });
      
    return tl;
  },

  // Tab switching animation
  tabSwitch: (outElement: HTMLElement, inElement: HTMLElement, direction: 'left' | 'right' = 'right') => {
    const tl = gsap.timeline();
    const xOut = direction === 'right' ? '-50%' : '50%';
    const xIn = direction === 'right' ? '50%' : '-50%';
    
    tl.to(outElement, {
      x: xOut,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in"
    })
    .fromTo(inElement, 
      { x: xIn, opacity: 0 },
      { x: '0%', opacity: 1, duration: 0.3, ease: "power2.out" },
      "-=0.1"
    );
    
    return tl;
  },

  // Loading spinner with elastic effect
  loadingSpinner: (element: HTMLElement) => {
    return gsap.to(element, {
      rotation: 360,
      duration: 1,
      ease: "none",
      repeat: -1
    });
  },

  // Success checkmark animation
  successCheckmark: (element: HTMLElement) => {
    const tl = gsap.timeline();
    
    tl.fromTo(element,
      { scale: 0, rotation: -180 },
      { scale: 1.2, rotation: 0, duration: 0.4, ease: "back.out(1.7)" }
    )
    .to(element, { scale: 1, duration: 0.2 });
    
    return tl;
  },

  // Floating action button animations
  fabEntrance: (element: HTMLElement) => {
    gsap.fromTo(element,
      { scale: 0, rotation: -180, y: 100 },
      { scale: 1, rotation: 0, y: 0, duration: 0.8, ease: "back.out(1.7)" }
    );
  },

  fabPulse: (element: HTMLElement) => {
    return gsap.to(element, {
      scale: 1.1,
      duration: 0.6,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });
  },

  // Scroll-triggered animations for mobile
  setupScrollAnimations: (container: HTMLElement) => {
    const cards = container.querySelectorAll('[data-animate="card"]');
    const texts = container.querySelectorAll('[data-animate="text"]');
    
    // Animate cards on scroll
    cards.forEach((card, index) => {
      gsap.fromTo(card,
        { y: 80, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
    
    // Animate text elements
    texts.forEach((text) => {
      gsap.fromTo(text,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: text,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }
};

// Utility functions for mobile interactions
export const mobileUtils = {
  // Check if device supports touch
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Get safe area insets for mobile
  getSafeAreaInsets: () => {
    const style = getComputedStyle(document.documentElement);
    return {
      top: style.getPropertyValue('--sat') || '0px',
      right: style.getPropertyValue('--sar') || '0px',
      bottom: style.getPropertyValue('--sab') || '0px',
      left: style.getPropertyValue('--sal') || '0px'
    };
  },

  // Haptic feedback simulation
  hapticFeedback: (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [50],
        medium: [100],
        heavy: [200]
      };
      navigator.vibrate(patterns[type]);
    }
  },

  // Performance optimized scroll handler
  throttledScrollHandler: (callback: (scrollY: number) => void, delay: number = 16) => {
    let isThrottled = false;
    
    return () => {
      if (!isThrottled) {
        callback(window.scrollY);
        isThrottled = true;
        setTimeout(() => {
          isThrottled = false;
        }, delay);
      }
    };
  }
};