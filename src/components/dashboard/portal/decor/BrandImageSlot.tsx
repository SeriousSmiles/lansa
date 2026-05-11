import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

type Aspect = "wide" | "portrait" | "square";
type Tone = "cream" | "ink" | "accent";
type Placement = "image-left" | "image-right" | "image-top";
type Priority = "always" | "desktop-only";

interface BrandImageSlotProps {
  src?: string;
  alt?: string;
  eyebrow?: string;
  headline: string;
  body?: string;
  cta?: { label: string; onClick?: () => void; href?: string };
  aspect?: Aspect;
  tone?: Tone;
  placement?: Placement;
  priority?: Priority;
  className?: string;
}

const ASPECT_CLASS: Record<Aspect, string> = {
  wide: "aspect-[16/7]",
  portrait: "aspect-[3/4]",
  square: "aspect-square",
};

const ASPECT_HINT: Record<Aspect, string> = {
  wide: "16:7 · ~1600×700",
  portrait: "3:4 · ~900×1200",
  square: "1:1 · ~1000×1000",
};

const TONE_CARD: Record<Tone, string> = {
  cream: "bg-card border-border/40",
  ink: "bg-foreground text-background border-transparent",
  accent: "bg-primary/5 border-primary/15",
};

const TONE_EYEBROW: Record<Tone, string> = {
  cream: "text-muted-foreground",
  ink: "text-background/70",
  accent: "text-primary",
};

const TONE_BODY: Record<Tone, string> = {
  cream: "text-muted-foreground",
  ink: "text-background/80",
  accent: "text-muted-foreground",
};

export function BrandImageSlot({
  src,
  alt = "",
  eyebrow,
  headline,
  body,
  cta,
  aspect = "wide",
  tone = "cream",
  placement = "image-right",
  priority = "always",
  className,
}: BrandImageSlotProps) {
  const isTop = placement === "image-top";
  const isLeft = placement === "image-left";

  const ImageBlock = (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        ASPECT_CLASS[aspect],
        isTop ? "w-full" : "w-full md:w-1/2 shrink-0"
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2 border-2 border-dashed",
            tone === "ink"
              ? "border-background/30 bg-background/5"
              : "border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
          )}
        >
          <ImageIcon
            className={cn(
              "h-6 w-6",
              tone === "ink" ? "text-background/60" : "text-primary/60"
            )}
            aria-hidden
          />
          <p
            className={cn(
              "text-[10px] uppercase tracking-[0.18em] font-medium",
              tone === "ink" ? "text-background/70" : "text-primary/80"
            )}
          >
            Image slot · {aspect}
          </p>
          <p
            className={cn(
              "text-[10px]",
              tone === "ink" ? "text-background/50" : "text-muted-foreground"
            )}
          >
            {ASPECT_HINT[aspect]}
          </p>
        </div>
      )}
    </div>
  );

  const TextBlock = (
    <div className={cn("flex-1 min-w-0", isTop ? "" : "md:w-1/2")}>
      {eyebrow && (
        <p
          className={cn(
            "text-[10px] uppercase tracking-[0.18em] font-medium mb-3",
            TONE_EYEBROW[tone]
          )}
        >
          {eyebrow}
        </p>
      )}
      <h3
        className={cn(
          "text-2xl md:text-3xl leading-[1.1] tracking-[-0.02em] font-black",
          tone === "ink" ? "text-background" : "text-foreground"
        )}
      >
        {headline}
      </h3>
      {body && (
        <p className={cn("mt-3 text-sm md:text-base leading-relaxed max-w-prose", TONE_BODY[tone])}>
          {body}
        </p>
      )}
      {cta && (
        <div className="mt-5">
          {cta.href ? (
            <a
              href={cta.href}
              className={cn(
                "inline-flex items-center text-sm font-semibold underline underline-offset-4",
                tone === "ink" ? "text-background" : "text-primary"
              )}
            >
              {cta.label}
            </a>
          ) : (
            <button
              type="button"
              onClick={cta.onClick}
              className={cn(
                "inline-flex items-center text-sm font-semibold underline underline-offset-4",
                tone === "ink" ? "text-background" : "text-primary"
              )}
            >
              {cta.label}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section
      className={cn(
        "rounded-3xl border shadow-sm overflow-hidden",
        TONE_CARD[tone],
        priority === "desktop-only" && "hidden lg:block",
        className
      )}
    >
      <div
        className={cn(
          "p-5 md:p-7 gap-6 md:gap-8",
          isTop
            ? "flex flex-col"
            : cn(
                "flex flex-col md:flex-row md:items-center",
                isLeft ? "" : "md:flex-row-reverse"
              )
        )}
      >
        {ImageBlock}
        {TextBlock}
      </div>
    </section>
  );
}