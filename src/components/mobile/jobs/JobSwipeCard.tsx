import { motion, MotionValue, useTransform } from "framer-motion";
import { Building2, MapPin, Briefcase, Sparkles, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JobListing } from "@/services/jobFeedService";
import { getJobLogo } from "@/utils/getJobLogo";
import { useJobAISummary } from "@/hooks/useJobAISummary";

interface JobSwipeCardProps {
  job: JobListing;
  x?: MotionValue<number>;
  isTop?: boolean;
  onTap?: () => void;
  depth?: number; // 0 = top
}

function SwipeOverlays({ x }: { x: MotionValue<number> }) {
  const rightOpacity = useTransform(x, [40, 140], [0, 1]);
  const leftOpacity = useTransform(x, [-140, -40], [1, 0]);
  return (
    <>
      <motion.div
        style={{ opacity: rightOpacity }}
        className="pointer-events-none absolute inset-0 bg-emerald-500/10"
      />
      <motion.div
        style={{ opacity: rightOpacity }}
        className="pointer-events-none absolute top-6 left-6 rotate-[-12deg] px-4 py-1.5 rounded-lg border-4 border-emerald-500 text-emerald-600 font-black text-xl tracking-wider"
      >
        INTERESTED
      </motion.div>
      <motion.div
        style={{ opacity: leftOpacity }}
        className="pointer-events-none absolute inset-0 bg-rose-500/10"
      />
      <motion.div
        style={{ opacity: leftOpacity }}
        className="pointer-events-none absolute top-6 right-6 rotate-[12deg] px-4 py-1.5 rounded-lg border-4 border-rose-500 text-rose-600 font-black text-xl tracking-wider"
      >
        PASS
      </motion.div>
    </>
  );
}

export function JobSwipeCard({ job, x, isTop = false, onTap, depth = 0 }: JobSwipeCardProps) {
  const { bullets, loading } = useJobAISummary(job.id, depth <= 1);
  const logo = getJobLogo(job);
  const company = job.business_profiles?.company_name || job.company_name || "Company";
  const heroImage = (job as any).image_url as string | undefined;

  return (
    <div
      onClick={onTap}
      className="relative w-full h-full overflow-hidden rounded-3xl bg-card border border-border shadow-[0_18px_50px_-20px_hsl(var(--foreground)/0.25)] flex flex-col"
      style={{ touchAction: "pan-y" }}
    >
      {/* Hero media */}
      <div className="relative w-full aspect-[16/10] flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary/15 via-background to-secondary/15">
        {heroImage ? (
          <img src={heroImage} alt={job.title} className="w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {logo ? (
              <img src={logo} alt={company} className="w-20 h-20 object-contain opacity-90" />
            ) : (
              <Building2 className="w-16 h-16 text-muted-foreground/40" />
            )}
          </div>
        )}

        {/* Gradient scrim for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />

        {/* Compensation pill */}
        {job.salary_range && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-md border border-border/60 text-[11px] text-foreground/80">
            <Wallet className="w-3 h-3 text-primary" />
            <span className="font-normal">{job.salary_range}</span>
          </div>
        )}

        {/* Company chip */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-border/60 bg-background flex items-center justify-center flex-shrink-0">
            {logo ? (
              <img src={logo} alt={company} className="w-full h-full object-contain" />
            ) : (
              <Building2 className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <span className="text-[11px] uppercase tracking-wider text-foreground/80 font-medium truncate">
            {company}
          </span>
        </div>
      </div>

      {/* Title + meta */}
      <div className="px-5 pt-4">
        <h2 className="text-2xl font-extralight leading-tight tracking-tight text-foreground">
          {job.title}
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
          {job.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {job.location}
            </span>
          )}
          {job.job_type && (
            <span className="inline-flex items-center gap-1 capitalize">
              <Briefcase className="w-3.5 h-3.5" /> {String(job.job_type).replace(/_/g, " ")}
            </span>
          )}
          {job.is_remote && <Badge variant="outline" className="h-5 text-[10px]">Remote</Badge>}
        </div>
      </div>

      {/* AI highlights as chips */}
      <div className="px-5 mt-4 mb-5 flex-1 min-h-0 overflow-y-auto">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] uppercase tracking-wider text-primary font-medium">AI highlights</span>
        </div>
        {loading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        ) : bullets.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {bullets.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-primary/8 border border-primary/15 text-[12px] leading-none text-foreground/85"
              >
                {b}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-4">
            {job.description || "Tap the card to see full details."}
          </p>
        )}
      </div>

      {/* Swipe overlays — only on top card */}
      {isTop && x && <SwipeOverlays x={x} />}
    </div>
  );
}