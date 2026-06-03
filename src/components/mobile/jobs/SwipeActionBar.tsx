import { Button } from "@/components/ui/button";
import { X, Heart, RotateCcw, Info } from "lucide-react";

interface SwipeActionBarProps {
  onPass: () => void;
  onInterested: () => void;
  onUndo?: () => void;
  onDetails?: () => void;
  disabled?: boolean;
}

export function SwipeActionBar({ onPass, onInterested, onUndo, onDetails, disabled }: SwipeActionBarProps) {
  return (
    <div className="flex items-center justify-center gap-4 pt-4 pb-2">
      <Button
        size="icon"
        variant="outline"
        disabled={disabled || !onUndo}
        onClick={onUndo}
        aria-label="Undo last swipe"
        className="h-11 w-11 rounded-full border-border"
      >
        <RotateCcw className="w-4 h-4 text-muted-foreground" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        disabled={disabled}
        onClick={onPass}
        aria-label="Pass"
        className="h-14 w-14 rounded-full border-2 border-rose-500/40 hover:bg-rose-500/10"
      >
        <X className="w-6 h-6 text-rose-500" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        disabled={disabled || !onDetails}
        onClick={onDetails}
        aria-label="View details"
        className="h-11 w-11 rounded-full border-border"
      >
        <Info className="w-4 h-4 text-foreground/70" />
      </Button>
      <Button
        size="icon"
        disabled={disabled}
        onClick={onInterested}
        aria-label="Interested"
        className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white"
      >
        <Heart className="w-6 h-6 fill-white" />
      </Button>
    </div>
  );
}