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
    
    // Animate button press
    if (buttonRef.current) {
      candidatePanelAnimations.buttonPress(buttonRef.current);
    }

    // Trigger action after animation
    setTimeout(() => {
      onAction(direction);
    }, 100);
  };

  return (
    <div className="bg-background border-t border-border shadow-lg">
      <div className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-center gap-6 max-w-2xl mx-auto">
          {/* Pass Button */}
          <Button
            ref={passRef}
            variant="outline"
            size="lg"
            className="flex-1 max-w-[200px] h-14 border-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleAction('left', passRef)}
            disabled={disabled}
          >
            <X className="w-5 h-5 mr-2" />
            Pass
          </Button>

          {/* Super Interest Button */}
          <Button
            ref={nudgeRef}
            size="lg"
            className="flex-1 max-w-[220px] h-14 bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() => handleAction('nudge', nudgeRef)}
            disabled={disabled}
          >
            <Zap className="w-5 h-5 mr-2" />
            Super Interest
          </Button>

          {/* Interested Button */}
          <Button
            ref={likeRef}
            size="lg"
            className="flex-1 max-w-[200px] h-14 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleAction('right', likeRef)}
            disabled={disabled}
          >
            <Heart className="w-5 h-5 mr-2" />
            Interested
          </Button>
        </div>
      </div>
    </div>
  );
}
