import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, User, Settings, Plus } from "lucide-react";
import { gsap } from "gsap";
import { useMobileNavigation } from "@/contexts/MobileNavigationContext";
import { MobileQuickActions } from "./MobileQuickActions";
import { useMobileFAB } from "@/hooks/useMobileFAB";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Discovery", url: "/opportunity-discovery", icon: Search },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function MobileBottomNavigation() {
  const location = useLocation();
  const { shouldShowNavigation, showFAB, fabAction } = useMobileNavigation();
  const { isQuickActionsOpen, closeQuickActions } = useMobileFAB();
  const navRef = useRef<HTMLDivElement>(null);
  const activeIndicatorRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const [navHidden, setNavHidden] = React.useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setNavHidden(currentY > lastScrollY.current && currentY > 80);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Animate navigation entrance
    if (navRef.current) {
      gsap.fromTo(navRef.current, 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }

    // Animate FAB entrance with delay
    if (fabRef.current) {
      gsap.fromTo(fabRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.8, delay: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, []);

  useEffect(() => {
    // Animate active indicator
    const activeIndex = navItems.findIndex(item => location.pathname === item.url);
    if (activeIndex !== -1 && activeIndicatorRef.current) {
      const itemWidth = 100 / navItems.length;
      gsap.to(activeIndicatorRef.current, {
        x: `${activeIndex * itemWidth}%`,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  }, [location.pathname]);

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    const target = e.currentTarget;
    
    // Ripple effect animation
    gsap.timeline()
      .to(target, { scale: 0.95, duration: 0.1 })
      .to(target, { scale: 1, duration: 0.2, ease: "back.out(1.7)" });
  };

  if (!shouldShowNavigation) return null;

  return (
    <>
      {/* Bottom Navigation */}
      <div 
        ref={navRef}
        className={`fixed bottom-0 left-0 right-0 z-[100] bg-card/95 backdrop-blur-lg border-t border-border/50 md:hidden transition-transform duration-300 ${navHidden ? 'translate-y-full' : 'translate-y-0'}`}
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
            const isActive = location.pathname === item.url;
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
                onClick={(e) => handleItemClick(e, index)}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'animate-pulse' : ''}`} />
                  {item.badge && (
                    <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center animate-bounce">
                      {item.badge}
                    </div>
                  )}
                </div>
                <span className={`text-xs mt-1 transition-all duration-300 ${isActive ? 'font-medium' : ''}`}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button */}
      {showFAB && (
        <button
          ref={fabRef}
          className="fixed bottom-24 right-6 z-[101] md:hidden bg-gradient-to-r from-primary to-secondary text-primary-foreground h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          onClick={() => {
            // Add haptic-style feedback animation
            if (fabRef.current) {
              gsap.timeline()
                .to(fabRef.current, { scale: 0.9, duration: 0.1 })
                .to(fabRef.current, { scale: 1.1, duration: 0.2 })
                .to(fabRef.current, { scale: 1, duration: 0.1 });
            }
            fabAction();
          }}
        >
        <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
        
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-150 transition-transform duration-300" />
        </button>
      )}

      {/* Bottom spacing for content */}
      <div className="h-20 md:hidden" />
      
      {/* Quick Actions Modal */}
      <MobileQuickActions 
        isOpen={isQuickActionsOpen}
        onClose={closeQuickActions}
      />
    </>
  );
}