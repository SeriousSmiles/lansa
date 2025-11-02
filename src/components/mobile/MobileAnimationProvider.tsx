import React, { createContext, useContext, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mobileAnimations, mobileUtils } from "@/utils/mobileAnimations";

gsap.registerPlugin(ScrollTrigger);

interface MobileAnimationContextType {
  animations: typeof mobileAnimations;
  utils: typeof mobileUtils;
  isTouch: boolean;
}

const MobileAnimationContext = createContext<MobileAnimationContextType | null>(null);

export function useMobileAnimation() {
  const context = useContext(MobileAnimationContext);
  if (!context) {
    throw new Error('useMobileAnimation must be used within MobileAnimationProvider');
  }
  return context;
}

interface MobileAnimationProviderProps {
  children: React.ReactNode;
}

export function MobileAnimationProvider({ children }: MobileAnimationProviderProps) {
  const isTouch = useRef(mobileUtils.isTouchDevice());

  useEffect(() => {
    // Set up global mobile optimizations
    gsap.defaults({
      force3D: true,
      transformOrigin: "center center"
    });

    // Configure ScrollTrigger for mobile
    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: "resize,DOMContentLoaded,load"
    });

    // Add mobile-specific CSS variables
    const root = document.documentElement;
    const safeAreaInsets = mobileUtils.getSafeAreaInsets();
    
    root.style.setProperty('--sat', safeAreaInsets.top);
    root.style.setProperty('--sar', safeAreaInsets.right);
    root.style.setProperty('--sab', safeAreaInsets.bottom);
    root.style.setProperty('--sal', safeAreaInsets.left);

    // Refresh ScrollTrigger on orientation change
    const handleOrientationChange = () => {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const value: MobileAnimationContextType = {
    animations: mobileAnimations,
    utils: mobileUtils,
    isTouch: isTouch.current
  };

  return (
    <MobileAnimationContext.Provider value={value}>
      {children}
    </MobileAnimationContext.Provider>
  );
}