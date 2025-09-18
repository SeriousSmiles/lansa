import React from 'react';
import { MapPin, DollarSign, Clock, Heart, Share, BookmarkPlus } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OpportunityCardProps {
  title: string;
  company: string;
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  type: string;
  fitScore?: number;
  isRemote?: boolean;
  postedDate: string;
  onApply: () => void;
  onSave: () => void;
  onShare: () => void;
  isSaved?: boolean;
}

export function OpportunityCard({
  title,
  company,
  location,
  salary,
  type,
  fitScore,
  isRemote = false,
  postedDate,
  onApply,
  onSave,
  onShare,
  isSaved = false
}: OpportunityCardProps) {
  const formatSalary = () => {
    if (!salary) return null;
    
    return `${salary.currency}${salary.min.toLocaleString()}-${salary.max.toLocaleString()}`;
  };

  const getFitScoreColor = () => {
    if (!fitScore) return 'bg-muted';
    if (fitScore >= 80) return 'bg-success';
    if (fitScore >= 60) return 'bg-warning';
    return 'bg-muted';
  };

  return (
    <BaseCard className="relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-urbanist font-semibold text-base text-foreground truncate">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{company}</p>
        </div>
        
        {/* Fit Score */}
        {fitScore && (
          <Badge 
            variant="secondary"
            className={`ml-2 ${getFitScoreColor()} text-white`}
          >
            {fitScore}% fit
          </Badge>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{isRemote ? 'Remote' : location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{postedDate}</span>
          </div>
        </div>
        
        {salary && (
          <div className="flex items-center gap-1 text-sm text-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">{formatSalary()}</span>
          </div>
        )}
        
        <Badge variant="outline" className="w-fit">
          {type}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button 
          onClick={onApply}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          size="sm"
        >
          Quick Apply
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSave}
          className="touch-target p-2"
        >
          <BookmarkPlus className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onShare}
          className="touch-target p-2"
        >
          <Share className="h-4 w-4" />
        </Button>
      </div>
    </BaseCard>
  );
}