import React, { useRef, useEffect, useState } from "react";
import { MobileCardLayout } from "./MobileCardLayout";
import { SwipeableContainer } from "./SwipeableContainer";
import { Bell, Plus, TrendingUp, Users, BookOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { gsap } from "gsap";

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  progress?: number;
  icon: React.ElementType;
  color: string;
  action?: () => void;
}

interface MobileDashboardLayoutProps {
  userName?: string;
  cards: DashboardCard[];
  notifications?: number;
  onNotificationClick?: () => void;
  onAddAction?: () => void;
}

export function MobileDashboardLayout({
  userName,
  cards,
  notifications = 0,
  onNotificationClick,
  onAddAction
}: MobileDashboardLayoutProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    // Animate header entrance
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );
    }

    // Stagger animate cards
    if (cardsRef.current) {
      const cardElements = cardsRef.current.querySelectorAll('[data-card]');
      gsap.fromTo(cardElements,
        { y: 80, opacity: 0, scale: 0.9 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          duration: 0.8, 
          stagger: 0.1, 
          ease: "back.out(1.7)",
          delay: 0.2
        }
      );
    }
  }, []);

  const handleCardSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else if (direction === 'right' && currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background md:hidden">
      {/* Header */}
      <div 
        ref={headerRef}
        className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border/50 mobile-safe-top"
      >
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-foreground font-urbanist">
              Good morning, {userName}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Ready to achieve your goals?
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="relative h-10 w-10 rounded-full"
              onClick={onNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-mobile-pulse"
                >
                  {notifications}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-6">
        {/* Quick stats */}
        <MobileCardLayout className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">This Week</h3>
              <p className="text-2xl font-bold lansa-gradient-text">5 Goals</p>
              <p className="text-sm text-muted-foreground">3 completed</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>
        </MobileCardLayout>

        {/* Cards grid */}
        <div ref={cardsRef} className="space-y-4">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <SwipeableContainer
                key={card.id}
                data-card
                onSwipeLeft={() => card.action?.()}
                onSwipeRight={() => card.action?.()}
              >
                <MobileCardLayout 
                  animationDelay={index * 0.1}
                  className="group hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${card.color}20` }}
                    >
                      <Icon 
                        className="h-6 w-6" 
                        style={{ color: card.color }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {card.description}
                      </p>
                      
                      {card.progress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{card.progress}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{ 
                                width: `${card.progress}%`,
                                background: `linear-gradient(90deg, ${card.color}, ${card.color}aa)`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </MobileCardLayout>
              </SwipeableContainer>
            );
          })}
        </div>

        {/* Quick actions */}
        <MobileCardLayout>
          <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              className="h-16 flex-col gap-2 hover:bg-primary/10"
              onClick={onAddAction}
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Add Goal</span>
            </Button>
            <Button
              variant="ghost"
              className="h-16 flex-col gap-2 hover:bg-secondary/10"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Connect</span>
            </Button>
            <Button
              variant="ghost"
              className="h-16 flex-col gap-2 hover:bg-accent"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs">Learn</span>
            </Button>
            <Button
              variant="ghost"
              className="h-16 flex-col gap-2 hover:bg-muted"
            >
              <Target className="h-5 w-5" />
              <span className="text-xs">Track</span>
            </Button>
          </div>
        </MobileCardLayout>
      </div>

      {/* Bottom spacing */}
      <div className="h-24" />
    </div>
  );
}