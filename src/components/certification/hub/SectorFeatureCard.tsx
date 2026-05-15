import { Button } from "@/components/ui/button";
import { ImageIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import CertificateDownloadButton from "@/components/certification/CertificateDownloadButton";
import type { CertResult, Certification } from "@/types/certification";

export interface SectorFeatureCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** CSS color (HSL/hex) for the accent tint; brand tokens only */
  accent: string;
  passed: boolean;
  lastScore: number | null;
  result: CertResult | null;
  certification: Certification | null;
  userId: string;
  large?: boolean;
  onStart: () => void;
  src?: string;
}

export function SectorFeatureCard({
  name,
  description,
  icon: Icon,
  accent,
  passed,
  lastScore,
  result,
  certification,
  userId,
  large,
  onStart,
  src,
}: SectorFeatureCardProps) {
  return (
    <article
      className={cn(
        "sector-card group relative overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm flex flex-col",
        large ? "min-h-[440px]" : "min-h-[380px]"
      )}
    >
      {/* Image / placeholder top half */}
      <div className={cn("relative w-full overflow-hidden", large ? "aspect-[16/8]" : "aspect-[16/9]")}>
        {src ? (
          <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 border-b border-dashed"
            style={{ backgroundColor: `color-mix(in oklab, ${accent} 8%, transparent)`, borderColor: `color-mix(in oklab, ${accent} 35%, transparent)` }}
          >
            <ImageIcon className="h-6 w-6" style={{ color: accent }} aria-hidden />
            <p className="text-[10px] uppercase tracking-[0.18em] font-medium" style={{ color: accent }}>
              Image slot · {name}
            </p>
          </div>
        )}
        {/* Gradient veil for legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(180deg, transparent 40%, color-mix(in oklab, ${accent} 18%, transparent) 100%)` }}
        />
        {/* Accent rule */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accent }} aria-hidden />

        {passed && (
          <div className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/40 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
            <span className="text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: accent }}>
              Certified
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-6 md:p-8 gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `color-mix(in oklab, ${accent} 12%, transparent)`, color: accent }}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-[10px] uppercase tracking-[0.28em] font-medium font-public-sans text-foreground/55">Sector</p>
            </div>
            <h3 className="font-urbanist font-thin text-[1.7rem] md:text-[2rem] leading-[1.05] tracking-[-0.02em] text-foreground">
              {name}
            </h3>
            <p className="mt-2 text-sm font-public-sans font-light text-foreground/65 max-w-[36ch]">
              {description}
            </p>
          </div>

          {lastScore !== null && (
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-[0.22em] font-medium text-foreground/55">Score</p>
              <p className="font-urbanist font-thin text-3xl mt-1" style={{ color: passed ? accent : undefined }}>
                {lastScore.toFixed(0)}%
              </p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-2 flex flex-col sm:flex-row gap-3 sm:items-center">
          <Button
            onClick={onStart}
            size="lg"
            variant={passed ? "outline" : "primary"}
            className="sm:flex-1"
          >
            {passed ? "Retake exam" : lastScore !== null ? "Try again · XCG 25" : "Start exam · XCG 25"}
          </Button>
          {passed && result && certification && (
            <CertificateDownloadButton
              result={result}
              certification={certification}
              userId={userId}
              compact
            />
          )}
        </div>
      </div>
    </article>
  );
}