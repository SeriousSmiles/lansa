
import { ReactNode, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { pageTransitionAnimation } from "@/utils/animationHelpers";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  useEffect(() => {
    if (containerRef.current) {
      pageTransitionAnimation(containerRef.current);
    }
  }, [location.pathname]);
  
  return (
    <div ref={containerRef} className={`page-transition ${className}`}>
      {children}
    </div>
  );
}
