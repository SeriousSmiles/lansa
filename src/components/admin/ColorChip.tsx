import { COLOR_CONFIG, UserColor } from '@/utils/adminColors';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ColorChipProps {
  color: UserColor;
  showLabel?: boolean;
}

export function ColorChip({ color, showLabel = true }: ColorChipProps) {
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
