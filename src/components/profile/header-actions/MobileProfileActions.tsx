
import { ProfileActionsMenu } from "./ProfileActionsMenu";

interface MobileProfileActionsProps {
  userId?: string;
  userName?: string;
  coverColor: string;
  highlightColor: string;
  onCoverColorChange: (color: string) => Promise<void>;
  onHighlightColorChange?: (color: string) => Promise<void>;
  onActionComplete?: () => void;
  onOpenGuidedSetup?: () => void;
  userProfile?: any; // Add profile data for preview
}

export function MobileProfileActions({
  userId,
  userName,
  coverColor,
  highlightColor,
  onCoverColorChange,
  onHighlightColorChange,
  onActionComplete,
  onOpenGuidedSetup,
  userProfile
}: MobileProfileActionsProps) {
  return (
    <div className="flex flex-col w-full gap-3">
      <ProfileActionsMenu
        userId={userId}
        userName={userName}
        coverColor={coverColor}
        highlightColor={highlightColor}
        textColor="currentColor"
        isDarkTheme={false}
        onCoverColorChange={onCoverColorChange}
        onHighlightColorChange={onHighlightColorChange}
        onActionComplete={onActionComplete}
        onOpenGuidedSetup={onOpenGuidedSetup}
        userProfile={userProfile}
      />
    </div>
  );
}
