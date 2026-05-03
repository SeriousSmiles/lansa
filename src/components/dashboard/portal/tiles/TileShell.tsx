import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface TileShellProps {
  label: string;
  title: string;
  icon?: React.ElementType;
  onOpen?: () => void;
  openLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export function TileShell({ label, title, icon: Icon, onOpen, openLabel, children, className }: TileShellProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-3xl border border-border/40 bg-card/80 backdrop-blur-sm p-5 md:p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30",
        "shadow-[0_1px_0_hsl(0_0%_0%/0.04),0_8px_24px_-16px_hsl(14_90%_60%/0.18)] hover:shadow-[0_1px_0_hsl(0_0%_0%/0.04),0_16px_36px_-16px_hsl(14_90%_60%/0.28)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {label}
          </div>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
        </div>
        {onOpen && (
          <button
            type="button"
            onClick={onOpen}
            className="shrink-0 inline-flex items-center gap-1 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {openLabel || "Open"}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="mt-4 flex-1 min-h-0">{children}</div>
    </div>
  );
}