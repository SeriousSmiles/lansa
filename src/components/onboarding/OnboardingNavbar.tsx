import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface OnboardingNavbarProps {
  currentStep?: number;
  totalSteps?: number;
  className?: string;
}

export function OnboardingNavbar({ currentStep, totalSteps, className }: OnboardingNavbarProps) {
  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
            alt="Lansa Logo"
            className="h-6 w-auto"
          />
        </Link>

        {/* Optional Step Indicator */}
        {currentStep && totalSteps && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Step</span>
            <span className="font-medium text-foreground">
              {currentStep}
            </span>
            <span>of</span>
            <span>{totalSteps}</span>
          </div>
        )}
      </div>
    </nav>
  );
}
