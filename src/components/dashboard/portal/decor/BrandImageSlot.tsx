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
  cream: "text-foreground/55",
  ink: "text-background/70",
  accent: "text-primary",
};

const TONE_BODY: Record<Tone, string> = {
  cream: "text-foreground/65",
  ink: "text-background/75",
  accent: "text-foreground/65",
};

const TONE_RULE: Record<Tone, string> = {
  cream: "bg-foreground/20",
  ink: "bg-background/35",
  accent: "bg-primary/40",
};

/**
 * Render the headline with the trailing 1–2 words set in italic serif
 * to create an editorial pull-quote feel.
 */
function renderEditorialHeadline(text: string) {
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return <>{text}</>;
  const accentCount = words.length >= 6 ? 2 : 1;
  const head = words.slice(0, words.length - accentCount).join(" ");
  const tail = words.slice(words.length - accentCount).join(" ");
  return (
    <>
      {head}{" "}
      <span className="font-urbanist font-normal text-primary">{tail}</span>
    </>
  );
}

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

  const ctaClasses = cn(
    "group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] font-public-sans font-semibold border-b pb-1 transition-colors",
    tone === "ink"
      ? "text-background border-background/40 hover:border-background"
      : "text-primary border-primary/40 hover:border-primary"
  );

  const TextBlock = (
    <div className={cn("flex-1 min-w-0", isTop ? "" : "md:w-1/2")}>
      {eyebrow && (
        <div className="flex items-center gap-3 mb-5">
          <span className={cn("h-px w-8 shrink-0", TONE_RULE[tone])} aria-hidden />
          <p
            className={cn(
              "text-[10px] uppercase tracking-[0.32em] font-medium font-public-sans",
              TONE_EYEBROW[tone]
            )}
          >
            {eyebrow}
          </p>
        </div>
      )}
      <h3
        className={cn(
          "font-urbanist font-thin text-[1.9rem] md:text-[2.5rem] lg:text-[2.85rem] leading-[1.05] tracking-[-0.02em]",
          tone === "ink" ? "text-background" : "text-foreground"
        )}
      >
        {renderEditorialHeadline(headline)}
      </h3>
      {body && (
        <p
          className={cn(
            "mt-5 text-[15px] md:text-[16px] leading-[1.7] font-public-sans font-light max-w-[46ch]",
            TONE_BODY[tone]
          )}
        >
          {body}
        </p>
      )}
      {cta && (
        <div className="mt-7">
          {cta.href ? (
            <a href={cta.href} className={ctaClasses}>
              {cta.label} <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          ) : (
            <button type="button" onClick={cta.onClick} className={ctaClasses}>
              {cta.label} <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
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
          "p-6 md:p-10 lg:p-12 gap-8 md:gap-12",
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
