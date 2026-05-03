import { Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortalMode } from "@/hooks/usePortalMode";

interface LegacyModeToggleProps {
  /** "floating" (bottom-right pill, default) or "inline" (use inside a header bar). */
  variant?: "floating" | "inline";
  className?: string;
}

/**
 * Global control to switch between the new Portal v2 UI and the legacy
 * classic dashboard / pages. Reads/writes the same flag everywhere via
 * `usePortalMode`, then soft-reloads so deeply nested layouts pick up
 * the change cleanly.
 */
export function LegacyModeToggle({ variant = "floating", className }: LegacyModeToggleProps) {
  const { portalV2, setPortalV2 } = usePortalMode();

  const handleClick = () => {
    setPortalV2(!portalV2);
    // Defer reload so the localStorage write has flushed.
    setTimeout(() => window.location.reload(), 30);
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
          className
        )}
        title={portalV2 ? "Switch to classic UI" : "Try the new experience"}
      >
        {portalV2 ? <RotateCcw className="h-3 w-3" /> : <Sparkles className="h-3 w-3 text-primary" />}
        {portalV2 ? "Use classic" : "Try the new experience"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "fixed bottom-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/95 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-lg hover:text-foreground transition-colors",
        className
      )}
      title={portalV2 ? "Switch to classic UI" : "Try the new experience"}
    >
      {portalV2 ? (
        <>
          <RotateCcw className="h-3 w-3" />
          New experience · Use classic
        </>
      ) : (
        <>
          <Sparkles className="h-3 w-3 text-primary" />
          Try the new experience
        </>
      )}
    </button>
  );
}