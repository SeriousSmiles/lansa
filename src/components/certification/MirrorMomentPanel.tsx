import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";

interface MirrorMomentPanelProps {
  mirrorText: string;
  onNext: () => void;
  isLastQuestion: boolean;
}

export default function MirrorMomentPanel({ mirrorText, onNext, isLastQuestion }: MirrorMomentPanelProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Shimmer animation on entry
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
      );
    }

    // Typing effect simulation
    if (textRef.current) {
      gsap.fromTo(textRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, delay: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 px-4">
      <Card 
        ref={cardRef}
        className="max-w-2xl w-full p-8 md:p-12 relative overflow-hidden"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
        
        <div className="relative z-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Sparkles className="h-16 w-16 text-primary animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🪞 Mirror Moment
          </h2>

          {/* Mirror Text */}
          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <p ref={textRef} className="text-lg leading-relaxed text-foreground">
              {mirrorText}
            </p>
          </div>

          {/* Next Button */}
          <Button
            onClick={onNext}
            className="w-full"
            size="lg"
          >
            {isLastQuestion ? 'View Results' : 'Next Question'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
