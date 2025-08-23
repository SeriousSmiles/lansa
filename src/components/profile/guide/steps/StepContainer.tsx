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
    <div className="h-full flex flex-col">
      {/* Step Header */}
      <div className="px-6 py-4 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {isCompleted && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </div>

      {/* Step Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}