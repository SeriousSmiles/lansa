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
    <div className="w-full min-h-full lg:h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Traditional */}
      <div className="flex-1 lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80)" }}
        />
        <div className="absolute inset-0 bg-red-950/80" />
        <div className="relative z-10 flex flex-col justify-center px-6 py-8 md:px-10 md:py-8 lg:px-14 lg:py-12 lg:h-full">
          <p className="text-red-300/60 text-[11px] lg:text-[13px] font-semibold uppercase tracking-[0.25em] mb-2 lg:mb-4 font-['Urbanist']">Traditional Hiring</p>
          <h3 className="font-['Urbanist'] mb-1 lg:mb-2">
            <span className="text-[28px] md:text-[36px] lg:text-[44px] font-extralight text-white/90 leading-tight block">The Old</span>
            <span className="text-[32px] md:text-[40px] lg:text-[52px] font-black text-white leading-tight block">Way</span>
          </h3>
          <p className="text-white/30 text-[12px] lg:text-[13px] font-['Urbanist'] mb-4 lg:mb-8">7+ steps · weeks of effort</p>
          <div className="space-y-2 lg:space-y-3 mb-6 lg:mb-10">
            {TRADITIONAL.map((step, i) => (
              <div key={i} className="flex items-center gap-2 lg:gap-3">
                <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <X className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-red-400" />
                </div>
                <span className="text-[13px] lg:text-[14px] text-white/60 font-['Urbanist']">{step}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 lg:pt-6">
            <p className="text-white/30 text-[12px] lg:text-[13px] font-['Urbanist']">Average time to hire</p>
            <p className="text-[32px] lg:text-[48px] font-black text-red-400 font-['Urbanist'] leading-none">34-52 days</p>
          </div>
        </div>
      </div>

      {/* Lansa */}
      <div className="flex-1 lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80)" }}
        />
        <div className="absolute inset-0 bg-[hsl(215,85%,12%)]/85" />
        <div className="relative z-10 flex flex-col justify-center px-6 py-8 pb-20 md:px-10 md:py-8 lg:px-14 lg:py-12 lg:h-full lg:pb-12">
          <div className="absolute top-4 right-4 lg:top-8 lg:right-8 bg-[hsl(var(--lansa-orange))] text-white text-[10px] lg:text-[11px] font-bold px-2.5 py-0.5 lg:px-3 lg:py-1 rounded-full font-['Urbanist']">
            RECOMMENDED
          </div>
          <p className="text-[hsl(var(--lansa-orange))]/60 text-[11px] lg:text-[13px] font-semibold uppercase tracking-[0.25em] mb-2 lg:mb-4 font-['Urbanist']">Hiring with Lansa</p>
          <h3 className="font-['Urbanist'] mb-1 lg:mb-2">
            <span className="text-[28px] md:text-[36px] lg:text-[44px] font-extralight text-white/90 leading-tight block">The Smart</span>
            <span className="text-[32px] md:text-[40px] lg:text-[52px] font-black text-white leading-tight block">Way</span>
          </h3>
          <p className="text-white/30 text-[12px] lg:text-[13px] font-['Urbanist'] mb-4 lg:mb-8">6 steps · minutes of effort</p>
          <div className="space-y-2 lg:space-y-3 mb-6 lg:mb-10">
            {LANSA.map((step, i) => (
              <div key={i} className="flex items-center gap-2 lg:gap-3">
                <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-[hsl(var(--lansa-blue))]/20 flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-[hsl(var(--lansa-blue))]" />
                </div>
                <span className="text-[13px] lg:text-[14px] text-white/80 font-medium font-['Urbanist']">{step}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 lg:pt-6">
            <p className="text-white/30 text-[12px] lg:text-[13px] font-['Urbanist']">Average time to hire</p>
            <p className="text-[32px] lg:text-[48px] font-black text-[hsl(var(--lansa-blue))] font-['Urbanist'] leading-none">3-7 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
