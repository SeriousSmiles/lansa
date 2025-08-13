
import { ReactNode, useRef } from "react";
import { ProfileHeader } from "../ProfileHeader";
import { getContrastTextColor, generateThemeColors } from "@/utils/colorUtils";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";
interface ProfileLayoutProps {
  children: ReactNode;
  userName: string;
  role: string;
  user: any;
  userId?: string;
  coverColor: string;
  highlightColor?: string;
  onCoverColorChange: (color: string) => Promise<void>;
  onHighlightColorChange?: (color: string) => Promise<void>;
  mainContentRef: React.RefObject<HTMLDivElement>;
  readOnly?: boolean;
  hideBackButton?: boolean;
  onOpenGuidedSetup?: () => void;
}

export function ProfileLayout({ 
  children, 
  userName, 
  role, 
  user, 
  userId,
  coverColor, 
  highlightColor = "#FF6B4A",
  onCoverColorChange,
  onHighlightColorChange,
  mainContentRef,
  readOnly = false,
  hideBackButton = false,
  onOpenGuidedSetup
}: ProfileLayoutProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Generate theme colors based on primary color using our utility
  const themeColors = generateThemeColors(coverColor);
  
  return (
    <div 
      className="min-h-screen flex flex-col animate-fade-in"
      style={{ 
        backgroundColor: themeColors.light,
      }}
    >
      <AnnouncementBanner />
      <ProfileHeader 
        userName={userName} 
        role={role} 
        user={user}
        userId={userId}
        coverColor={coverColor}
        highlightColor={highlightColor}
        onCoverColorChange={onCoverColorChange}
        onHighlightColorChange={onHighlightColorChange}
        readOnly={readOnly}
        hideBackButton={hideBackButton}
        onOpenGuidedSetup={onOpenGuidedSetup}
      />

      <main ref={mainContentRef} className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {children}
        </div>
      </main>
    </div>
  );
}
