import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CollapsibleAnalysisCardProps {
  title: string;
  icon: string;
  isDefaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleAnalysisCard({ 
  title, 
  icon, 
  isDefaultOpen = false, 
  children 
}: CollapsibleAnalysisCardProps) {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  return (
    <Card className="w-full border-2 border-lansa-muted/20 bg-card hover:shadow-md transition-shadow duration-200">
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