import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface WelcomeStripProps {
  userName: string;
  insight?: string;
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

export function WelcomeStrip({ userName, insight }: WelcomeStripProps) {
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
    <div ref={ref} className="pt-8 md:pt-14 pb-8 border-b border-border/30">
      <p
        data-anim
        className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium"
      >
        {formatToday()}
      </p>
      <h1
        data-anim
        className="mt-3 text-6xl md:text-8xl lg:text-[9rem] leading-[0.95] tracking-[-0.04em]"
      >
        <span className="font-extralight text-muted-foreground">{greeting},</span>{" "}
        <span className="font-black text-foreground">{firstName}.</span>
      </h1>
      {insight && (
        <p
          data-anim
          className="mt-5 text-sm md:text-base text-muted-foreground max-w-2xl"
        >
          {insight}
        </p>
      )}
    </div>
  );
}