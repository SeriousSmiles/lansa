import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIEnhanceButtonProps {
  onEnhance: () => Promise<void>;
  className?: string;
  highlightColor?: string;
  variant?: "default" | "small";
}

export function AIEnhanceButton({ 
  onEnhance, 
  className,
  highlightColor = "#FF6B4A",
  variant = "default"
}: AIEnhanceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await onEnhance();
    } catch (error) {
      console.error("AI enhancement failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={variant === "small" ? "sm" : "default"}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "gap-1.5 transition-all duration-200 hover:shadow-sm",
        variant === "small" ? "h-8 px-2 text-xs" : "h-9 px-3 text-sm",
        className
      )}
      style={{ 
        color: highlightColor,
        backgroundColor: isLoading ? `${highlightColor}10` : "transparent"
      }}
    >
      {isLoading ? (
        <Loader2 className={cn("animate-spin", variant === "small" ? "h-3 w-3" : "h-4 w-4")} />
      ) : (
        <Brain className={cn(variant === "small" ? "h-3 w-3" : "h-4 w-4")} />
      )}
      {variant === "default" ? "AI Suggest" : "AI"}
    </Button>
  );
}