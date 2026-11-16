import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardActionBandProps {
  label: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon: LucideIcon;
  loading?: boolean;
}

export function DashboardActionBand({ label, title, description, actionLabel, onAction, icon: Icon, loading }: DashboardActionBandProps) {
  return (
    <section className="w-full border-l-4 border-primary bg-dashboard-ink px-5 py-7 sm:px-7 sm:py-8 text-dashboard-on-ink" aria-label={label}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashboard-on-ink/20 bg-dashboard-on-ink/10"><Icon className="h-6 w-6 text-dashboard-on-ink" /></span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-dashboard-soft-ink">{label}</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold leading-tight text-dashboard-on-ink">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-dashboard-soft-ink">{description}</p>
          </div>
        </div>
        <Button variant="dashboard-cta" onClick={onAction} disabled={loading} className="min-h-12 shrink-0 gap-3 self-start whitespace-normal sm:self-center font-semibold">
          {actionLabel}<ArrowRight className="h-4 w-4 shrink-0" />
        </Button>
      </div>
    </section>
  );
}