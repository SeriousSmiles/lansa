import { Heart, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SwipeDirection } from '@/services/swipeService';

export function CandidateActions({ onAction, disabled = false }: { onAction: (direction: SwipeDirection) => void; disabled?: boolean }) {
  return <div className="discovery-actions" aria-label="Candidate decisions">
    <Button variant="ghost" className="discovery-decision" disabled={disabled} onClick={() => onAction('left')}>
      <span className="discovery-decision-icon border border-border bg-card text-foreground"><X aria-hidden="true" size={25} /></span><span>Pass</span>
    </Button>
    <Button variant="ghost" className="discovery-decision" disabled={disabled} onClick={() => onAction('nudge')}>
      <span className="discovery-decision-icon border border-secondary/30 bg-secondary/10 text-secondary"><Zap aria-hidden="true" size={23} /></span><span>Nudge</span>
    </Button>
    <Button variant="ghost" className="discovery-decision text-primary" disabled={disabled} onClick={() => onAction('right')}>
      <span className="discovery-decision-icon bg-primary text-primary-foreground"><Heart aria-hidden="true" size={25} /></span><span>Interested</span>
    </Button>
  </div>;
}
