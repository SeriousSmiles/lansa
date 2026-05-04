import { ReactNode, RefObject } from "react";
import { PortalPageShell } from "@/components/dashboard/portal/PortalPageShell";
import { ProfileHeaderActions } from "../ProfileHeaderActions";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";

interface ProfilePortalLayoutProps {
  children: ReactNode;
  userName: string;
  role: string;
  user: any;
  userId?: string;
  coverColor: string;
  highlightColor?: string;
  onCoverColorChange: (color: string) => Promise<void>;
  onHighlightColorChange?: (color: string) => Promise<void>;
  mainContentRef: RefObject<HTMLDivElement>;
  onOpenGuidedSetup?: () => void;
  userProfile?: any;
  currentPalette?: string;
  activePalette?: any;
  onPaletteChange?: (paletteId: string) => Promise<void>;
  onModeToggle?: () => Promise<void>;
}

/**
 * Portal v2 wrapper for the profile editor page.
 * Reuses the shared PortalPageShell (rail + canvas + context drawer)
 * and embeds the existing ProfileHeaderActions menu (palette, share,
 * settings, guided setup) into the Portal title row so every editing
 * capability remains one click away.
 */
export function ProfilePortalLayout({
  children,
  userName,
  userId,
  coverColor,
  highlightColor = "#FF6B4A",
  onCoverColorChange,
  onHighlightColorChange,
  mainContentRef,
  onOpenGuidedSetup,
  userProfile,
  currentPalette,
  activePalette,
  onPaletteChange,
  onModeToggle,
}: ProfilePortalLayoutProps) {
  const firstName = userName?.split(" ")[0] || "your";

  return (
    <PortalPageShell
      eyebrow="Workspace"
      title={
        <>
          <span className="font-extralight">{firstName}'s </span>
          <span className="font-black italic">profile</span>
        </>
      }
      subtitle="Reflect on your story and shape how employers see you. Edits save automatically."
      actions={
        <ProfileHeaderActions
          userId={userId}
          userName={userName}
          coverColor={coverColor}
          highlightColor={highlightColor}
          onCoverColorChange={onCoverColorChange}
          onHighlightColorChange={onHighlightColorChange}
          textColor="hsl(var(--foreground))"
          isDarkTheme={false}
          isMobile={false}
          onOpenGuidedSetup={onOpenGuidedSetup}
          userProfile={userProfile}
          currentPalette={currentPalette}
          activePalette={activePalette}
          onPaletteChange={onPaletteChange}
          onModeToggle={onModeToggle}
        />
      }
    >
      <AnnouncementBanner />
      {/* No ref={mainContentRef} here — Portal v2 skips the gsap fade-in
          to keep the page render instant and prevent flicker. */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mt-2">
        {children}
      </main>
    </PortalPageShell>
  );
}