import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CollapsibleAnalysisCardProps {
  title: string;
  icon: string;
  isDefaultOpen?: boolean;
  children: React.ReactNode;
  variant?: 'good' | 'concerning' | 'bad' | 'neutral';
}

export function CollapsibleAnalysisCard({ 
  title, 
  icon, 
  isDefaultOpen = false, 
  children,
  variant = 'neutral'
}: CollapsibleAnalysisCardProps) {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  const variantStyles = {
    good: 'border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10',
    concerning: 'border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50/50 to-amber-50/30 dark:from-yellow-950/20 dark:to-amber-950/10',
    bad: 'border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50/50 to-rose-50/30 dark:from-red-950/20 dark:to-rose-950/10',
    neutral: 'border-lansa-muted/20 bg-card'
  };

  return (
    <Card className={`w-full border-2 hover:shadow-md transition-shadow duration-200 ${variantStyles[variant]}`}>
      <CardHeader className="pb-2">
        <Button
          variant="ghost"
          className="w-full justify-between p-0 h-auto hover:bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{icon}</span>
            <h3 className="text-base font-semibold text-foreground text-left">
              {title}
            </h3>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0 animate-accordion-down">
          {children}
        </CardContent>
      )}
    </Card>
  );
}