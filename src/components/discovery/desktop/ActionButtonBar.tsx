import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Zap, Heart } from 'lucide-react';
import { SwipeDirection } from '@/services/swipeService';

interface ActionButtonBarProps {
  onAction: (direction: SwipeDirection) => void;
  disabled?: boolean;
}

export function ActionButtonBar({ onAction, disabled }: ActionButtonBarProps) {
  return (
    <div className="shrink-0 bg-background border-t border-border">
      <div className="flex items-center justify-center gap-3 px-6 py-3 max-w-xl mx-auto">
        {/* Pass */}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-10 border border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive transition-all duration-150 font-medium text-sm"
          onClick={() => onAction('left')}
          disabled={disabled}
        >
          <X className="w-4 h-4 mr-1.5" />
          Pass
        </Button>

        {/* Super Interest */}
        <Button
          size="sm"
          className="flex-1 max-w-[200px] h-10 bg-amber-500 hover:bg-amber-600 text-white transition-all duration-150 font-semibold text-sm shadow-sm"
          onClick={() => onAction('nudge')}
          disabled={disabled}
        >
          <Zap className="w-4 h-4 mr-1.5" />
          Super Interest
        </Button>

        {/* Interested */}
        <Button
          size="sm"
          className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white transition-all duration-150 font-medium text-sm shadow-sm"
          onClick={() => onAction('right')}
          disabled={disabled}
        >
          <Heart className="w-4 h-4 mr-1.5" />
          Interested
        </Button>
      </div>
    </div>
  );
}
