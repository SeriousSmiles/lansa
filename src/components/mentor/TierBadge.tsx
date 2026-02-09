import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap } from "lucide-react";
import type { SubscriptionTier } from "@/hooks/useMentorSubscription";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: SubscriptionTier;
  className?: string;
}

const tierStyles = {
  free: {
    icon: Zap,
    label: "Free",
    className: "bg-muted text-muted-foreground border-border",
  },
  starter: {
    icon: Star,
    label: "Starter",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  pro: {
    icon: Crown,
    label: "Pro",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = tierStyles[tier];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1", config.className, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
