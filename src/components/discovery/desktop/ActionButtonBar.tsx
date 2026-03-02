import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Zap, Heart } from 'lucide-react';
import { SwipeDirection } from '@/services/swipeService';
import { candidatePanelAnimations } from '@/utils/candidatePanelAnimations';

interface ActionButtonBarProps {
  onAction: (direction: SwipeDirection) => void;
  disabled?: boolean;
}

export function ActionButtonBar({ onAction, disabled }: ActionButtonBarProps) {
  const passRef = useRef<HTMLButtonElement>(null);
  const nudgeRef = useRef<HTMLButtonElement>(null);
  const likeRef = useRef<HTMLButtonElement>(null);

  const handleAction = (direction: SwipeDirection, buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (disabled) return;
    if (buttonRef.current) {
      candidatePanelAnimations.buttonPress(buttonRef.current);
    }
    setTimeout(() => {
      onAction(direction);
    }, 100);
  };

  return (
    <div className="flex-shrink-0 bg-background border-t border-border shadow-[0_-4px_16px_hsl(var(--foreground)/0.06)]">
      <div className="flex items-center justify-center gap-4 px-8 py-4 max-w-2xl mx-auto">
        {/* Pass */}
        <Button
          ref={passRef}
          variant="outline"
          size="lg"
          className="flex-1 max-w-[180px] h-12 border-2 border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive transition-all duration-200 font-medium"
          onClick={() => handleAction('left', passRef)}
          disabled={disabled}
        >
          <X className="w-4 h-4 mr-2" />
          Pass
        </Button>

        {/* Super Interest */}
        <Button
          ref={nudgeRef}
          size="lg"
          className="flex-1 max-w-[200px] h-12 bg-amber-500 hover:bg-amber-600 text-white transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
          onClick={() => handleAction('nudge', nudgeRef)}
          disabled={disabled}
        >
          <Zap className="w-4 h-4 mr-2" />
          Super Interest
        </Button>

        {/* Interested */}
        <Button
          ref={likeRef}
          size="lg"
          className="flex-1 max-w-[180px] h-12 bg-green-600 hover:bg-green-700 text-white transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          onClick={() => handleAction('right', likeRef)}
          disabled={disabled}
        >
          <Heart className="w-4 h-4 mr-2" />
          Interested
        </Button>
      </div>
    </div>
  );
}
