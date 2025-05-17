
import { ReactNode, useRef } from "react";
import { ProfileHeader } from "../ProfileHeader";
import { getContrastTextColor, generateThemeColors } from "@/utils/colorUtils";

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
  mainContentRef
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
      <ProfileHeader 
        userName={userName} 
        role={role} 
        user={user}
        userId={userId}
        coverColor={coverColor}
        highlightColor={highlightColor}
        onCoverColorChange={onCoverColorChange}
        onHighlightColorChange={onHighlightColorChange}
      />

      <main ref={mainContentRef} className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {children}
        </div>
      </main>
    </div>
  );
}
