import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status?: 'pending' | 'active' | 'completed';
  tags?: string[];
  children?: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export function ActionCard({ 
  title, 
  description, 
  icon: Icon,
  status = 'pending',
  tags = [],
  children,
  onAction,
  actionLabel = "Continue",
  className
}: ActionCardProps) {
  const statusConfig = {
    pending: {
      cardClass: "border-muted-foreground/20 bg-muted/5",
      iconClass: "text-foreground bg-muted/30 border border-muted",
      badgeClass: "bg-muted/30 text-foreground border border-muted"
    },
    active: {
      cardClass: "border-primary/30 bg-primary/5 shadow-lg",
      iconClass: "text-primary bg-primary/10",
      badgeClass: "bg-primary/10 text-primary"
    },
    completed: {
      cardClass: "border-green-300 bg-green-50 dark:bg-green-950/20",
      iconClass: "text-green-600 bg-green-100 dark:bg-green-900",
      badgeClass: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    }
  };

  const config = statusConfig[status];

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md", 
      config.cardClass,
      className
    )}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className={cn(
            "p-2 rounded-lg",
            config.iconClass
          )}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">{description}</p>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {children && (
              <div className="mt-4">
                {children}
              </div>
            )}
            
            {onAction && status === 'active' && (
              <Button 
                onClick={onAction} 
                size="sm"
                className="mt-3"
              >
                {actionLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}