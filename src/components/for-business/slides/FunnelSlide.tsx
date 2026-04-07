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
    <div className="w-full h-full flex overflow-hidden">
      {/* Left — Traditional (red-tinted photo background) */}
      <div className="w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80)" }}
        />
        <div className="absolute inset-0 bg-red-950/80" />
        <div className="relative z-10 h-full flex flex-col justify-center px-14 py-12">
          <p className="text-red-300/60 text-[13px] font-semibold uppercase tracking-[0.25em] mb-4 font-['Urbanist']">Traditional Hiring</p>
          <h3 className="font-['Urbanist'] mb-2">
            <span className="text-[44px] font-extralight text-white/90 leading-tight block">The Old</span>
            <span className="text-[52px] font-black text-white leading-tight block">Way</span>
          </h3>
          <p className="text-white/30 text-[13px] font-['Urbanist'] mb-8">7+ steps · weeks of effort</p>
          <div className="space-y-3 mb-10">
            {TRADITIONAL.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <X className="h-3 w-3 text-red-400" />
                </div>
                <span className="text-[14px] text-white/60 font-['Urbanist']">{step}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6">
            <p className="text-white/30 text-[13px] font-['Urbanist']">Average time to hire</p>
            <p className="text-[48px] font-black text-red-400 font-['Urbanist'] leading-none">34-52 days</p>
          </div>
        </div>
      </div>

      {/* Right — Lansa (blue-tinted photo background) */}
      <div className="w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80)" }}
        />
        <div className="absolute inset-0 bg-[hsl(215,85%,12%)]/85" />
        <div className="relative z-10 h-full flex flex-col justify-center px-14 py-12">
          <div className="absolute top-8 right-8 bg-[hsl(var(--lansa-orange))] text-white text-[11px] font-bold px-3 py-1 rounded-full font-['Urbanist']">
            RECOMMENDED
          </div>
          <p className="text-[hsl(var(--lansa-orange))]/60 text-[13px] font-semibold uppercase tracking-[0.25em] mb-4 font-['Urbanist']">Hiring with Lansa</p>
          <h3 className="font-['Urbanist'] mb-2">
            <span className="text-[44px] font-extralight text-white/90 leading-tight block">The Smart</span>
            <span className="text-[52px] font-black text-white leading-tight block">Way</span>
          </h3>
          <p className="text-white/30 text-[13px] font-['Urbanist'] mb-8">6 steps · minutes of effort</p>
          <div className="space-y-3 mb-10">
            {LANSA.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--lansa-blue))]/20 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-[hsl(var(--lansa-blue))]" />
                </div>
                <span className="text-[14px] text-white/80 font-medium font-['Urbanist']">{step}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6">
            <p className="text-white/30 text-[13px] font-['Urbanist']">Average time to hire</p>
            <p className="text-[48px] font-black text-[hsl(var(--lansa-blue))] font-['Urbanist'] leading-none">3-7 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
