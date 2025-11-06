import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from './use-mobile';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  enabled?: boolean;
}

export function usePullToRefresh({ onRefresh, enabled = true }: UsePullToRefreshOptions) {
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobile || !enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing || window.scrollY > 0) return;
      
      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;
      
      if (distance > 0 && distance < 100) {
        container.style.transform = `translateY(${distance}px)`;
        container.style.transition = 'none';
      }
    };

    const handleTouchEnd = async () => {
      const distance = currentY.current - startY.current;
      
      if (distance > 60 && !isRefreshing) {
        setIsRefreshing(true);
        container.style.transform = 'translateY(40px)';
        container.style.transition = 'transform 0.3s ease';
        
        try {
          await onRefresh();
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            container.style.transform = 'translateY(0)';
          }, 300);
        }
      } else {
        container.style.transform = 'translateY(0)';
        container.style.transition = 'transform 0.3s ease';
      }
      
      startY.current = 0;
      currentY.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, enabled, isRefreshing, onRefresh]);

  return { containerRef, isRefreshing };
}
