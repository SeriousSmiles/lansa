
import { ProfileActionsMenu } from "./ProfileActionsMenu";

interface DesktopProfileActionsProps {
  userId?: string;
  userName?: string;
  coverColor: string;
  highlightColor: string;
  textColor: string;
  isDarkTheme: boolean;
  onCoverColorChange: (color: string) => Promise<void>;
  onHighlightColorChange?: (color: string) => Promise<void>;
  onActionComplete?: () => void;
  onOpenGuidedSetup?: () => void;
  userProfile?: any; // Add profile data for preview
}

export function DesktopProfileActions({
  userId,
  userName,
  coverColor,
  highlightColor,
  textColor,
  isDarkTheme,
  onCoverColorChange,
  onHighlightColorChange,
  onActionComplete,
  onOpenGuidedSetup,
  userProfile
}: DesktopProfileActionsProps) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <ProfileActionsMenu
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
        userProfile={userProfile}
      />
    </div>
  );
}
