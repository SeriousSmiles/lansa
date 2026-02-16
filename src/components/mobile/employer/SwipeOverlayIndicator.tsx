import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeOverlayIndicatorProps {
  direction: 'left' | 'right' | null;
  progress: number; // 0 to 1
}

export function SwipeOverlayIndicator({ direction, progress }: SwipeOverlayIndicatorProps) {
  if (!direction || progress < 0.05) return null;

  const isRight = direction === 'right';
  const opacity = Math.min(progress * 1.5, 1);
  const scale = 0.6 + progress * 0.4;

  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center rounded-2xl overflow-hidden"
      style={{ opacity }}
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          "absolute inset-0",
          isRight
            ? "bg-gradient-to-l from-primary/30 to-transparent"
            : "bg-gradient-to-r from-destructive/30 to-transparent"
        )}
      />

      {/* Label */}
      <div
        className={cn(
          "absolute top-8 px-6 py-3 rounded-xl border-4 font-black text-2xl tracking-wider",
          isRight
            ? "right-4 border-primary text-primary rotate-[-15deg]"
            : "left-4 border-destructive text-destructive rotate-[15deg]"
        )}
        style={{ transform: `scale(${scale}) rotate(${isRight ? -15 : 15}deg)` }}
      >
        <div className="flex items-center gap-2">
          {isRight ? (
            <>
              <Heart className="w-6 h-6 fill-current" />
              LIKE
            </>
          ) : (
            <>
              <X className="w-6 h-6" />
              PASS
            </>
          )}
        </div>
      </div>
    </div>
  );
}
