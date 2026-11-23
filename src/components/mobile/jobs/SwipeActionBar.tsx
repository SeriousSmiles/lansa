import { X, Bookmark, RotateCcw, Info } from "lucide-react";

interface SwipeActionBarProps {
  onPass: () => void;
  /** Swiping right / tapping Save keeps the job in Saved; applying happens from the job details. */
  onInterested: () => void;
  onUndo?: () => void;
  onDetails?: () => void;
  disabled?: boolean;
}

/** Labeled button alternatives to swipe gestures: Undo, Pass, Details, Save. */
export function SwipeActionBar({ onPass, onInterested, onUndo, onDetails, disabled }: SwipeActionBarProps) {
  return (
    <div className="sk-deck-actions flex-shrink-0" role="group" aria-label="Job actions">
      <button type="button" className="sk-deck-btn is-sm" disabled={disabled || !onUndo} onClick={onUndo} aria-label="Undo last pass or save">
        <span><RotateCcw size={18} /></span><span>Undo</span>
      </button>
      <button type="button" className="sk-deck-btn is-lg" disabled={disabled} onClick={onPass} aria-label="Pass">
        <span><X size={26} /></span><span>Pass</span>
      </button>
      <button type="button" className="sk-deck-btn is-sm" disabled={disabled || !onDetails} onClick={onDetails} aria-label="Details and apply">
        <span><Info size={18} /></span><span>Details</span>
      </button>
      <button type="button" className="sk-deck-btn is-lg is-save" disabled={disabled} onClick={onInterested} aria-label="Save">
        <span><Bookmark size={24} /></span><span>Save</span>
      </button>
    </div>
  );
}
