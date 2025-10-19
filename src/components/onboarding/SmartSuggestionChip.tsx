import React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SmartSuggestionChipProps {
  suggestion: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline';
}

export function SmartSuggestionChip({ 
  suggestion, 
  onClick,
  variant = 'secondary'
}: SmartSuggestionChipProps) {
  return (
    <Badge
      variant={variant}
      className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-all duration-200 py-1.5 px-3 text-sm font-normal"
      onClick={onClick}
    >
      <Sparkles className="h-3 w-3 mr-1.5" />
      {suggestion}
    </Badge>
  );
}
