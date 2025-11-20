import { COLOR_CONFIG, UserColor } from '@/utils/adminColors';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ColorChipProps {
  color: UserColor | null;
  showLabel?: boolean;
}

export function ColorChip({ color, showLabel = true }: ColorChipProps) {
  // Handle null color - show "Unassigned" state
  if (!color) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted text-muted-foreground border-border">
              <span className="text-lg" aria-hidden="true">○</span>
              {showLabel && <span className="text-sm font-medium">Unassigned</span>}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Unassigned</p>
            <p className="text-sm text-muted-foreground">No color segment assigned yet</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const config = COLOR_CONFIG[color];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bgClass} ${config.textClass} ${config.borderClass}`}>
            <span className="text-lg" aria-hidden="true">{config.pattern}</span>
            {showLabel && <span className="text-sm font-medium">{config.label}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{config.label}</p>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
