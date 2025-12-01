import { DesktopProfileActions } from "./DesktopProfileActions";

interface ProfileActionsMenuProps {
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
  userProfile?: any;
  // Palette system props
  currentPalette?: string;
  activePalette?: any;
  onPaletteChange?: (paletteId: string) => Promise<void>;
  onModeToggle?: () => Promise<void>;
}

export function ProfileActionsMenu(props: ProfileActionsMenuProps) {
  return <DesktopProfileActions {...props} />;
}