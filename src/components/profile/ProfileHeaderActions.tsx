
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
  onActionComplete
}: ProfileHeaderActionsProps) {
  if (isMobile) {
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
      />
    );
  }

  return (
    <DesktopProfileActions
      userId={userId}
      userName={userName}
      coverColor={coverColor}
      highlightColor={highlightColor}
      textColor={textColor}
      isDarkTheme={isDarkTheme}
      onCoverColorChange={onCoverColorChange}
      onHighlightColorChange={onHighlightColorChange}
      onActionComplete={onActionComplete}
      onOpenGuidedSetup={onOpenGuidedSetup}
    />
  );
}
