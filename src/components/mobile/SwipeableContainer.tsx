import React, { useRef, useCallback, useState } from "react";
import { gsap } from "gsap";

interface SwipeableContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDragProgress?: (direction: 'left' | 'right' | null, progress: number) => void;
  threshold?: number;
  className?: string;
}

export function SwipeableContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  onDragProgress,
  threshold = 80,
  className = ""
}: SwipeableContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const startTime = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isAnimating) return;
    isDragging.current = true;
    isHorizontalSwipe.current = null;
    startX.current = e.clientX;
    startY.current = e.clientY;
    currentX.current = 0;
    startTime.current = Date.now();
    containerRef.current?.setPointerCapture(e.pointerId);
  }, [isAnimating]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || isAnimating || !containerRef.current) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    // Determine direction lock on first significant movement
    if (isHorizontalSwipe.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
      if (!isHorizontalSwipe.current) {
        isDragging.current = false;
        containerRef.current?.releasePointerCapture(e.pointerId);
        return;
      }
    }

    if (!isHorizontalSwipe.current) return;

    currentX.current = dx;
    const progress = Math.min(Math.abs(dx) / threshold, 1);
    const rotation = (dx / threshold) * 8;
    const scale = 1 - progress * 0.04;

    gsap.set(containerRef.current, {
      x: dx,
      rotation,
      scale,
    });

    onDragProgress?.(dx > 0 ? 'right' : 'left', progress);
  }, [isAnimating, threshold, onDragProgress]);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current || !containerRef.current) return;
    isDragging.current = false;

    const dx = currentX.current;
    const elapsed = Date.now() - startTime.current;
    const velocity = Math.abs(dx) / elapsed; // px/ms

    // Flick detection: fast swipes trigger even at shorter distances
    const isFlick = velocity > 0.6 && Math.abs(dx) > 30;
    const isPastThreshold = Math.abs(dx) >= threshold;

    if ((isPastThreshold || isFlick) && dx > 0 && onSwipeRight) {
      animateExit('right', onSwipeRight);
    } else if ((isPastThreshold || isFlick) && dx < 0 && onSwipeLeft) {
      animateExit('left', onSwipeLeft);
    } else {
      // Spring back
      gsap.to(containerRef.current, {
        x: 0,
        rotation: 0,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
      });
      onDragProgress?.(null, 0);
    }
  }, [threshold, onSwipeLeft, onSwipeRight, onDragProgress]);

  const animateExit = (direction: 'left' | 'right', callback: () => void) => {
    if (!containerRef.current) return;
    setIsAnimating(true);

    const xTarget = direction === 'right' ? window.innerWidth * 1.2 : -window.innerWidth * 1.2;
    const rotTarget = direction === 'right' ? 20 : -20;

    gsap.to(containerRef.current, {
      x: xTarget,
      rotation: rotTarget,
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        callback();
        // Reset for next card
        if (containerRef.current) {
          gsap.set(containerRef.current, { x: 0, rotation: 0, opacity: 1, scale: 1 });
        }
        onDragProgress?.(null, 0);
        setIsAnimating(false);
      }
    });
  };

  // Public method for programmatic swipe (called from action buttons)
  const triggerSwipe = useCallback((direction: 'left' | 'right') => {
    if (isAnimating || !containerRef.current) return;
    const cb = direction === 'right' ? onSwipeRight : onSwipeLeft;
    if (cb) animateExit(direction, cb);
  }, [isAnimating, onSwipeLeft, onSwipeRight]);

  return (
    <div
      ref={containerRef}
      className={`${className} ${isAnimating ? 'pointer-events-none' : ''}`}
      style={{
        willChange: 'transform',
        touchAction: 'pan-y',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      data-trigger-swipe={triggerSwipe}
    >
      {children}
    </div>
  );
}
