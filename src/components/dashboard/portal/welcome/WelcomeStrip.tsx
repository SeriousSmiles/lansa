import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CalendarDays, Check, UserRound } from "lucide-react";

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
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = ref.current.querySelectorAll<HTMLElement>("[data-anim]");
    gsap.fromTo(
      els,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.08 }
    );
  }, []);

  return (
    <header ref={ref} className="flex flex-col gap-5 pt-7 pb-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8 md:pt-9 md:pb-8">
      <div className="min-w-0">
      <p
        data-anim
        className="flex items-center gap-2 text-xs text-muted-foreground font-medium"
      >
        <CalendarDays className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
        {formatToday()}
      </p>
      <h1
        data-anim
        className="mt-3 text-3xl md:text-4xl leading-tight break-words"
      >
        <span className="font-light text-foreground">{greeting},</span>{" "}
        <span className="font-extrabold text-foreground">{firstName}.</span>
      </h1>
      {insight && (
        <p
          data-anim
          className="mt-3 text-sm text-muted-foreground"
        >
          {insight}
        </p>
      )}
      </div>
      {typeof completeness === "number" && (
        <div data-anim className="flex w-full items-center gap-3 border-t border-border pt-4 sm:w-56 sm:shrink-0 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dashboard-blue-surface text-dashboard-blue-text">
            {completeness >= 100 ? <Check className="h-5 w-5" aria-hidden="true" /> : <UserRound className="h-5 w-5" aria-hidden="true" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-foreground">Profile</span>
              <span className="text-xs font-bold text-dashboard-blue-text tabular-nums">{completeness}%</span>
            </div>
          <div role="progressbar" aria-label="Profile completion" aria-valuenow={completeness} aria-valuemin={0} aria-valuemax={100} className="relative h-1.5 w-full rounded-full bg-secondary/10 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-secondary motion-safe:transition-[width] motion-safe:duration-500"
              style={{ width: `${Math.max(0, Math.min(100, completeness))}%` }}
            />
          </div>
          </div>
        </div>
      )}
    </header>
  );
}