
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileActionButtonProps {
  onClick: () => void;
  textColor: string;
  coverColor: string;
  isDarkTheme: boolean;
  children: ReactNode;
  className?: string; // Added className as an optional prop
}

export function ProfileActionButton({
  onClick,
  textColor,
  coverColor,
  isDarkTheme,
  children,
  className
}: ProfileActionButtonProps) {
  return (
    <Button 
      variant={isDarkTheme ? "contrast" : "outline"}
      size="sm" 
      onClick={onClick}
      className={cn("flex items-center gap-1", className)} // Use the cn utility to merge classNames
      style={{
        borderColor: `${coverColor}50`,
        color: textColor
      }}
    >
      {children}
    </Button>
  );
}
