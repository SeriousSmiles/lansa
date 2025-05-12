
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ProfileActionButtonProps {
  onClick: () => void;
  textColor: string;
  coverColor: string;
  isDarkTheme: boolean;
  children: ReactNode;
}

export function ProfileActionButton({
  onClick,
  textColor,
  coverColor,
  isDarkTheme,
  children
}: ProfileActionButtonProps) {
  return (
    <Button 
      variant={isDarkTheme ? "contrast" : "outline"}
      size="sm" 
      onClick={onClick}
      className="flex items-center gap-1"
      style={{
        borderColor: `${coverColor}50`,
        color: textColor
      }}
    >
      {children}
    </Button>
  );
}
