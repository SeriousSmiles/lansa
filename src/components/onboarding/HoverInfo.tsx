import { useState } from "react";
import { Info, HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface HoverInfoProps {
  title: string;
  content: string;
  examples?: Array<{
    label: string;
    value: string;
  }>;
  variant?: 'info' | 'help';
}

export function HoverInfo({ title, content, examples = [], variant = 'info' }: HoverInfoProps) {
  const [open, setOpen] = useState(false);
  
  const Icon = variant === 'help' ? HelpCircle : Info;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="top" align="start">
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground">{content}</p>
          
          {examples.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-foreground">Examples:</h5>
              {examples.map((example, index) => (
                <div key={index} className="bg-muted/50 p-2 rounded text-xs">
                  <div className="font-medium text-foreground">{example.label}:</div>
                  <div className="text-muted-foreground">{example.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}