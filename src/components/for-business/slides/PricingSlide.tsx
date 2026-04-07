import { DetailContent } from "../DetailSheet";
import { Check, X } from "lucide-react";

interface PricingSlideProps {
  openDetail: (content: DetailContent) => void;
}

const BASIC_FEATURES = [
  { label: "10 candidate swipes / month", included: true },
  { label: "Job posting wizard", included: true },
  { label: "In-app messaging", included: true },
  { label: "Lansa Certified candidates", included: true },
  { label: "AI candidate summaries", included: false },
  { label: "Priority job listings", included: false },
  { label: "Hiring analytics dashboard", included: false },
];

const PREMIUM_FEATURES = [
  { label: "Unlimited candidate swipes", included: true },
  { label: "Job posting wizard", included: true },
  { label: "In-app messaging", included: true },
  { label: "Lansa Certified candidates", included: true },
  { label: "AI candidate summaries", included: true },
  { label: "Priority job listings", included: true },
  { label: "Hiring analytics dashboard", included: true },
];

export function PricingSlide({ openDetail }: PricingSlideProps) {
  return (
    <div className="w-full min-h-full lg:h-full relative overflow-hidden">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&q=80)" }}
      />
      <div className="absolute inset-0 bg-[hsl(215,85%,8%)]/95" />

      <div className="relative z-10 min-h-full lg:h-full flex flex-col items-center justify-center px-6 md:px-10 lg:px-[120px] py-8 lg:py-0">
        <p className="text-[12px] lg:text-[13px] font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.25em] mb-3 lg:mb-4 font-['Urbanist']">
          Simple Pricing
        </p>
        <h2 className="font-['Urbanist'] mb-2 lg:mb-3 text-center">
          <span className="text-[28px] md:text-[40px] lg:text-[56px] font-extralight text-white leading-[1.1]">Start Free. </span>
          <span className="text-[28px] md:text-[40px] lg:text-[56px] font-black text-white leading-[1.1]">Scale When Ready.</span>
        </h2>
        <p className="text-[13px] lg:text-[16px] text-white/40 font-['Urbanist'] font-light mb-6 lg:mb-12 text-center max-w-[500px]">
          No contracts, no hidden fees. Upgrade or cancel anytime.
        </p>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 w-full max-w-[500px] lg:max-w-[1000px]">
          {/* Basic */}
          <button
            onClick={() => openDetail({
              title: "Basic Plan — Free",
              description: "Perfect for small businesses testing the Lansa platform.",
              bullets: [
                "10 candidate swipes per month to explore the talent pool",
                "Full access to the job posting wizard with templates",
                "In-app messaging with matched candidates",
                "All candidates are Lansa Certified — same quality on every plan",
                "Organization profile with your branding",
                "Upgrade to Premium anytime — no lock-in"
              ],
              stat: "Free forever"
            })}
            className="flex-1 bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl lg:rounded-2xl p-6 lg:p-10 text-left hover:bg-white/15 transition-all duration-200 cursor-pointer group"
          >
            <p className="text-[12px] lg:text-[13px] font-semibold text-white/40 mb-1 font-['Urbanist']">Basic</p>
            <p className="text-[36px] lg:text-[52px] font-black text-white font-['Urbanist'] leading-none mb-4 lg:mb-8">Free</p>
            <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-8">
              {BASIC_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2 lg:gap-3">
                  {f.included ? (
                    <Check className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-emerald-400" />
                  ) : (
                    <X className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-white/20" />
                  )}
                  <span className={`text-[13px] lg:text-[14px] font-['Urbanist'] ${f.included ? "text-white/70" : "text-white/20"}`}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full py-2.5 lg:py-3 rounded-lg bg-white/10 text-center text-[13px] lg:text-[14px] font-semibold text-white font-['Urbanist'] group-hover:bg-white/20 transition-colors">
              Get Started Free
            </div>
          </button>

          {/* Premium */}
          <button
            onClick={() => openDetail({
              title: "Premium Plan — XCG 75/month",
              description: "For businesses ready to hire at scale with full platform power.",
              bullets: [
                "Unlimited candidate swipes — browse the entire certified talent pool",
                "AI-powered candidate summaries save hours of manual review",
                "Priority job listings appear at the top of candidate feeds",
                "Full hiring analytics dashboard with pipeline tracking",
                "Everything in Basic, plus advanced features",
                "Dedicated support for onboarding your team"
              ],
              stat: "XCG 75/mo"
            })}
            className="flex-1 bg-white/10 backdrop-blur-xl border border-[hsl(var(--lansa-blue))]/40 rounded-xl lg:rounded-2xl p-6 lg:p-10 text-left hover:bg-white/15 transition-all duration-200 cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute top-4 right-4 lg:top-6 lg:right-6 bg-[hsl(var(--lansa-orange))] text-white text-[10px] lg:text-[11px] font-bold px-2.5 py-0.5 lg:px-3 lg:py-1 rounded-full font-['Urbanist']">
              RECOMMENDED
            </div>
            <p className="text-[12px] lg:text-[13px] font-semibold text-[hsl(var(--lansa-blue))] mb-1 font-['Urbanist']">Premium</p>
            <div className="flex items-baseline gap-2 mb-4 lg:mb-8">
              <span className="text-[36px] lg:text-[52px] font-black text-white font-['Urbanist'] leading-none">XCG 75</span>
              <span className="text-[14px] lg:text-[16px] text-white/40 font-['Urbanist']">/month</span>
            </div>
            <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-8">
              {PREMIUM_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2 lg:gap-3">
                  <Check className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-emerald-400" />
                  <span className="text-[13px] lg:text-[14px] text-white/70 font-['Urbanist']">{f.label}</span>
                </div>
              ))}
            </div>
            <div className="w-full py-2.5 lg:py-3 rounded-lg bg-[hsl(var(--lansa-blue))] text-center text-[13px] lg:text-[14px] font-semibold text-white font-['Urbanist'] group-hover:opacity-90 transition-opacity">
              Start Premium
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
