import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface WelcomeStripProps {
  userName: string;
  insight?: string;
  completeness?: number | null;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatToday(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function WelcomeStrip({ userName, insight, completeness }: WelcomeStripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const greeting = getGreeting();
  const firstName = (userName || "there").split(" ")[0];

  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll<HTMLElement>("[data-anim]");
    gsap.fromTo(
      els,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.08 }
    );
  }, []);

  return (
    <div ref={ref} className="pt-6 md:pt-10 pb-7 border-b border-border/30">
      <p
        data-anim
        className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium"
      >
        {formatToday()}
      </p>
      <h1
        data-anim
        className="mt-3 text-5xl md:text-7xl lg:text-[7rem] leading-[0.95] tracking-[-0.035em]"
      >
        <span className="font-extralight text-muted-foreground">{greeting},</span>{" "}
        <span className="font-black text-foreground">{firstName}.</span>
      </h1>
      {insight && (
        <p
          data-anim
          className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl"
        >
          {insight}
        </p>
      )}
      {typeof completeness === "number" && (
        <div data-anim className="mt-5 flex items-center gap-3 max-w-md">
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-medium shrink-0">
            Profile
          </span>
          <div className="relative h-1 flex-1 rounded-full bg-border/50 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${Math.max(0, Math.min(100, completeness))}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-foreground tabular-nums shrink-0">
            {completeness}%
          </span>
        </div>
      )}
    </div>
  );
}