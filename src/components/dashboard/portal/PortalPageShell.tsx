import { ReactNode } from "react";
import { PortalRail } from "./PortalRail";
import { PortalContextPanel } from "./PortalContextPanel";
import { cn } from "@/lib/utils";

interface PortalPageShellProps {
  /** Optional eyebrow above the title (e.g. "Workspace"). */
  eyebrow?: string;
  /** Big page title. Pass falsy to hide the page header entirely. */
  title?: ReactNode;
  /** Subtitle/description under the title. */
  subtitle?: ReactNode;
  /** Right-side actions slot inside the header row. */
  actions?: ReactNode;
  /** When true, renders the children edge-to-edge without the
   *  centred `max-w` content container or default padding.
   *  Use for chat / resume editor / fully-custom layouts. */
  fullBleed?: boolean;
  /** Removes vertical padding under the header (when header is shown). */
  tightTop?: boolean;
  /** Optional right-side context (Profile/AI/Activity) for legacy passing — defaults provided by PortalContextPanel. */
  contextRole?: string;
  contextGoal?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Shared three-zone shell used by every Portal v2 seeker page:
 *   • PortalRail  (left, sticky)
 *   • Centred content with optional title header
 *   • PortalContextPanel (right slide-over drawer)
 *
 * Page bodies remain unchanged — only the chrome around them is unified.
 */
export function PortalPageShell({
  eyebrow,
  title,
  subtitle,
  actions,
  fullBleed = false,
  tightTop = false,
  contextRole = "Professional",
  contextGoal = "Career growth",
  className,
  children,
}: PortalPageShellProps) {
  const showHeader = !!(title || subtitle || eyebrow || actions);

  return (
    <div className="flex w-full min-h-screen bg-[rgba(253,248,242,1)]">
      <PortalRail />

      <div className="flex-1 min-w-0 flex flex-col">
        <main className={cn("flex-1", className)}>
          {fullBleed ? (
            <div className="w-full">{children}</div>
          ) : (
            <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-10 xl:px-14 pb-24">
              {showHeader && (
                <div className={cn("flex items-end justify-between gap-6 flex-wrap", tightTop ? "pt-6" : "pt-8 md:pt-12 pb-6 border-b border-border/30")}>
                  <div className="min-w-0">
                    {eyebrow && (
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
                        {eyebrow}
                      </p>
                    )}
                    {title && (
                      <h1 className="mt-2 text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.03em] font-extralight text-foreground">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
                        {subtitle}
                      </p>
                    )}
                  </div>
                  {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
                </div>
              )}
              <div className={cn(showHeader ? "mt-7" : "")}>{children}</div>
            </div>
          )}
        </main>
      </div>

      <PortalContextPanel role={contextRole} goal={contextGoal} />
    </div>
  );
}