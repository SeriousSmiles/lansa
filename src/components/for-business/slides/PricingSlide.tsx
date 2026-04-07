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
    <div className="w-full h-full relative overflow-hidden">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&q=80)" }}
      />
      <div className="absolute inset-0 bg-[hsl(215,85%,8%)]/92" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-[120px]">
        <p className="text-[13px] font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.25em] mb-4 font-['Urbanist']">
          Simple Pricing
        </p>
        <h2 className="font-['Urbanist'] mb-3 text-center">
          <span className="text-[56px] font-extralight text-white leading-[1.1]">Start Free. </span>
          <span className="text-[56px] font-black text-white leading-[1.1]">Scale When Ready.</span>
        </h2>
        <p className="text-[16px] text-white/40 font-['Urbanist'] font-light mb-12 text-center max-w-[500px]">
          No contracts, no hidden fees. Upgrade or cancel anytime.
        </p>

        <div className="flex gap-8 w-full max-w-[1000px]">
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
            className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-10 text-left hover:bg-white/10 transition-all duration-200 cursor-pointer group"
          >
            <p className="text-[13px] font-semibold text-white/40 mb-1 font-['Urbanist']">Basic</p>
            <p className="text-[52px] font-black text-white font-['Urbanist'] leading-none mb-8">Free</p>
            <div className="space-y-3 mb-8">
              {BASIC_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  {f.included ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-white/20" />
                  )}
                  <span className={`text-[14px] font-['Urbanist'] ${f.included ? "text-white/70" : "text-white/20"}`}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full py-3 rounded-lg bg-white/10 text-center text-[14px] font-semibold text-white font-['Urbanist'] group-hover:bg-white/20 transition-colors">
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
            className="flex-1 bg-white/5 backdrop-blur-md border border-[hsl(var(--lansa-blue))]/30 rounded-2xl p-10 text-left hover:bg-white/10 transition-all duration-200 cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute top-6 right-6 bg-[hsl(var(--lansa-orange))] text-white text-[11px] font-bold px-3 py-1 rounded-full font-['Urbanist']">
              RECOMMENDED
            </div>
            <p className="text-[13px] font-semibold text-[hsl(var(--lansa-blue))] mb-1 font-['Urbanist']">Premium</p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-[52px] font-black text-white font-['Urbanist'] leading-none">XCG 75</span>
              <span className="text-[16px] text-white/40 font-['Urbanist']">/month</span>
            </div>
            <div className="space-y-3 mb-8">
              {PREMIUM_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-[14px] text-white/70 font-['Urbanist']">{f.label}</span>
                </div>
              ))}
            </div>
            <div className="w-full py-3 rounded-lg bg-[hsl(var(--lansa-blue))] text-center text-[14px] font-semibold text-white font-['Urbanist'] group-hover:opacity-90 transition-opacity">
              Start Premium
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
