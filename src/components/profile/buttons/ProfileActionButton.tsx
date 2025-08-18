
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
      className={cn("flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center", className)} // Use the cn utility to merge classNames
      style={{
        borderColor: `${coverColor}50`,
        color: textColor
      }}
    >
      {children}
    </Button>
  );
}
