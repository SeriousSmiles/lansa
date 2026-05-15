import { ReactNode } from "react";
import { Link } from "react-router-dom";
import lansaIcon from "@/assets/lansa-icon-brand.svg";

interface SharedProfilePortalShellProps {
  children: ReactNode;
}

/**
 * Public-facing shell for /profile/share/:userId in Portal v2 mode.
 * No authenticated rail. Slim brand bar + warm canvas + inline legacy toggle.
 */
export function SharedProfilePortalShell({ children }: SharedProfilePortalShellProps) {
  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border/40 bg-[rgba(253,248,242,0.85)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10 h-14">
          <Link to="/" className="flex items-center gap-2">
            <img src={lansaIcon} alt="Lansa" className="h-7 w-7" />
            <span className="text-sm font-medium tracking-tight text-foreground">Lansa</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/signup"
              className="hidden sm:inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Lansa
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-full border border-border/60 px-4 py-1.5 text-xs font-medium text-foreground hover:bg-card transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}