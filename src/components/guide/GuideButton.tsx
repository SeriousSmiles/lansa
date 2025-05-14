
import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

interface GuideButtonProps {
  onClick: () => void;
  className?: string;
}

export function GuideButton({ onClick, className }: GuideButtonProps) {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <Button 
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "fixed bottom-6 right-6 rounded-full p-0 w-14 h-14 shadow-lg z-50 transition-all duration-300",
        isHovering ? "bg-[#FF6B4A] scale-110" : "bg-[#FF8F6B]",
        className
      )}
    >
      <HelpCircle className="w-6 h-6 text-white" />
    </Button>
  );
}
