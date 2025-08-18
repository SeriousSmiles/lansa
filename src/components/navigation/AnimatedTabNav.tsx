import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { TablerIcon } from "@tabler/icons-react";

type TabItem = {
  title: string;
  url: string;
  icon: TablerIcon;
};

interface AnimatedTabNavProps {
  items: TabItem[];
  themeColor?: string;
}

export function AnimatedTabNav({ items, themeColor }: AnimatedTabNavProps) {
  const location = useLocation();
  const tabsRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Find active tab based on current route
  useEffect(() => {
    let currentIndex = items.findIndex(item => {
      // Handle dashboard route - both "/" and "/dashboard" should match dashboard
      if (item.url === "/dashboard") {
        return location.pathname === "/" || location.pathname === "/dashboard";
      }
      return location.pathname === item.url;
    });
    
    // If no exact match and on root, default to first item (dashboard)
    if (currentIndex === -1 && location.pathname === "/") {
      currentIndex = 0;
    }
    
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname, items]);

  // Animate slider to active tab
  useEffect(() => {
    if (!tabsRef.current || !sliderRef.current) return;

    const tabs = tabsRef.current.querySelectorAll('.tab-item');
    const activeTab = tabs[activeIndex] as HTMLElement;
    
    if (activeTab) {
      const tabRect = activeTab.getBoundingClientRect();
      const containerRect = tabsRef.current.getBoundingClientRect();
      const relativeLeft = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;

      gsap.to(sliderRef.current, {
        x: relativeLeft,
        width: tabWidth,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  }, [activeIndex]);

  return (
    <div className="relative">
      <div 
        ref={tabsRef}
        className="flex items-center bg-muted/30 rounded-full p-1 backdrop-blur-sm border border-border/50"
      >
        {/* Animated slider background */}
        <div
          ref={sliderRef}
          className="absolute h-[calc(100%-8px)] rounded-full transition-all duration-400 ease-out"
          style={{
            backgroundColor: themeColor || 'hsl(var(--primary))',
            opacity: 0.15,
            top: '4px',
            left: '4px',
            boxShadow: `0 2px 8px -2px ${themeColor || 'hsl(var(--primary))'}40`,
          }}
        />

        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === activeIndex;
          
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`tab-item relative z-10 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-400 ease-out flex items-center gap-2 ${
                isActive 
                  ? 'text-foreground transform scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:scale-102'
              }`}
              style={{
                color: isActive ? (themeColor || 'hsl(var(--primary))') : undefined
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="whitespace-nowrap">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}