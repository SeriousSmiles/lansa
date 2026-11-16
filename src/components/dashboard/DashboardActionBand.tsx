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
    <section className="w-full border-y border-primary/20 bg-accent/50 px-4 py-6 sm:px-6" aria-label={label}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Icon className="mt-1 h-6 w-6 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary">{label}</p>
            <h2 className="mt-1 text-2xl font-bold leading-tight text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button onClick={onAction} disabled={loading} className="min-h-11 shrink-0 gap-2 self-start whitespace-normal sm:self-center">
          {actionLabel}<ArrowRight className="h-4 w-4 shrink-0" />
        </Button>
      </div>
    </section>
  );
}