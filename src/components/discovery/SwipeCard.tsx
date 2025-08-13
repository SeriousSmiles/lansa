import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase, User } from "lucide-react";
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
  
  const startX = useRef(0);
  const currentX = useRef(0);
  const currentRotation = useRef(0);

  useEffect(() => {
    if (!cardRef.current || !isActive) return;

    const card = cardRef.current;
    let animation: gsap.core.Tween;

    const handleStart = (clientX: number) => {
      if (!isActive) return;
      setIsDragging(true);
      startX.current = clientX;
      gsap.killTweensOf(card);
    };

    const handleMove = (clientX: number) => {
      if (!isDragging || !isActive) return;
      
      const deltaX = clientX - startX.current;
      const rotation = deltaX * 0.1;
      const opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 300);
      
      currentX.current = deltaX;
      currentRotation.current = rotation;
      
      gsap.set(card, {
        x: deltaX,
        rotation: rotation,
        opacity: opacity,
      });

      // Update swipe direction indicator
      if (Math.abs(deltaX) > 50) {
        setSwipeDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        setSwipeDirection(null);
      }
    };

    const handleEnd = () => {
      if (!isDragging || !isActive) return;
      setIsDragging(false);
      
      const threshold = 120;
      const deltaX = currentX.current;
      
      if (Math.abs(deltaX) > threshold) {
        // Animate card off screen
        const direction = deltaX > 0 ? 'right' : 'left';
        const exitX = direction === 'right' ? window.innerWidth : -window.innerWidth;
        
        animation = gsap.to(card, {
          x: exitX,
          rotation: currentRotation.current * 2,
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            setSwipeDirection(null);
            onSwipe(direction);
          }
        });
      } else {
        // Snap back to center
        setSwipeDirection(null);
        animation = gsap.to(card, {
          x: 0,
          rotation: 0,
          opacity: 1,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      }
    };

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => handleStart(e.clientX);
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleMouseUp = () => handleEnd();

    // Touch events
    const handleTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    };
    const handleTouchEnd = () => handleEnd();

    card.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    card.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      card.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (animation) animation.kill();
    };
  }, [isActive, isDragging, onSwipe]);

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "absolute inset-0 cursor-grab select-none overflow-hidden",
        "bg-card border-border shadow-lg",
        isDragging && "cursor-grabbing",
        !isActive && "pointer-events-none"
      )}
      style={{ 
        zIndex,
        backgroundImage: profile.cover_color ? `linear-gradient(135deg, ${profile.cover_color}, ${profile.highlight_color || '#FF6B4A'})` : undefined
      }}
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
        </div>
      </CardContent>
    </Card>
  );
}