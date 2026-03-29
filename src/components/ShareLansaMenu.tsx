import React, { useState } from 'react';
import { Share2, Building2, Target, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { generateShareCard, type ShareVariant } from '@/components/ShareLansaCard';

const OPTIONS: { variant: ShareVariant; label: string; icon: React.ReactNode; desc: string }[] = [
  { variant: 'employer', label: 'For Employers', icon: <Building2 className="h-5 w-5" />, desc: 'Find the right talent, faster' },
  { variant: 'seeker', label: 'For Opportunity Seekers', icon: <Target className="h-5 w-5" />, desc: 'Get trained, certified & hired' },
  { variant: 'mentor', label: 'For Mentors & Coaches', icon: <GraduationCap className="h-5 w-5" />, desc: 'Grow your reach & student pool' },
];

export function ShareLansaMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState<ShareVariant | null>(null);

  const handleSelect = async (variant: ShareVariant) => {
    setGenerating(variant);
    try {
      await generateShareCard(variant);
    } finally {
      setGenerating(null);
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Lansa
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-urbanist text-lg">Share Lansa with...</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.variant}
              disabled={generating !== null}
              onClick={() => handleSelect(opt.variant)}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-accent transition-colors text-left disabled:opacity-50"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary shrink-0">
                {opt.icon}
              </div>
              <div className="min-w-0">
                <p className="font-urbanist font-semibold text-foreground text-sm">
                  {opt.label}
                  {generating === opt.variant && <span className="ml-2 text-muted-foreground text-xs">Generating...</span>}
                </p>
                <p className="text-muted-foreground text-xs">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
