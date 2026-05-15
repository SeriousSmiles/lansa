import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Cashea/Klarna-inspired landing primitives.
 * Full-bleed coloured bands, oversized display headlines, pill CTAs.
 */

export const BAND_BG = {
  white: "bg-white text-[#0d0d0d]",
  cream: "bg-[hsl(40_33%_96%)] text-[#0d0d0d]",
  blue: "bg-[#191f71] text-white",
  orange: "bg-[hsl(14_90%_60%)] text-[#0d0d0d]",
} as const;

export type BandTone = keyof typeof BAND_BG;

export const Band = ({
  tone = "white",
  className,
  children,
  id,
}: {
  tone?: BandTone;
  className?: string;
  children: ReactNode;
  id?: string;
}) => (
  <section
    id={id}
    className={cn("w-full", BAND_BG[tone], className)}
  >
    <div className="mx-auto max-w-[1200px] px-6 md:px-10 py-20 md:py-32">
      {children}
    </div>
  </section>
);

export const Eyebrow = ({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "white" | "dark";
}) => {
  const color =
    tone === "white"
      ? "text-white/70"
      : tone === "dark"
      ? "text-[#0d0d0d]/70"
      : "text-primary";
  return (
    <p
      className={cn(
        "text-[11px] md:text-xs uppercase tracking-[0.22em] font-urbanist font-bold mb-5",
        color
      )}
    >
      {children}
    </p>
  );
};

export const Display = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <h2
    className={cn(
      "font-urbanist font-black tracking-[-0.02em] text-[#191f71]",
      // line-height bundled with each size so tailwind-merge can't strip it
      "text-[44px]/[0.85] sm:text-[56px]/[0.85] md:text-[80px]/[0.85]",
      className
    )}
  >
    {children}
  </h2>
);

export const Lede = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <p
    className={cn(
      "font-public-sans text-base md:text-lg leading-relaxed",
      className
    )}
  >
    {children}
  </p>
);

export const PillButton = ({
  variant = "dark",
  onClick,
  children,
  type = "button",
}: {
  variant?: "dark" | "orange" | "white" | "outline";
  onClick?: () => void;
  children: ReactNode;
  type?: "button" | "submit";
}) => {
  const styles = {
    dark: "bg-[#0d0d0d] text-white hover:bg-[#0d0d0d]/90",
    orange: "bg-primary text-white hover:bg-primary/90",
    white: "bg-white text-[#0d0d0d] hover:bg-white/90",
    outline:
      "bg-transparent text-current border-2 border-current hover:bg-current/10",
  } as const;
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-7 py-4 text-base font-urbanist font-semibold transition-colors",
        styles[variant]
      )}
    >
      {children}
    </button>
  );
};

export const ImageFrame = ({
  src,
  alt,
  ratio = "4/5",
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  ratio?: "4/5" | "3/4" | "1/1" | "16/9";
  priority?: boolean;
  className?: string;
}) => (
  <div
    className={cn("relative w-full overflow-hidden rounded-[2rem]", className)}
    style={{ aspectRatio: ratio.replace("/", " / ") }}
  >
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      className="absolute inset-0 h-full w-full object-cover"
    />
  </div>
);