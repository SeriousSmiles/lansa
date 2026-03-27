import { X, Check } from "lucide-react";

const TRADITIONAL = [
  "Post on multiple job boards",
  "Wait for 50-200 applications",
  "Manually screen every CV",
  "Phone screen 20+ candidates",
  "Schedule & conduct interviews",
  "Check references one by one",
  "Make offer, hope they accept",
];

const LANSA = [
  "Post once via guided wizard",
  "See only certified candidates",
  "AI-ranked by fit score",
  "Swipe to shortlist instantly",
  "Message directly in-app",
  "Hire with confidence",
];

export function FunnelSlide() {
  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center px-[120px]">
      <p className="text-sm font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.2em] mb-4">
        The Comparison
      </p>
      <h2 className="text-[52px] font-bold text-foreground font-['Urbanist'] mb-16 leading-tight text-center">
        Cut Screening Time by Up to 80%
      </h2>

      <div className="flex gap-10 w-full max-w-[1300px]">
        {/* Traditional */}
        <div className="flex-1 rounded-2xl border-2 border-red-200 bg-red-50/50 p-10">
          <h3 className="text-2xl font-bold text-foreground font-['Urbanist'] mb-2">Traditional Hiring</h3>
          <p className="text-sm text-muted-foreground mb-8">7+ steps · weeks of effort</p>
          <div className="space-y-4">
            {TRADITIONAL.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <X className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-sm text-foreground">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-red-200">
            <p className="text-sm text-muted-foreground">Average time to hire</p>
            <p className="text-[36px] font-black text-red-500 font-['Urbanist']">34-52 days</p>
          </div>
        </div>

        {/* Lansa */}
        <div className="flex-1 rounded-2xl border-2 border-[hsl(var(--lansa-blue))] bg-[hsl(var(--lansa-muted))] p-10 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-[hsl(var(--lansa-orange))] text-white text-xs font-bold px-3 py-1 rounded-full">
            RECOMMENDED
          </div>
          <h3 className="text-2xl font-bold text-foreground font-['Urbanist'] mb-2">Hiring with Lansa</h3>
          <p className="text-sm text-muted-foreground mb-8">6 steps · minutes of effort</p>
          <div className="space-y-4">
            {LANSA.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--lansa-blue))] flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-foreground font-medium">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-[hsl(var(--lansa-blue))]/20">
            <p className="text-sm text-muted-foreground">Average time to hire</p>
            <p className="text-[36px] font-black text-[hsl(var(--lansa-blue))] font-['Urbanist']">3-7 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
