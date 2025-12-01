
import { DesktopProfileActions } from "./header-actions/DesktopProfileActions";
import { MobileProfileActions } from "./header-actions/MobileProfileActions";

interface ProfileHeaderActionsProps {
  userId?: string;
  userName?: string;
  coverColor: string;
  highlightColor: string;
  onCoverColorChange: (color: string) => Promise<void>;
  onHighlightColorChange?: (color: string) => Promise<void>;
  textColor: string;
  isDarkTheme: boolean;
  isMobile?: boolean;
  onActionComplete?: () => void;
  onOpenGuidedSetup?: () => void;
  userProfile?: any;
  // Palette system props
  currentPalette?: string;
  activePalette?: any;
  onPaletteChange?: (paletteId: string) => Promise<void>;
  onModeToggle?: () => Promise<void>;
}

export function ProfileHeaderActions({ 
  userId, 
  userName,
  coverColor, 
  highlightColor,
  onCoverColorChange, 
  onHighlightColorChange, 
  textColor,
  isDarkTheme,
  isMobile = false,
  onActionComplete,
  onOpenGuidedSetup,
  userProfile,
  currentPalette,
  activePalette,
  onPaletteChange,
  onModeToggle,
}: ProfileHeaderActionsProps) {
  // Use burger menu for all device sizes now
  return (
    <MobileProfileActions 
      userId={userId}
      userName={userName}
      coverColor={coverColor}
      highlightColor={highlightColor}
      onCoverColorChange={onCoverColorChange}
      onHighlightColorChange={onHighlightColorChange}
      onActionComplete={onActionComplete}
      onOpenGuidedSetup={onOpenGuidedSetup}
      userProfile={userProfile}
      currentPalette={currentPalette}
      activePalette={activePalette}
      onPaletteChange={onPaletteChange}
      onModeToggle={onModeToggle}
    />
  );
}
