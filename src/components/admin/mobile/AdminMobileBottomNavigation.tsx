import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, Building2, Megaphone, Grid } from "lucide-react";
import { gsap } from "gsap";
import { useMobileFAB } from "@/hooks/useMobileFAB";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { title: "Home", url: "/admin", icon: Home },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Organizations", url: "/admin/organizations", icon: Building2 },
  { title: "Updates", url: "/admin/updates", icon: Megaphone },
  { title: "More", url: "#more", icon: Grid },
];

export function AdminMobileBottomNavigation() {
  const location = useLocation();
  const { openQuickActions } = useMobileFAB();
  const navRef = useRef<HTMLDivElement>(null);
  const activeIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate navigation entrance
    if (navRef.current) {
      gsap.fromTo(navRef.current, 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  }, []);

  useEffect(() => {
    // Animate active indicator
    const activeIndex = navItems.findIndex(item => {
      if (item.url === '/admin') {
        return location.pathname === '/admin';
      }
      return location.pathname.startsWith(item.url) && item.url !== '#more';
    });
    
    if (activeIndex !== -1 && activeIndicatorRef.current) {
      const itemWidth = 100 / navItems.length;
      gsap.to(activeIndicatorRef.current, {
        x: `${activeIndex * itemWidth}%`,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  }, [location.pathname]);

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    if (item.url === '#more') {
      e.preventDefault();
      openQuickActions();
      return;
    }
    
    const target = e.currentTarget;
    // Ripple effect animation
    gsap.timeline()
      .to(target, { scale: 0.95, duration: 0.1 })
      .to(target, { scale: 1, duration: 0.2, ease: "back.out(1.7)" });
  };

  return (
    <>
      {/* Bottom Navigation */}
      <div 
        ref={navRef}
        className="fixed bottom-0 left-0 right-0 z-[100] bg-card/95 backdrop-blur-lg border-t border-border/50 md:hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--card)/0.95), hsl(var(--primary)/0.05))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Active indicator */}
        <div 
          ref={activeIndicatorRef}
          className="absolute top-0 h-1 bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
          style={{ width: `${100 / navItems.length}%` }}
        />
        
        <div className="flex items-center justify-around px-2 py-2 h-16">
          {navItems.map((item, index) => {
            const isActive = item.url === '/admin' 
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.url) && item.url !== '#more';
            const Icon = item.icon;
            
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`
                  flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'text-primary bg-primary/10 scale-110' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
                onClick={(e) => handleItemClick(e, item)}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'animate-pulse' : ''}`} />
                </div>
                <span className={`text-xs mt-1 transition-all duration-300 ${isActive ? 'font-medium' : ''}`}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom spacing for content */}
      <div className="h-20 md:hidden" />
    </>
  );
}
