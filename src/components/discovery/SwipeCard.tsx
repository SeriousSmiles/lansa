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
      setSwipeDirection(null);
      
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
          onComplete: () => onSwipe(direction)
        });
      } else {
        // Snap back to center
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
      
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-16 h-16 ring-2 ring-white/20">
            <AvatarImage src={profile.profile_image} alt={profile.name} />
            <AvatarFallback style={{ backgroundColor: profile.highlight_color }}>
              <User className="w-8 h-8 text-white" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-white">
            <h3 className="text-xl font-semibold">{profile.name}</h3>
            <p className="text-white/80 text-sm">{profile.title}</p>
          </div>
        </div>

        {profile.professional_goal && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-white/80" />
              <span className="text-sm font-medium text-white/80">Goal</span>
            </div>
            <p className="text-white text-sm">{profile.professional_goal}</p>
          </div>
        )}

        {profile.about_text && (
          <div className="mb-4 flex-1">
            <p className="text-white/90 text-sm line-clamp-4">{profile.about_text}</p>
          </div>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-white/80">Skills</span>
            <div className="flex flex-wrap gap-2">
              {profile.skills.slice(0, 6).map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-white/20 text-white border-white/30 text-xs"
                >
                  {skill}
                </Badge>
              ))}
              {profile.skills.length > 6 && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                  +{profile.skills.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}