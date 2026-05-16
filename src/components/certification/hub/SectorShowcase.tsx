import { Briefcase, Users, Wrench, Monitor } from "lucide-react";
import { SectorFeatureCard } from "./SectorFeatureCard";
import type { CertResult, Certification } from "@/types/certification";
import sectorOffice from "@/assets/certification/sector-office.jpg";
import sectorService from "@/assets/certification/sector-service.jpg";
import sectorTechnical from "@/assets/certification/sector-technical.jpg";
import sectorDigital from "@/assets/certification/sector-digital.jpg";

export interface SectorProgress {
  sector: string;
  resultId: string | null;
  lastScore: number | null;
  passed: boolean;
  lastAttempt: string | null;
  fullResult: CertResult | null;
  certification: Certification | null;
}

export const SECTORS = [
  {
    id: "office",
    name: "Office Professional",
    icon: Briefcase,
    description: "Administrative, coordination, and operational work that keeps a business moving.",
    accent: "hsl(215 85% 55%)", // brand blue
    large: true,
    image: sectorOffice,
  },
  {
    id: "service",
    name: "Service Professional",
    icon: Users,
    description: "Customer-facing roles in hospitality, retail, and service where presence is everything.",
    accent: "hsl(14 90% 60%)", // brand orange
    large: true,
    image: sectorService,
  },
  {
    id: "technical",
    name: "Technical Professional",
    icon: Wrench,
    description: "Hands-on, on-site and trade work that businesses rely on day to day.",
    accent: "#191f71", // deep blue
    large: false,
    image: sectorTechnical,
  },
  {
    id: "digital",
    name: "Digital Professional",
    icon: Monitor,
    description: "Tech, marketing, and digital roles building the next generation of Curaçao.",
    accent: "hsl(14 90% 60%)", // orange (warm)
    large: false,
    image: sectorDigital,
  },
] as const;

interface SectorShowcaseProps {
  progress: Record<string, SectorProgress>;
  userId: string;
  onStart: (sectorId: string, sectorName: string) => void;
}

export function SectorShowcase({ progress, userId, onStart }: SectorShowcaseProps) {
  const top = SECTORS.filter((s) => s.large);
  const bottom = SECTORS.filter((s) => !s.large);

  return (
    <section id="sectors" className="space-y-6">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-foreground/25" aria-hidden />
            <p className="text-[10px] uppercase tracking-[0.32em] font-medium font-public-sans text-foreground/55">
              Choose your sector
            </p>
          </div>
          <h2 className="font-urbanist font-thin text-[2rem] md:text-[2.6rem] leading-[1.05] tracking-[-0.02em] text-foreground max-w-[24ch]">
            Four exams. One verified you.
          </h2>
        </div>
        <p className="text-sm font-public-sans font-light text-foreground/60 max-w-[40ch]">
          Each exam is 40 questions, ~40 seconds each, sector-specific. XCG 25 once — verified for life.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {top.map((s) => {
          const p = progress[s.id];
          return (
            <SectorFeatureCard
              key={s.id}
              id={s.id}
              name={s.name}
              description={s.description}
              icon={s.icon}
              accent={s.accent}
              passed={p?.passed ?? false}
              lastScore={p?.lastScore ?? null}
              result={p?.fullResult ?? null}
              certification={p?.certification ?? null}
              userId={userId}
              large
              onStart={() => onStart(s.id, s.name)}
              src={s.image}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {bottom.map((s) => {
          const p = progress[s.id];
          return (
            <SectorFeatureCard
              key={s.id}
              id={s.id}
              name={s.name}
              description={s.description}
              icon={s.icon}
              accent={s.accent}
              passed={p?.passed ?? false}
              lastScore={p?.lastScore ?? null}
              result={p?.fullResult ?? null}
              certification={p?.certification ?? null}
              userId={userId}
              onStart={() => onStart(s.id, s.name)}
              src={s.image}
            />
          );
        })}
      </div>
    </section>
  );
}