import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { X } from "lucide-react";

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function MobileActionSheet({ isOpen, onClose, title, children }: MobileActionSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Animate in
      if (overlayRef.current) {
        gsap.fromTo(overlayRef.current, 
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        );
      }
      
      if (sheetRef.current) {
        gsap.fromTo(sheetRef.current,
          { y: "100%" },
          { y: "0%", duration: 0.4, ease: "power2.out" }
        );
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else if (overlayRef.current && sheetRef.current) {
      // Animate out
      gsap.to(sheetRef.current, {
        y: "100%",
        duration: 0.3,
        ease: "power2.in"
      });
      
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          document.body.style.overflow = 'unset';
        }
      });
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Action Sheet */}
      <div 
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--card)/0.98))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-muted rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pb-4 border-b border-border/50">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}