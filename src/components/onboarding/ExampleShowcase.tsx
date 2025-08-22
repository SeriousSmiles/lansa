import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, X, Check, Lightbulb } from "lucide-react";

interface Example {
  before: string;
  after: string;
  category?: string;
}

interface ExampleShowcaseProps {
  examples: Example[];
  title?: string;
  description?: string;
}

export function ExampleShowcase({ 
  examples, 
  title = "Transform your skills", 
  description = "See how students turn generic skills into business value" 
}: ExampleShowcaseProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-primary/20 text-primary hover:bg-primary/5 transition-all duration-200"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          {isOpen ? "Hide examples" : "💡 See examples"}
          {isOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4 mt-4">
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex flex-col items-start gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-foreground">{title}</h4>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          
          <div className="space-y-3">
            {examples.map((example, index) => (
              <div key={index} className="bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg border">
                {example.category && (
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {example.category}
                  </Badge>
                )}
                <div className="space-y-2">
                  <div className="flex flex-col items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Generic (doesn't show value)</div>
                        <div className="text-sm text-red-600 dark:text-red-400">"{example.before}"</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Value-focused (shows business impact)</div>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">"{example.after}"</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}