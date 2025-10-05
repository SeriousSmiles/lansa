import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase, User, Award } from "lucide-react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { DiscoveryProfile } from "@/services/discoveryService";

interface SwipeCardProps {
  profile: DiscoveryProfile;
  onSwipe: (direction: 'left' | 'right' | 'nudge') => void;
  isActive: boolean;
  zIndex: number;
}

export function SwipeCard({ profile, onSwipe, isActive, zIndex }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  const velocityRef = useRef({ x: 0, lastX: 0, lastTime: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  
  const updateVelocity = useCallback((clientX: number) => {
    const now = Date.now();
    const dt = now - velocityRef.current.lastTime || 1;
    velocityRef.current.x = (clientX - velocityRef.current.lastX) / dt;
    velocityRef.current.lastX = clientX;
    velocityRef.current.lastTime = now;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isActive || !cardRef.current) return;
    
    cardRef.current.setPointerCapture(e.pointerId);
    setIsDragging(true);
    
    // Initialize tracking
    velocityRef.current = { x: 0, lastX: e.clientX, lastTime: Date.now() };
    positionRef.current = { x: 0, y: 0 };
    
    gsap.killTweensOf(cardRef.current);
  }, [isActive]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !isActive || !cardRef.current) return;
    
    updateVelocity(e.clientX);
    
    positionRef.current.x += e.movementX;
    positionRef.current.y += e.movementY;
    
    const rotation = positionRef.current.x * 0.1;
    const opacity = Math.max(0.3, 1 - Math.abs(positionRef.current.x) / 300);
    
    gsap.set(cardRef.current, {
      x: positionRef.current.x,
      y: positionRef.current.y,
      rotation: rotation,
      opacity: opacity,
    });

    // Update swipe direction indicator
    if (Math.abs(positionRef.current.x) > 50) {
      setSwipeDirection(positionRef.current.x > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  }, [isDragging, isActive, updateVelocity]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !isActive || !cardRef.current) return;
    
    cardRef.current.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    setSwipeDirection(null);
    
    const { x } = positionRef.current;
    const { x: vx } = velocityRef.current;
    
    // Enhanced threshold logic: distance OR velocity
    const distance = Math.abs(x);
    const flick = Math.abs(vx) > 0.8; // Velocity threshold
    const passed = distance > 120 || flick;
    
    if (passed) {
      // Animate card off screen
      const direction = x < 0 ? 'left' : 'right';
      const exitX = x < 0 ? -window.innerWidth : window.innerWidth;
      const exitRotation = x < 0 ? -15 : 15;
      
      gsap.to(cardRef.current, {
        x: exitX,
        y: positionRef.current.y,
        rotation: exitRotation,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          if (cardRef.current) {
            gsap.set(cardRef.current, {
              x: 0,
              y: 0,
              rotation: 0,
              opacity: 1
            });
          }
          onSwipe(direction);
        }
      });
    } else {
      // Snap back to center
      gsap.to(cardRef.current, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: 0.25,
        ease: "back.out(1.4)"
      });
    }
    
    // Reset tracking values
    positionRef.current = { x: 0, y: 0 };
    velocityRef.current = { x: 0, lastX: 0, lastTime: 0 };
  }, [isDragging, isActive, onSwipe]);

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "absolute inset-0 select-none overflow-hidden will-change-transform",
        "bg-card border-border shadow-lg",
        "touch-none cursor-grab",
        isDragging && "cursor-grabbing",
        !isActive && "pointer-events-none"
      )}
      style={{ 
        zIndex,
        WebkitUserDrag: "none" as const,
        userSelect: "none" as const,
        touchAction: "none" as const,
        backgroundImage: profile.cover_color ? `linear-gradient(135deg, ${profile.cover_color}, ${profile.highlight_color || '#FF6B4A'})` : undefined
      } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Swipe indicators */}
      {swipeDirection && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center text-white text-6xl font-bold opacity-80 z-10",
          swipeDirection === 'right' ? "bg-green-500/20" : "bg-red-500/20"
        )}>
          {swipeDirection === 'right' ? '💚' : '❌'}
        </div>
      )}
      
      <CardContent className="p-0 h-full flex flex-col relative overflow-hidden">
        {/* Cover header with gradient */}
        <div 
          className="relative p-6 pb-16"
          style={{ 
            background: profile.cover_color 
              ? `linear-gradient(135deg, ${profile.cover_color}, ${profile.highlight_color || '#FF6B4A'})` 
              : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)))'
          }}
        >
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 ring-4 ring-white/30 shadow-lg">
              <AvatarImage src={profile.profile_image} alt={profile.name} />
              <AvatarFallback 
                style={{ backgroundColor: profile.highlight_color || '#FF6B4A' }}
                className="text-white text-xl font-semibold"
              >
                {profile.name?.charAt(0) || <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-white">
              <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
              <p className="text-white/90 text-lg mb-2">{profile.title}</p>
              {profile.professional_goal && (
                <p className="text-white/80 text-sm font-medium">{profile.professional_goal}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 bg-white relative -mt-8 rounded-t-3xl">
          {profile.about_text && (
            <div className="mb-6">
              <h4 className="font-semibold text-foreground mb-3 text-lg">About</h4>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                {profile.about_text}
              </p>
            </div>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-lg">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {profile.skills.slice(0, 8).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-secondary/10 text-secondary-foreground border-secondary/20 text-xs font-medium"
                    style={{ 
                      backgroundColor: `${profile.highlight_color || '#FF6B4A'}15`,
                      borderColor: `${profile.highlight_color || '#FF6B4A'}30`,
                      color: profile.highlight_color || '#FF6B4A'
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 8 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs border-muted"
                  >
                    +{profile.skills.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          {profile.achievements && profile.achievements.filter(a => a.isFeatured).length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${profile.highlight_color || '#FF6B4A'}20` }}
                >
                  <Award 
                    className="w-3.5 h-3.5" 
                    style={{ color: profile.highlight_color || '#FF6B4A' }}
                  />
                </div>
                Key Achievements
              </h4>
              <div className="space-y-2">
                {profile.achievements.filter(a => a.isFeatured).slice(0, 2).map((achievement, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-2 p-2 rounded-lg bg-background/50"
                  >
                    <div 
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: profile.highlight_color || '#FF6B4A' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">
                        {achievement.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}