
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface AnimatedProfileButtonProps {
  userName: string;
  email: string;
  handleLogout: () => Promise<void>;
}

export function AnimatedProfileButton({ userName, email, handleLogout }: AnimatedProfileButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buttonRef.current || !glowRef.current) return;

    // Create the pulsing glow animation
    const glowAnimation = gsap.timeline({ repeat: -1, yoyo: true });
    
    glowAnimation
      .to(glowRef.current, {
        scale: 1.1,
        opacity: 0.8,
        duration: 2,
        ease: "power2.inOut"
      })
      .to(glowRef.current, {
        scale: 1,
        opacity: 0.4,
        duration: 2,
        ease: "power2.inOut"
      });

    // Hover effects
    const handleMouseEnter = () => {
      gsap.to(glowRef.current, {
        scale: 1.2,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(glowRef.current, {
        scale: 1.05,
        opacity: 0.6,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const buttonElement = buttonRef.current;
    buttonElement.addEventListener('mouseenter', handleMouseEnter);
    buttonElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      glowAnimation.kill();
      buttonElement.removeEventListener('mouseenter', handleMouseEnter);
      buttonElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid grid-cols-[max-content_1fr] items-center gap-3">
        <div 
          ref={buttonRef}
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-white font-bold cursor-pointer"
        >
          {/* Animated glow background */}
          <div 
            ref={glowRef}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B4A] to-[#1A1F71] opacity-40"
            style={{
              filter: 'blur(8px)',
              transform: 'scale(1.05)'
            }}
          />
          
          {/* Main avatar */}
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6B4A] to-[#1A1F71] flex items-center justify-center text-white font-bold z-10">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-8 w-8 text-[#1A1F71] hover:text-[#FF6B4A] transition-colors duration-200"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to="/profile" className="hover:bg-[#FF6B4A]/10 hover:text-[#FF6B4A] transition-colors">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="hover:bg-[#FF6B4A]/10 hover:text-[#FF6B4A] transition-colors">
                Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="hover:bg-[#1A1F71]/10 hover:text-[#1A1F71] transition-colors"
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
