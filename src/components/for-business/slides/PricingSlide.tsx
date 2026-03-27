import { DetailContent } from "../DetailSheet";
import { Check, X, ShieldCheck } from "lucide-react";

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
    <div className="w-full h-full bg-white flex flex-col items-center justify-center px-[120px]">
      <p className="text-sm font-semibold text-[hsl(var(--lansa-orange))] uppercase tracking-[0.2em] mb-4">
        Simple Pricing
      </p>
      <h2 className="text-[52px] font-bold text-foreground font-['Urbanist'] mb-4 leading-tight">
        Start Free. Scale When Ready.
      </h2>
      <p className="text-lg text-muted-foreground mb-14 text-center max-w-[600px]">
        No contracts, no hidden fees. Upgrade or cancel anytime.
      </p>

      <div className="flex gap-8 w-full max-w-[1100px]">
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
          className="flex-1 border-2 border-border rounded-2xl p-10 text-left hover:shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <p className="text-sm font-semibold text-muted-foreground mb-1">Basic</p>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-[48px] font-black text-foreground font-['Urbanist']">Free</span>
          </div>
          <div className="space-y-3 mb-8">
            {BASIC_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                {f.included ? (
                  <Check className="h-4 w-4 text-[hsl(160,84%,39%)]" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground/30" />
                )}
                <span className={`text-sm ${f.included ? "text-foreground" : "text-muted-foreground/50"}`}>
                  {f.label}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full py-3 rounded-lg bg-accent text-center text-sm font-semibold text-foreground">
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
          className="flex-1 border-2 border-[hsl(var(--lansa-blue))] rounded-2xl p-10 text-left hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden group bg-[hsl(var(--lansa-muted))]"
        >
          <div className="absolute top-4 right-4 bg-[hsl(var(--lansa-orange))] text-white text-xs font-bold px-3 py-1 rounded-full">
            RECOMMENDED
          </div>
          <p className="text-sm font-semibold text-[hsl(var(--lansa-blue))] mb-1">Premium</p>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-[48px] font-black text-foreground font-['Urbanist']">XCG 75</span>
            <span className="text-lg text-muted-foreground">/month</span>
          </div>
          <div className="space-y-3 mb-8">
            {PREMIUM_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-[hsl(160,84%,39%)]" />
                <span className="text-sm text-foreground">{f.label}</span>
              </div>
            ))}
          </div>
          <div className="w-full py-3 rounded-lg bg-[hsl(var(--lansa-blue))] text-center text-sm font-semibold text-white">
            Start Premium
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2 mt-10">
        <ShieldCheck className="h-4 w-4 text-[hsl(var(--lansa-blue))]" />
        <p className="text-sm text-muted-foreground">
          Every candidate on Lansa has passed a sector-specific certification exam — you only see verified talent, on any plan.
        </p>
      </div>
    </div>
  );
}
