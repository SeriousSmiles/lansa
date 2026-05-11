import { useNavigate } from "react-router-dom";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ProfileCompletionCard({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const completion = useProfileCompletion(user?.id);
  const [dismissed, setDismissed] = useState(false);

  if (completion.loading || completion.is_complete) return null;
  if (dismissed || completion.dismissedActive) return null;

  const top = completion.missing_steps.slice(0, 3);
  const score = completion.score;

  return (
    <section
      className={`rounded-3xl border border-[hsl(14_90%_60%/0.25)] bg-gradient-to-br from-[hsl(14_90%_60%/0.06)] via-white to-white p-5 md:p-7 shadow-sm ${className}`}
      aria-label="Profile completion"
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-[hsl(14_90%_60%)] text-white grid place-items-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(14_60%_45%)] font-semibold">
              Profile completion
            </p>
            <h2 className="text-lg md:text-xl font-bold text-[#191f71] leading-tight">
              You're {score}% ready — finish strong
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            completion.dismissForToday();
            setDismissed(true);
          }}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Dismiss for today"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="mb-5">
        <div className="h-2 w-full rounded-full bg-[hsl(14_90%_60%/0.12)] overflow-hidden">
          <div
            className="h-full bg-[hsl(14_90%_60%)] rounded-full transition-all duration-700"
            style={{ width: `${Math.max(score, 4)}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2 mb-5">
        {top.map((step) => (
          <li key={step.key}>
            <button
              type="button"
              onClick={() => {
                const base = step.cta_route || "/profile";
                // Append ?action= so ProfileActionRouter can trigger the
                // actual editor / toggle for this missing step.
                const sep = base.includes("?") ? "&" : "?";
                navigate(`${base}${sep}action=${encodeURIComponent(step.key)}`);
              }}
              className="w-full flex items-center justify-between gap-3 rounded-2xl bg-white border border-border/40 px-4 py-3 hover:border-[hsl(14_90%_60%/0.5)] hover:bg-[hsl(14_90%_60%/0.04)] transition-colors text-left group"
            >
              <span className="text-sm font-medium text-foreground">
                {step.label}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[hsl(14_90%_60%)] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Complete profiles get matched with real opportunities.
        </p>
        <Button
          size="sm"
          onClick={() => navigate("/profile")}
          className="bg-[hsl(14_90%_60%)] hover:bg-[hsl(14_90%_55%)] text-white rounded-full px-4"
        >
          Continue
        </Button>
      </div>
    </section>
  );
}