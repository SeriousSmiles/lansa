import React, { useRef, useEffect } from "react";
import { MobileCardLayout } from "./MobileCardLayout";
import { MobileActionSheet } from "./MobileActionSheet";
import { SwipeableContainer } from "./SwipeableContainer";
import { Camera, Edit3, Share2, Settings, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { useState } from "react";

interface MobileProfileLayoutProps {
  userName?: string;
  userTitle?: string;
  avatarUrl?: string;
  coverColor: string;
  highlightColor: string;
  children: React.ReactNode;
  onEditPhoto?: () => void;
  onEditProfile?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
}

export function MobileProfileLayout({
  userName,
  userTitle,
  avatarUrl,
  coverColor,
  highlightColor,
  children,
  onEditPhoto,
  onEditProfile,
  onShare,
  onDownload
}: MobileProfileLayoutProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  useEffect(() => {
    // Animate header entrance
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
      );
    }

    // Animate avatar with delay
    if (avatarRef.current) {
      gsap.fromTo(avatarRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 1, delay: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, []);

  const handleQuickAction = (action: string) => {
    setActionSheetOpen(false);
    
    switch (action) {
      case 'edit':
        onEditProfile?.();
        break;
      case 'share':
        onShare?.();
        break;
      case 'download':
        onDownload?.();
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background md:hidden">
      {/* Header with cover background */}
      <div 
        ref={headerRef}
        className="relative h-64 overflow-hidden mobile-safe-top"
        style={{
          background: `linear-gradient(135deg, ${coverColor}, ${highlightColor})`,
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        
        {/* Header actions */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            onClick={() => setActionSheetOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Profile avatar */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div 
            ref={avatarRef}
            className="relative"
          >
            <div className="h-24 w-24 rounded-full bg-white p-1 shadow-xl">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={userName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">
                  {userName?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              onClick={onEditPhoto}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-16 px-4">
        <MobileCardLayout className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2 font-inter">
            {userName || "Your Name"}
          </h1>
          <p className="text-muted-foreground mb-4">
            {userTitle || "Add your professional title"}
          </p>
          
          {/* Quick actions */}
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 max-w-32"
              onClick={onEditProfile}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 max-w-32"
              onClick={onShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </MobileCardLayout>

        {/* Content */}
        <SwipeableContainer className="space-y-4">
          {children}
        </SwipeableContainer>
      </div>

      {/* Action Sheet */}
      <MobileActionSheet
        isOpen={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        title="Profile Actions"
      >
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start h-12 text-left"
            onClick={() => handleQuickAction('edit')}
          >
            <Edit3 className="h-5 w-5 mr-3" />
            Edit Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-12 text-left"
            onClick={() => handleQuickAction('share')}
          >
            <Share2 className="h-5 w-5 mr-3" />
            Share Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-12 text-left"
            onClick={() => handleQuickAction('download')}
          >
            <Download className="h-5 w-5 mr-3" />
            Download Resume
          </Button>
        </div>
      </MobileActionSheet>

      {/* Bottom spacing for navigation */}
      <div className="h-24" />
    </div>
  );
}