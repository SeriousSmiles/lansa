import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep?: number;
  totalSteps?: number;
  title?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  title,
  onBack,
  showBackButton = false,
  className = ""
}: OnboardingLayoutProps) {
  const progress = currentStep && totalSteps ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Sticky Progress Bar */}
      {progress > 0 && (
        <div className="sticky top-0 z-50 w-full">
          <div className="h-2 bg-muted/30 backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 shadow-lg shadow-primary/20 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-2 z-40 bg-background/80 backdrop-blur-lg border-b border-border/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              {showBackButton && onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {title && (
                <h1 className="text-base font-semibold text-foreground font-inter">
                  {title}
                </h1>
              )}
            </div>

            {/* Right: Step counter */}
            {currentStep && totalSteps && (
              <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                {currentStep} / {totalSteps}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </main>
    </div>
  );
}