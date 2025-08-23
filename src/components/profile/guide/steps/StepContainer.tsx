import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface StepContainerProps {
  title: string;
  description: string;
  children: ReactNode;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  isCompleted?: boolean;
}

export function StepContainer({
  title,
  description,
  children,
  isCompleted = false
}: StepContainerProps) {
  return (
    <div className="space-y-6">
      {/* Header with Visual Hierarchy */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{description}</p>
            )}
          </div>
          {isCompleted && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 px-3 py-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
            </Badge>
          )}
        </div>
        <div className="h-px bg-gradient-to-r from-border via-border/50 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}