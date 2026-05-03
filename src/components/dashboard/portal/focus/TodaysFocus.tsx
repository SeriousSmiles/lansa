import { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getPersonalizedActionPoints } from "@/utils/actionPoints";

interface TodaysFocusProps {
  role: string;
}

export function TodaysFocus({ role }: TodaysFocusProps) {
  const navigate = useNavigate();

  const action = useMemo(() => {
    const items = getPersonalizedActionPoints(role) || [];
    return [...items].sort((a, b) => (a.priority || 999) - (b.priority || 999))[0];
  }, [role]);

  if (!action) return null;

  const handleClick = () => {
    const target = action.action;
    if (typeof target === "string" && target.startsWith("/")) {
      navigate(target);
      return;
    }
    // For non-route actions ("ai-coach", "pdf-download") fall back to /dashboard
    // — the relevant tile/panel handles its own deep linking.
    navigate("/dashboard");
  };

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
          Today's focus
        </h2>
      </div>
      <div
        className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card via-card to-primary/[0.06] p-6 md:p-8 shadow-[0_1px_0_hsl(0_0%_0%/0.04),0_12px_32px_-16px_hsl(14_90%_60%/0.22)]"
      >
        <div
          aria-hidden
          className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl pointer-events-none"
        />
        <div className="relative">
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
            {action.title}
          </h3>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl">
            {action.description}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Button onClick={handleClick} size="lg" className="rounded-full">
              {action.buttonText || "Start now"}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}