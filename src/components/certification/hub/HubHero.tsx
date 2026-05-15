import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, ImageIcon } from "lucide-react";

interface HubHeroProps {
  certifiedCount: number;
  totalSectors: number;
  highestScore: number;
  onPrimary: () => void;
  onSecondary: () => void;
  src?: string;
}

export function HubHero({ certifiedCount, totalSectors, highestScore, onPrimary, onSecondary, src }: HubHeroProps) {
  return (
    <section className="rounded-3xl overflow-hidden border border-transparent bg-foreground text-background shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-background/35" aria-hidden />
              <p className="text-[10px] uppercase tracking-[0.32em] font-medium font-public-sans text-background/70">
                Lansa Certification
              </p>
            </div>
            <h1 className="font-urbanist font-thin text-[2.6rem] md:text-[3.6rem] lg:text-[4.4rem] leading-[1.02] tracking-[-0.03em] text-background">
              Get seen for what you{" "}
              <span className="font-normal italic text-primary">actually bring.</span>
            </h1>
            <p className="mt-6 text-[15px] md:text-[17px] leading-[1.7] font-public-sans font-light text-background/75 max-w-[52ch]">
              The Lansa certification is how Curaçao employers separate signal from noise. Pass one
              exam in your sector, become verified, and start showing up in front of businesses with
              live job listings — instead of waiting to be found.
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <Button size="lg" variant="primary" onClick={onPrimary} className="group">
              Start your certification
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <button
              type="button"
              onClick={onSecondary}
              className="text-[12px] uppercase tracking-[0.22em] font-public-sans font-semibold text-background/80 border-b border-background/40 hover:border-background pb-1 self-start sm:self-auto"
            >
              How it works
            </button>

            <div className="sm:ml-auto flex items-center gap-6 text-background/70">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-medium">Certified</p>
                <p className="font-urbanist font-thin text-2xl text-background mt-1">
                  {certifiedCount}<span className="text-background/45">/{totalSectors}</span>
                </p>
              </div>
              <div className="h-10 w-px bg-background/20" aria-hidden />
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-medium">Highest score</p>
                <p className="font-urbanist font-thin text-2xl text-background mt-1">
                  {highestScore > 0 ? `${highestScore.toFixed(0)}%` : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full">
          {src ? (
            <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-background/30 bg-background/5")}> 
              <ImageIcon className="h-6 w-6 text-background/60" aria-hidden />
              <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-background/70">
                Image slot · hero
              </p>
              <p className="text-[10px] text-background/50">Drop a portrait of a Curaçao professional</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}