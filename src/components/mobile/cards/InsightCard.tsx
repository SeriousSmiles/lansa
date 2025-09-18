import React from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InsightCardProps {
  title: string;
  value: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  description?: string;
  cta?: {
    label: string;
    action: () => void;
  };
  badge?: string;
  isNew?: boolean;
}

export function InsightCard({ 
  title, 
  value, 
  change, 
  description, 
  cta, 
  badge,
  isNew = false 
}: InsightCardProps) {
  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!change) return 'text-muted-foreground';
    
    switch (change.type) {
      case 'increase':
        return 'text-success';
      case 'decrease':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <BaseCard 
      variant={isNew ? "highlighted" : "default"}
      onClick={cta?.action}
      className="relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-urbanist font-semibold text-base text-foreground">
            {title}
          </h3>
          {isNew && <Sparkles className="h-4 w-4 text-primary" />}
        </div>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className="text-2xl font-urbanist font-bold text-foreground">
          {value}
        </span>
      </div>

      {/* Trend */}
      {change && (
        <div className="flex items-center gap-1 mb-3">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {change.value > 0 ? '+' : ''}{change.value}% {change.period}
          </span>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {/* CTA */}
      {cta && (
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full justify-start p-0 h-auto text-primary hover:text-primary/80"
        >
          {cta.label} →
        </Button>
      )}

      {/* New indicator */}
      {isNew && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full m-3" />
      )}
    </BaseCard>
  );
}