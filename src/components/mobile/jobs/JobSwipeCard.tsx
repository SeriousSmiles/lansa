import { motion, MotionValue, useTransform } from "framer-motion";
import { Building2, MapPin, Briefcase, Sparkles } from "lucide-react";
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

export function JobSwipeCard({ job, x, isTop = false, onTap, depth = 0 }: JobSwipeCardProps) {
  const { bullets, loading } = useJobAISummary(job.id, depth <= 1);
  const logo = getJobLogo(job);
  const company = job.business_profiles?.company_name || job.company_name || "Company";

  // Overlay tints
  const rightOpacity = useTransform(x ?? new (class { } as any), [40, 140], [0, 1]);
  const leftOpacity = useTransform(x ?? new (class { } as any), [-140, -40], [1, 0]);

  return (
    <div
      onClick={onTap}
      className="relative w-full h-full overflow-hidden rounded-3xl bg-card border border-border shadow-[0_18px_50px_-20px_hsl(var(--foreground)/0.25)] flex flex-col"
      style={{ touchAction: "pan-y" }}
    >
      {/* Header strip with logo + company */}
      <div className="flex items-center gap-3 px-5 pt-5">
        <div className="w-12 h-12 rounded-xl overflow-hidden border bg-background flex items-center justify-center flex-shrink-0">
          {logo ? (
            <img src={logo} alt={company} className="w-full h-full object-contain" />
          ) : (
            <Building2 className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{company}</p>
          {job.salary_range && (
            <p className="text-xs text-muted-foreground/80 mt-0.5 font-normal">
              {job.salary_range}
            </p>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="px-5 pt-3">
        <h2 className="text-3xl font-extralight leading-tight tracking-tight text-foreground">
          {job.title}
        </h2>
      </div>

      {/* AI bullets */}
      <div className="px-5 mt-4 flex-1 min-h-0 overflow-y-auto">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] uppercase tracking-wider text-primary font-medium">AI summary</span>
        </div>
        {loading ? (
          <ul className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex gap-2">
                <Skeleton className="h-3 w-3 rounded-full mt-1.5" />
                <Skeleton className="h-4 flex-1" />
              </li>
            ))}
          </ul>
        ) : bullets.length > 0 ? (
          <ul className="space-y-2.5">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-snug text-foreground/85">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-6">
            {job.description || "Tap the card to see full details."}
          </p>
        )}
      </div>

      {/* Meta footer */}
      <div className="px-5 pb-5 pt-3 border-t border-border/60 mt-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
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
        <p className="text-[11px] text-muted-foreground/70 mt-2 text-center">
          Swipe right to save · left to pass · tap for details
        </p>
      </div>

      {/* Swipe overlays — only on top card */}
      {isTop && x && (
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
      )}
    </div>
  );
}