import { motion, MotionValue, useTransform } from "framer-motion";
import { Building2, MapPin, Briefcase, Sparkles, Wallet, Wifi, Eye, Users } from "lucide-react";
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
  const topBullets = bullets.slice(0, 3);

  const quickStats: { icon: React.ReactNode; label: string; value: string }[] = [];
  if (job.location) {
    quickStats.push({
      icon: <MapPin className="w-3.5 h-3.5 text-primary" />,
      label: "Location",
      value: job.location,
    });
  }
  if (job.job_type) {
    quickStats.push({
      icon: <Briefcase className="w-3.5 h-3.5 text-primary" />,
      label: "Type",
      value: String(job.job_type).replace(/_/g, " "),
    });
  }
  if (job.is_remote) {
    quickStats.push({
      icon: <Wifi className="w-3.5 h-3.5 text-primary" />,
      label: "Mode",
      value: "Remote",
    });
  } else if (job.category) {
    quickStats.push({
      icon: <Sparkles className="w-3.5 h-3.5 text-primary" />,
      label: "Field",
      value: job.category,
    });
  }

  return (
    <div
      onClick={onTap}
      className="relative w-full h-full overflow-hidden rounded-3xl bg-card border border-border shadow-[0_18px_50px_-20px_hsl(var(--foreground)/0.25)] flex flex-col"
      style={{ touchAction: "pan-y" }}
    >
      {/* Hero media */}
      <div className="relative w-full h-[38%] flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary/15 via-background to-secondary/15">
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Compensation pill */}
        {job.salary_range && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-md border border-border/60 text-[11px] text-foreground/80">
            <Wallet className="w-3 h-3 text-primary" />
            <span className="font-normal">{job.salary_range}</span>
          </div>
        )}

        {/* Company chip on hero */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-border/60 bg-background flex items-center justify-center flex-shrink-0 shadow-sm">
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

      {/* Title block */}
      <div className="px-5 pt-4">
        <h2 className="text-[26px] font-extralight leading-[1.1] tracking-tight text-foreground line-clamp-2">
          {job.title}
        </h2>
      </div>

      {/* Quick stat callouts */}
      {quickStats.length > 0 && (
        <div className="px-5 mt-4 grid grid-cols-3 gap-2">
          {quickStats.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/60 bg-muted/30 px-2.5 py-2 flex flex-col items-start gap-1 min-w-0"
            >
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                {s.icon}
              </div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="text-[11px] font-medium text-foreground capitalize truncate w-full">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* AI highlights — short callouts */}
      <div className="px-5 mt-4 mb-4 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] uppercase tracking-[0.14em] text-primary font-semibold">
            Why it fits
          </span>
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-xl" />
            ))}
          </div>
        ) : topBullets.length > 0 ? (
          <ul className="space-y-1.5">
            {topBullets.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-xl bg-primary/[0.06] border border-primary/15 px-3 py-2"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-[12px] leading-snug text-foreground/85 line-clamp-2">{b}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {job.description || "Tap the card to see full details."}
          </p>
        )}

        {/* Footer hint */}
        <div className="mt-auto pt-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3 h-3" /> Tap for details
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="w-3 h-3" /> Swipe to decide
          </span>
        </div>
      </div>

      {/* Swipe overlays — only on top card */}
      {isTop && x && <SwipeOverlays x={x} />}
    </div>
  );
}